import type { CommandDefinition } from "./command.js"
import type { RuntimeValueSpec } from "./value.js"

function argumentUsage(name: string, value: RuntimeValueSpec): string {
  return value.presence === "optional" ? `[${name}]` : `<${name}>`
}

function optionUsage(name: string, value: RuntimeValueSpec): string {
  const names = value.short ? `-${value.short}, --${name}` : `    --${name}`
  return value.kind === "flag" ? names : `${names} <value>`
}

function pad(rows: readonly [string, string][]): string {
  const width = rows.reduce((maximum, [left]) => Math.max(maximum, left.length), 0)
  return rows.map(([left, right]) => `  ${left.padEnd(width)}  ${right}`.trimEnd()).join("\n")
}

export function renderRootHelp(
  name: string,
  version: string | undefined,
  description: string | undefined,
  commands: readonly CommandDefinition[],
): string {
  const lines: string[] = []
  lines.push(version ? `${name} ${version}` : name)

  if (description) {
    lines.push("", description)
  }

  lines.push("", "USAGE", `  ${name} <command> [options]`)

  if (commands.length > 0) {
    lines.push(
      "",
      "COMMANDS",
      pad(commands.map((command) => [command.name, command.description ?? ""])),
    )
  }

  lines.push(
    "",
    "OPTIONS",
    pad([
      ["-h, --help", "Show help"],
      ["-V, --version", "Show version"],
    ]),
  )

  return `${lines.join("\n")}\n`
}

export function renderCommandHelp(appName: string, command: CommandDefinition): string {
  const lines: string[] = []
  lines.push(command.name)

  if (command.description) {
    lines.push("", command.description)
  }

  const argumentUsageText = command.arguments
    .map((argument) => argumentUsage(argument.name, argument.value))
    .join(" ")

  lines.push(
    "",
    "USAGE",
    `  ${appName} ${command.name}${argumentUsageText ? ` ${argumentUsageText}` : ""} [options]`,
  )

  if (command.arguments.length > 0) {
    lines.push(
      "",
      "ARGUMENTS",
      pad(
        command.arguments.map((argument) => [
          argumentUsage(argument.name, argument.value),
          argument.value.description ?? "",
        ]),
      ),
    )
  }

  const optionRows: [string, string][] = command.options.map((option) => [
    optionUsage(option.name, option.value),
    option.value.description ?? "",
  ])

  optionRows.push(["-h, --help", "Show help"])

  lines.push("", "OPTIONS", pad(optionRows))

  return `${lines.join("\n")}\n`
}
