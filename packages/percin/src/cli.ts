import type { CommandDefinition } from "./command.js"
import { CliError } from "./error.js"
import { renderCommandHelp, renderRootHelp } from "./help.js"
import { parseCommand } from "./parser.js"
import { createRuntimeServices } from "./services.js"
import { validateInput } from "./validate.js"

interface CliApplication {
  readonly name: string
  readonly appVersion: string | undefined
  readonly appDescription: string | undefined
  readonly commands: readonly CommandDefinition[]
}

class CliBuilder {
  private readonly appName: string
  private readonly appVersion: string | undefined
  private readonly appDescription: string | undefined
  private readonly commandDefinitions: readonly CommandDefinition[]

  constructor(
    name: string,
    state: {
      readonly version: string | undefined
      readonly description: string | undefined
      readonly commands?: readonly CommandDefinition[]
    } = { version: undefined, description: undefined },
  ) {
    if (!name || name.startsWith("-")) {
      throw new CliError("INVALID_DEFINITION", `Invalid CLI name: ${name}`)
    }

    this.appName = name
    this.appVersion = state.version
    this.appDescription = state.description
    this.commandDefinitions = state.commands ?? []
  }

  version(version: string): CliBuilder {
    return new CliBuilder(this.appName, {
      version,
      description: this.appDescription,
      commands: this.commandDefinitions,
    })
  }

  description(description: string): CliBuilder {
    return new CliBuilder(this.appName, {
      version: this.appVersion,
      description,
      commands: this.commandDefinitions,
    })
  }

  command(command: CommandDefinition): CliBuilder {
    const duplicate = this.commandDefinitions.some((existing) => existing.name === command.name)

    if (duplicate) {
      throw new CliError("INVALID_DEFINITION", `Command "${command.name}" is already registered`)
    }

    return new CliBuilder(this.appName, {
      version: this.appVersion,
      description: this.appDescription,
      commands: [...this.commandDefinitions, command],
    })
  }

  build(): CliApplication {
    return {
      name: this.appName,
      appVersion: this.appVersion,
      appDescription: this.appDescription,
      commands: this.commandDefinitions,
    }
  }
}

export function cli(name: string): CliBuilder {
  return new CliBuilder(name)
}

export async function execute(
  builder: CliBuilder | CliApplication,
  argv: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const application = builder instanceof CliBuilder ? builder.build() : builder
  const controller = new AbortController()
  const abort = () => controller.abort()

  process.once("SIGINT", abort)
  process.once("SIGTERM", abort)

  try {
    if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
      process.stdout.write(
        renderRootHelp(
          application.name,
          application.appVersion,
          application.appDescription,
          application.commands,
        ),
      )
      return 0
    }

    if (argv[0] === "--version" || argv[0] === "-V") {
      process.stdout.write(`${application.appVersion ?? "0.0.0"}\n`)
      return 0
    }

    const commandName = argv[0]
    const command = application.commands.find((candidate) => candidate.name === commandName)

    if (!command) {
      throw new CliError("UNKNOWN_COMMAND", `Unknown command: ${commandName}`)
    }

    const parsed = parseCommand(command, argv.slice(1))

    if (parsed.help) {
      process.stdout.write(renderCommandHelp(application.name, command))
      return 0
    }

    const services = createRuntimeServices(controller.signal)
    await validateInput(command, parsed.input, services.fs)
    await command.execute(parsed.input, services)
    return 0
  } catch (error) {
    if (error instanceof CliError) {
      process.stderr.write(`error: ${error.message}\n`)
      if (error.hint) {
        process.stderr.write(`hint: ${error.hint}\n`)
      }
      return error.exitCode
    }

    if (error instanceof Error) {
      process.stderr.write(`error: ${error.message}\n`)
      return 1
    }

    process.stderr.write("error: Unknown failure\n")
    return 1
  } finally {
    process.off("SIGINT", abort)
    process.off("SIGTERM", abort)
  }
}
