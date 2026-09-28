# Agent Instructions

## Repository

Percin is a pnpm/Turborepo monorepo. The public package is `packages/percin`.

## Required checks

Before completing a code change, run:

```sh
pnpm check
pnpm knip
```

## Code constraints

- TypeScript is strict.
- Do not use `any`.
- Avoid broad assertions and type erasure.
- Keep the public API intentionally small.
- Keep `percin` free of runtime dependencies unless explicitly justified.
- Preserve immutable fluent builders.
- Add runtime tests for behavior and type tests for inference.
- Do not edit generated output under `dist`.
- Do not publish packages or change release credentials.
