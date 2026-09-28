# Tooling

The repository deliberately separates runtime concerns from maintainer tooling.

## Workspace and orchestration

pnpm owns workspace membership, dependency resolution, the shared catalog, and the lockfile. Turborepo only orchestrates tasks and caches deterministic outputs. `packages/percin` does not depend on Turbo at runtime or build time outside the repository.

The workspace already reserves `apps/*` for future documentation sites, playgrounds, benchmarks, or first-party applications. New publishable libraries belong in `packages/*`.

## TypeScript

The package is ESM-only and uses NodeNext module resolution. The shared TypeScript configuration enables strict mode, unchecked-index protection, exact optional properties, unused-code checks, unchecked side-effect import checks, and case-sensitive path consistency.

Public API inference is validated separately from runtime behavior. Type tests compile consumer-style usage without emitting JavaScript.

## Quality

Biome owns formatting and linting. Knip checks dead code, files, and dependency declarations. Runtime tests use the Node.js built-in test runner so the published package does not need a test framework dependency.

Package publication is validated with publint and Are The Types Wrong after the package is built. Runtime tests import `dist` rather than source files, so packaging and module-resolution errors are exercised before release.

## Supply chain

Direct development dependency versions are exact and centralized through the pnpm catalog. pnpm's minimum release age delays newly published dependency versions by 24 hours during resolution.

GitHub Actions references are pinned to full commit SHAs. `scripts/check-actions.mjs` enforces that invariant in the normal repository check. Dependabot is configured for both npm dependencies and GitHub Actions.

CodeQL scans JavaScript and TypeScript. Dependency Review checks pull requests for newly introduced high-severity vulnerable dependencies.

## Releases

Changesets records release intent and SemVer changes. The release workflow separates mode selection, versioning, packing, and publishing. Only the final publish job receives `id-token: write`.

npm publication is designed for OIDC trusted publishing and package provenance. The publish job is bound to a protected GitHub environment named `npm`; long-lived npm publish tokens are not part of the normal release path.
