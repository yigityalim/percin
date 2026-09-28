# Releasing

Percin uses Changesets for version intent and GitHub Actions for versioning and publication.

## Contributor flow

A pull request that changes published behavior should include:

```sh
pnpm changeset
```

The Changeset records the SemVer bump and release note without changing the package version immediately.

## Maintainer flow

Pushes to `main` run `.github/workflows/release.yml`.

- Pending Changesets produce or update a version pull request.
- Merging the version pull request creates a publish plan.
- The package is built and packed separately from the publish job.
- Only the publish job receives `id-token: write`.
- Publication uses npm trusted publishing; no long-lived npm publish token is required.

## First npm publication

Trusted publisher configuration requires the npm package to exist first. For the initial publication:

1. Verify that the unscoped npm name `percin` is available; if it is not, choose the final scoped package name before publishing.
2. Verify the final GitHub repository is `yigityalim/percin`, or update `packages/percin/package.json` first.
3. Publish the first package version manually from a trusted maintainer environment.
4. Create a GitHub environment named `npm` and configure required reviewers for publication.
5. In npm package settings, configure GitHub Actions trusted publishing for repository `yigityalim/percin`, workflow `release.yml`, and environment `npm`.
6. Permit direct publishing for that trusted publisher while the Changesets workflow uses `npm publish`.
7. Enable 2FA on maintainer npm accounts and restrict legacy token-based publishing.

## Staged publishing

npm supports staged publishing, but the current Changesets automation guidance does not support staged publishing yet. Until that integration is available, the `npm` GitHub environment is the human approval gate in front of the OIDC-authenticated direct publish job.
