# Repository Setup

The checked-in repository is ready for `yigityalim/percin`. If the project is hosted elsewhere, update every repository URL in package metadata and documentation before the first npm publication.

## GitHub settings

Recommended settings for the public repository:

- default branch: `main`
- require pull requests before merging
- require the `CI / quality` status check
- dismiss stale approvals when substantive changes are pushed
- require conversation resolution
- block force pushes and branch deletion on `main`
- enable squash merging and automatically delete merged branches
- enable private vulnerability reporting
- enable Dependabot alerts and security updates
- keep Dependency Review required for pull requests that change dependencies
- enable secret scanning and push protection
- enable GitHub Discussions for usage and design questions
- enable Actions permission for Changesets to create pull requests

If maintainer capacity supports it, use a protected `npm` environment with required reviewers for the publish job.

## npm settings

After the initial package exists on npm:

- configure trusted publishing for `yigityalim/percin`
- set the workflow filename to `release.yml`
- keep package provenance enabled
- require 2FA for maintainers
- restrict or remove long-lived publish tokens

## Branch and release model

Feature work lands through pull requests. Changesets accumulate release intent. The automated version pull request is the only normal place package versions and changelogs are updated.

## Dependency lockfile

Commit `pnpm-lock.yaml` after the first networked `pnpm install`. Once the lockfile exists, set `cache: true` and `require-lockfile: true` on the `pnpm/setup` steps; pnpm/setup will then enforce a frozen lockfile before jobs execute. The generated source bundle cannot resolve the registry from its build sandbox, so the lockfile is the only repository artifact intentionally left for first bootstrap.
