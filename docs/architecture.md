# Architecture

Percin separates authoring ergonomics from runtime execution.

```text
fluent builders
     ↓
immutable command definitions
     ↓
parser → validation → execution
                        ↓
                 runtime services
```

## Public DSL

The public DSL is intentionally fluent:

```ts
command("hash")
  .arg("file", path().exists())
  .option("algorithm", choice(["sha256", "sha512"]).default("sha256"))
  .handle(handler)
```

Each builder operation returns a new builder. This makes definitions deterministic, composable, and safe to reuse.

## Definitions

Builders compile authoring state into plain runtime definitions. Parsing and help rendering operate on those definitions instead of on fluent-builder internals.

## Type inference

Argument and option builders carry phantom output and presence types. Each chained input extends the handler input type, so handler values are inferred from the DSL without manually declared command interfaces.

## Runtime services

The handler receives platform capabilities such as filesystem, cryptography, auth headers, UI, and cancellation. The package currently implements these services with Node.js standard APIs and has no runtime dependencies.

## Package boundary

`packages/percin` is the only publishable workspace today. Root tooling never becomes a runtime dependency of the package. Future docs sites, playgrounds, benchmarks, or integration fixtures belong under `apps/` or as separate packages instead of being folded into the runtime package.
