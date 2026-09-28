export type CliErrorCode =
  | "UNKNOWN_COMMAND"
  | "UNKNOWN_OPTION"
  | "MISSING_ARGUMENT"
  | "MISSING_OPTION"
  | "INVALID_VALUE"
  | "TOO_MANY_ARGUMENTS"
  | "DUPLICATE_INPUT"
  | "INVALID_DEFINITION"
  | "PATH_NOT_FOUND"

export class CliError extends Error {
  readonly code: CliErrorCode
  readonly exitCode: number
  readonly hint: string | undefined

  constructor(
    code: CliErrorCode,
    message: string,
    options: {
      readonly exitCode?: number
      readonly hint?: string
    } = {},
  ) {
    super(message)
    this.name = "CliError"
    this.code = code
    this.exitCode = options.exitCode ?? 1
    this.hint = options.hint
  }
}
