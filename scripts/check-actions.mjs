import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

const workflowsDirectory = new URL("../.github/workflows/", import.meta.url)
const entries = await readdir(workflowsDirectory, { withFileTypes: true })
const workflowFiles = entries
  .filter((entry) => entry.isFile() && /\.ya?ml$/u.test(entry.name))
  .map((entry) => entry.name)
  .sort()

const violations = []

for (const file of workflowFiles) {
  const contents = await readFile(new URL(file, workflowsDirectory), "utf8")
  const matches = contents.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gmu)

  for (const match of matches) {
    const target = match[1]

    if (!target || target.startsWith("./")) {
      continue
    }

    const separator = target.lastIndexOf("@")
    const reference = separator === -1 ? "" : target.slice(separator + 1)

    if (!/^[0-9a-f]{40}$/iu.test(reference)) {
      violations.push(`${join(".github", "workflows", file)}: ${target}`)
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(
    `GitHub Actions must be pinned to full commit SHAs:\n${violations.join("\n")}\n`,
  )
  process.exitCode = 1
}
