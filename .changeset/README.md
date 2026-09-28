# Changesets

User-visible package changes should normally include a Changeset:

```sh
pnpm changeset
```

Choose `patch`, `minor`, or `major` according to SemVer. Repository-only changes such as CI, documentation, or internal tooling do not need a Changeset.
