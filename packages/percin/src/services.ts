import { createHash, randomBytes } from "node:crypto"
import { constants } from "node:fs"
import { access, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import type {
  AuthService,
  Binary,
  CryptoService,
  DigestAlgorithm,
  DigestEncoding,
  FsService,
  Headers,
  RuntimeServices,
  UiService,
} from "./types.js"

const encoder = new TextEncoder()

function createFsService(): FsService {
  return {
    async read(path) {
      const value = await readFile(path)
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    },

    readText(path) {
      return readFile(path, "utf8")
    },

    async write(path, data) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, data)
    },

    async writeText(path, data) {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, data, "utf8")
    },

    async copy(source, destination, options = {}) {
      await mkdir(dirname(destination), { recursive: true })
      await copyFile(source, destination, options.overwrite ? 0 : constants.COPYFILE_EXCL)
    },

    async exists(path) {
      try {
        await access(path)
        return true
      } catch {
        return false
      }
    },

    async mkdir(path) {
      await mkdir(path, { recursive: true })
    },

    async stat(path) {
      const result = await stat(path)
      return {
        size: result.size,
        file: result.isFile(),
        directory: result.isDirectory(),
      }
    },
  }
}

function normalizeDigestInput(data: Binary | string): Binary {
  return typeof data === "string" ? encoder.encode(data) : data
}

function createCryptoService(): CryptoService {
  return {
    async digest(
      algorithm: DigestAlgorithm,
      data: Binary | string,
      encoding: DigestEncoding = "hex",
    ) {
      return createHash(algorithm).update(normalizeDigestInput(data)).digest(encoding)
    },

    random(bytes) {
      const result = randomBytes(bytes)
      return new Uint8Array(result.buffer, result.byteOffset, result.byteLength)
    },
  }
}

function encodeBasic(value: string): string {
  return Buffer.from(value, "utf8").toString("base64")
}

function createAuthService(): AuthService {
  return {
    bearer(token): Headers {
      return {
        authorization: `Bearer ${token}`,
      }
    },

    basic(username, password): Headers {
      return {
        authorization: `Basic ${encodeBasic(`${username}:${password}`)}`,
      }
    },
  }
}

function createUiService(): UiService {
  return {
    log(message) {
      process.stdout.write(`${message}\n`)
    },

    success(message) {
      process.stdout.write(`✓ ${message}\n`)
    },

    warn(message) {
      process.stderr.write(`warning: ${message}\n`)
    },

    error(message) {
      process.stderr.write(`error: ${message}\n`)
    },
  }
}

export function createRuntimeServices(signal: AbortSignal): RuntimeServices {
  return {
    fs: createFsService(),
    crypto: createCryptoService(),
    auth: createAuthService(),
    ui: createUiService(),
    signal,
  }
}
