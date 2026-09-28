import type { CommandDefinition } from "./command.js"
import { CliError } from "./error.js"
import type { FsService, RuntimeInput } from "./types.js"

export async function validateInput(
  command: CommandDefinition,
  input: RuntimeInput,
  fs: FsService,
): Promise<void> {
  const values = [...command.arguments, ...command.options]

  for (const definition of values) {
    if (!definition.value.pathMustExist) {
      continue
    }

    const value = input[definition.name]

    if (typeof value !== "string") {
      continue
    }

    if (!(await fs.exists(value))) {
      throw new CliError("PATH_NOT_FOUND", `Path does not exist for ${definition.name}: ${value}`)
    }
  }
}
