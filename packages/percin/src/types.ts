export type Awaitable<T> = T | Promise<T>

export type DigestAlgorithm = "sha256" | "sha384" | "sha512"
export type DigestEncoding = "hex" | "base64" | "base64url"

export type Binary = Uint8Array

export type InputValue = string | number | boolean
export type RuntimeInput = Record<string, InputValue | undefined>

export type Headers = Readonly<Record<string, string>>

export interface FileStat {
  readonly size: number
  readonly file: boolean
  readonly directory: boolean
}

export interface FsService {
  read(path: string): Promise<Binary>
  readText(path: string): Promise<string>
  write(path: string, data: Binary): Promise<void>
  writeText(path: string, data: string): Promise<void>
  copy(
    source: string,
    destination: string,
    options?: { readonly overwrite?: boolean },
  ): Promise<void>
  exists(path: string): Promise<boolean>
  mkdir(path: string): Promise<void>
  stat(path: string): Promise<FileStat>
}

export interface CryptoService {
  digest(
    algorithm: DigestAlgorithm,
    data: Binary | string,
    encoding?: DigestEncoding,
  ): Promise<string>
  random(bytes: number): Binary
}

export interface AuthService {
  bearer(token: string): Headers
  basic(username: string, password: string): Headers
}

export interface UiService {
  log(message: string): void
  success(message: string): void
  warn(message: string): void
  error(message: string): void
}

export interface RuntimeServices {
  readonly fs: FsService
  readonly crypto: CryptoService
  readonly auth: AuthService
  readonly ui: UiService
  readonly signal: AbortSignal
}

export type ReservedInputKey = keyof RuntimeServices

export type CommandContext<TInput extends object> = Readonly<TInput> & RuntimeServices

export type CommandHandler<TInput extends object> = (
  context: CommandContext<TInput>,
) => Awaitable<void>
