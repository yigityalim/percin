import type { ArgumentDefinition, CommandDefinition, OptionDefinition } from "./command.js"
import { CliError } from "./error.js"
import type { InputValue, RuntimeInput } from "./types.js"
import type { RuntimeValueSpec } from "./value.js"

interface ParseResult {
  readonly input: RuntimeInput
  readonly help: boolean
}

interface TokenOption {
  readonly definition: OptionDefinition
  readonly inlineValue?: string
}

function parseScalar(raw: string, spec: RuntimeValueSpec, label: string): InputValue {
  switch (spec.kind) {
    case "string":
    case "path":
      return raw

    case "choice": {
      const choices = spec.choices ?? []
      if (!choices.includes(raw)) {
        throw new CliError(
          "INVALID_VALUE",
          `Invalid value for ${label}: ${raw}. Expected one of: ${choices.join(", ")}`,
        )
      }
      return raw
    }

    case "number": {
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throw new CliError("INVALID_VALUE", `Invalid number for ${label}: ${raw}`)
      }
      return value
    }

    case "flag":
      return true
  }
}

function resolveLongOption(command: CommandDefinition, token: string): TokenOption {
  const separator = token.indexOf("=")
  const name = separator === -1 ? token.slice(2) : token.slice(2, separator)
  const definition = command.options.find((option) => option.name === name)

  if (!definition) {
    throw new CliError("UNKNOWN_OPTION", `Unknown option --${name}`)
  }

  if (separator === -1) {
    return { definition }
  }

  return {
    definition,
    inlineValue: token.slice(separator + 1),
  }
}

function resolveShortOption(command: CommandDefinition, token: string): TokenOption {
  const short = token.slice(1)

  if (short.length !== 1) {
    throw new CliError("UNKNOWN_OPTION", `Combined short options are not supported: ${token}`)
  }

  const definition = command.options.find((option) => option.value.short === short)

  if (!definition) {
    throw new CliError("UNKNOWN_OPTION", `Unknown option -${short}`)
  }

  return { definition }
}

function optionValue(
  option: TokenOption,
  next: string | undefined,
): {
  readonly value: InputValue
  readonly consumeNext: boolean
} {
  const spec = option.definition.value

  if (spec.kind === "flag") {
    if (option.inlineValue !== undefined) {
      throw new CliError(
        "INVALID_VALUE",
        `Flag --${option.definition.name} does not accept a value`,
      )
    }

    return {
      value: true,
      consumeNext: false,
    }
  }

  const raw = option.inlineValue ?? next

  if (raw === undefined || raw.startsWith("-")) {
    throw new CliError("MISSING_OPTION", `Missing value for --${option.definition.name}`)
  }

  return {
    value: parseScalar(raw, spec, `--${option.definition.name}`),
    consumeNext: option.inlineValue === undefined,
  }
}

function initializeDefaults(command: CommandDefinition): RuntimeInput {
  const input: RuntimeInput = {}

  for (const option of command.options) {
    if (option.value.kind === "flag") {
      input[option.name] = option.value.defaultValue ?? false
      continue
    }

    if (option.value.presence === "defaulted") {
      input[option.name] = option.value.defaultValue
    }
  }

  return input
}

function assertRequiredOptions(command: CommandDefinition, input: RuntimeInput): void {
  for (const option of command.options) {
    if (option.value.presence === "required" && input[option.name] === undefined) {
      throw new CliError("MISSING_OPTION", `Missing required option --${option.name}`)
    }
  }
}

function parseArguments(
  definitions: readonly ArgumentDefinition[],
  rawArguments: readonly string[],
  input: RuntimeInput,
): void {
  if (rawArguments.length > definitions.length) {
    const extra = rawArguments.slice(definitions.length).join(" ")
    throw new CliError("TOO_MANY_ARGUMENTS", `Unexpected argument: ${extra}`)
  }

  definitions.forEach((definition, index) => {
    const raw = rawArguments[index]

    if (raw === undefined) {
      if (definition.value.presence === "optional") {
        input[definition.name] = undefined
        return
      }

      if (definition.value.presence === "defaulted") {
        input[definition.name] = definition.value.defaultValue
        return
      }

      throw new CliError("MISSING_ARGUMENT", `Missing required argument <${definition.name}>`)
    }

    input[definition.name] = parseScalar(raw, definition.value, `<${definition.name}>`)
  })
}

export function parseCommand(command: CommandDefinition, argv: readonly string[]): ParseResult {
  const input = initializeDefaults(command)
  const positionals: string[] = []
  let help = false

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === undefined) {
      continue
    }

    if (token === "--help" || token === "-h") {
      help = true
      continue
    }

    if (token === "--") {
      positionals.push(...argv.slice(index + 1))
      break
    }

    if (token.startsWith("--")) {
      const option = resolveLongOption(command, token)
      const result = optionValue(option, argv[index + 1])
      input[option.definition.name] = result.value

      if (result.consumeNext) {
        index += 1
      }

      continue
    }

    if (token.startsWith("-") && token !== "-") {
      const option = resolveShortOption(command, token)
      const result = optionValue(option, argv[index + 1])
      input[option.definition.name] = result.value

      if (result.consumeNext) {
        index += 1
      }

      continue
    }

    positionals.push(token)
  }

  if (!help) {
    assertRequiredOptions(command, input)
    parseArguments(command.arguments, positionals, input)
  }

  return { input, help }
}
