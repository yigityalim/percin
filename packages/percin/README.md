# @yigityalim/percin

A fluent, type-safe TypeScript framework for building command-line applications.

## Install

```sh
pnpm add @yigityalim/percin
```

Requires Node.js 22 or newer.

## Usage

```ts
import { choice, cli, command, execute, flag, path } from "@yigityalim/percin"

const copy = command("copy")
  .description("Copy and hash a file")
  .arg("source", path().exists())
  .arg("destination", path())
  .option("algorithm", choice(["sha256", "sha512"]).default("sha256").short("a"))
  .option("force", flag().short("f"))
  .handle(async ({ source, destination, algorithm, force, fs, crypto, ui }) => {
    const data = await fs.read(source)
    const digest = await crypto.digest(algorithm, data)

    await fs.copy(source, destination, { overwrite: force })
    ui.success(`${destination} ${digest}`)
  })

const app = cli("files")
  .version("1.0.0")
  .description("File utilities")
  .command(copy)

process.exitCode = await execute(app)
```

Percin currently provides:

- immutable fluent command and CLI builders
- inferred positional arguments and options
- strings, numbers, choices, paths, and flags
- defaults, required values, optional values, and short options
- generated root and command help
- structured CLI errors and exit codes
- path existence validation
- filesystem, cryptography, auth-header, UI, and cancellation runtime services
- ESM output with declarations and source maps
- zero runtime dependencies

## Package policy

Percin follows Semantic Versioning. During `0.x`, minor releases may contain API changes that would be major changes after `1.0`.

Source, contribution guidelines, security policy, and release history live in the main repository.
