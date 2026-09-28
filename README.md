# Percin

Percin is a fluent, type-safe TypeScript framework for building command-line applications.

It is intentionally small at runtime and strict at development time: the published `percin` package has no runtime dependencies, while the repository uses a modern monorepo toolchain for testing, packaging, release automation, and future applications.

## Install

```sh
pnpm add percin
```

Percin requires Node.js 22 or newer.

## Quick start

```ts
import { choice, cli, command, execute, path } from "percin"

const hash = command("hash")
  .description("Hash a file")
  .arg("file", path().exists())
  .option("algorithm", choice(["sha256", "sha512"]).default("sha256").short("a"))
  .handle(async ({ file, algorithm, fs, crypto, ui }) => {
    const data = await fs.read(file)
    const digest = await crypto.digest(algorithm, data)
    ui.log(digest)
  })

const app = cli("tool")
  .version("1.0.0")
  .command(hash)

process.exitCode = await execute(app)
```

```sh
tool hash package.json
tool hash package.json -a sha512
```

## Repository

```text
.
├── apps/                 future first-party applications
├── packages/
│   └── percin/           the public npm package
├── examples/             consumer examples
├── docs/                 architecture and maintainer documentation
├── .changeset/           release metadata
└── .github/              CI, security, and contribution automation
```

This is a pnpm workspace orchestrated by Turborepo. Keeping the package in `packages/percin` makes the repository ready for future packages and applications without forcing that complexity into the published runtime.

## Development

```sh
pnpm install
pnpm check
```

Useful commands:

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm format
pnpm knip
pnpm changeset
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Maintainer setup, tooling, and release details are in [docs/repository.md](./docs/repository.md), [docs/tooling.md](./docs/tooling.md), and [docs/releasing.md](./docs/releasing.md).

## Design principles

- Type inference is part of the public API.
- Fluent builders are immutable.
- The runtime package stays dependency-free unless a dependency earns its cost.
- Parsing, validation, execution, and runtime services stay separable.
- Public behavior is tested through the built package, not only source internals.
- Package metadata and TypeScript resolution are validated before release.

## License

MIT
