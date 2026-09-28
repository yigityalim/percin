import { CliError } from "./error.js"
import type {
  CommandHandler,
  InputValue,
  ReservedInputKey,
  RuntimeInput,
  RuntimeServices,
} from "./types.js"
import type {
  InferArgument,
  InferOption,
  Presence,
  RuntimeValueSpec,
  ValueBuilder,
} from "./value.js"

export interface ArgumentDefinition {
  readonly name: string
  readonly value: RuntimeValueSpec
}

export interface OptionDefinition {
  readonly name: string
  readonly value: RuntimeValueSpec
}

export interface CommandDefinition {
  readonly name: string
  readonly description: string | undefined
  readonly arguments: readonly ArgumentDefinition[]
  readonly options: readonly OptionDefinition[]
  execute(input: RuntimeInput, services: RuntimeServices): Promise<void>
}

type AddInput<TInput extends object, TName extends string, TValue> = Omit<TInput, TName> &
  Readonly<Record<TName, TValue>>

type SafeName<TName extends string> = TName extends ReservedInputKey ? never : TName

export class CommandBuilder<TInput extends object = Record<never, never>> {
  private readonly commandName: string
  private readonly commandDescription: string | undefined
  private readonly argumentDefinitions: readonly ArgumentDefinition[]
  private readonly optionDefinitions: readonly OptionDefinition[]

  constructor(
    name: string,
    state: {
      readonly description: string | undefined
      readonly arguments?: readonly ArgumentDefinition[]
      readonly options?: readonly OptionDefinition[]
    } = { description: undefined },
  ) {
    if (!name || name.startsWith("-")) {
      throw new CliError("INVALID_DEFINITION", `Invalid command name: ${name}`)
    }

    this.commandName = name
    this.commandDescription = state.description
    this.argumentDefinitions = state.arguments ?? []
    this.optionDefinitions = state.options ?? []
  }

  description(description: string): CommandBuilder<TInput> {
    return new CommandBuilder<TInput>(this.commandName, {
      description,
      arguments: this.argumentDefinitions,
      options: this.optionDefinitions,
    })
  }

  arg<const TName extends string, TValue extends ValueBuilder<InputValue, Presence>>(
    name: SafeName<TName>,
    value: TValue,
  ): CommandBuilder<AddInput<TInput, TName, InferArgument<TValue>>> {
    this.assertAvailable(name)

    const previousArgument = this.argumentDefinitions.at(-1)
    const nextRuntime = value.runtime()

    if (previousArgument?.value.presence === "optional" && nextRuntime.presence !== "optional") {
      throw new CliError(
        "INVALID_DEFINITION",
        `Required argument "${name}" cannot follow an optional argument`,
      )
    }

    return new CommandBuilder<AddInput<TInput, TName, InferArgument<TValue>>>(this.commandName, {
      description: this.commandDescription,
      arguments: [...this.argumentDefinitions, { name, value: nextRuntime }],
      options: this.optionDefinitions,
    })
  }

  option<const TName extends string, TValue extends ValueBuilder<InputValue, Presence>>(
    name: SafeName<TName>,
    value: TValue,
  ): CommandBuilder<AddInput<TInput, TName, InferOption<TValue>>> {
    this.assertAvailable(name)

    if (name === "help" || name === "version") {
      throw new CliError("INVALID_DEFINITION", `Option "${name}" is reserved`)
    }

    const runtime = value.runtime()
    const short = runtime.short

    if (short) {
      const duplicateShort = this.optionDefinitions.some((option) => option.value.short === short)

      if (duplicateShort) {
        throw new CliError(
          "INVALID_DEFINITION",
          `Duplicate short option -${short} in ${this.commandName}`,
        )
      }
    }

    return new CommandBuilder<AddInput<TInput, TName, InferOption<TValue>>>(this.commandName, {
      description: this.commandDescription,
      arguments: this.argumentDefinitions,
      options: [...this.optionDefinitions, { name, value: runtime }],
    })
  }

  handle(handler: CommandHandler<TInput>): CommandDefinition {
    const name = this.commandName
    const description = this.commandDescription
    const argumentsList = this.argumentDefinitions
    const options = this.optionDefinitions

    return {
      name,
      description,
      arguments: argumentsList,
      options,
      execute: async (input, services) => {
        await handler({
          ...input,
          ...services,
        } as Readonly<TInput> & RuntimeServices)
      },
    }
  }

  private assertAvailable(name: string): void {
    const duplicate =
      this.argumentDefinitions.some((argument) => argument.name === name) ||
      this.optionDefinitions.some((option) => option.name === name)

    if (duplicate) {
      throw new CliError(
        "DUPLICATE_INPUT",
        `Input "${name}" is already defined in ${this.commandName}`,
      )
    }
  }
}

export function command(name: string): CommandBuilder {
  return new CommandBuilder(name)
}
