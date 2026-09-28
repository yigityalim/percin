# Contributing

Thanks for contributing to Percin. Contributions should keep the public API small, predictable, type-safe, and easy to inspect.

## Prerequisites

- Node.js 22.14 or newer
- pnpm 12.6.0, pinned by the repository `packageManager` field
- Git

## Setup

```sh
git clone https://github.com/yigityalim/percin.git
cd percin
pnpm install
pnpm check
```

## Development rules

- Preserve type information end-to-end. Do not introduce `any` into public or internal APIs.
- Prefer narrow types and explicit invariants over broad casts.
- Keep builders immutable; every fluent operation returns a new builder.
- Avoid runtime dependencies unless the capability cannot reasonably be implemented with the supported Node.js platform APIs.
- Prefer self-documenting code. Add comments only for non-obvious invariants, protocol constraints, or public API documentation.
- New behavior needs runtime tests. Type-level behavior needs type tests.
- Do not commit generated `dist`, coverage output, tarballs, or Turbo cache data.

## Before opening a pull request

Run:

```sh
pnpm check
pnpm knip
```

If the change affects the published package, add a Changeset:

```sh
pnpm changeset
```

Not every repository-only change needs a Changeset. Documentation, CI, tests, and internal tooling can be merged without one when they do not change the published package.

## Pull requests

Keep pull requests focused. Explain the user-visible behavior, type-level implications, and compatibility impact. Breaking changes should include a migration path when practical.

By contributing, you agree that your contribution is licensed under the repository MIT license and that you will follow the Code of Conduct.
