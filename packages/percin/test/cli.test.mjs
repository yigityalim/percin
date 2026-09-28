import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import { choice, cli, command, execute, flag, path } from "../dist/index.js"

test("parses positional arguments, defaults, choices, and flags", async () => {
  let received

  const inspect = command("inspect")
    .arg("file", path())
    .option("algorithm", choice(["sha256", "sha512"]).default("sha256").short("a"))
    .option("force", flag().short("f"))
    .handle(({ file, algorithm, force }) => {
      received = { file, algorithm, force }
    })

  const app = cli("demo").command(inspect)
  const exitCode = await execute(app, ["inspect", "package.json", "-f"])

  assert.equal(exitCode, 0)
  assert.deepEqual(received, {
    file: "package.json",
    algorithm: "sha256",
    force: true,
  })
})

test("validates choices", async () => {
  const inspect = command("inspect")
    .option("algorithm", choice(["sha256", "sha512"]).required())
    .handle(() => undefined)

  const app = cli("demo").command(inspect)
  const exitCode = await execute(app, ["inspect", "--algorithm", "md5"])

  assert.equal(exitCode, 1)
})

test("validates existing paths", async () => {
  const inspect = command("inspect")
    .arg("file", path().exists())
    .handle(() => undefined)

  const app = cli("demo").command(inspect)
  const exitCode = await execute(app, ["inspect", "/definitely/missing/percin-file"])

  assert.equal(exitCode, 1)
})

test("exposes filesystem and crypto services", async () => {
  const directory = await mkdtemp(join(tmpdir(), "percin-"))
  const source = join(directory, "source.txt")
  const destination = join(directory, "nested", "destination.txt")

  try {
    await writeFile(source, "abc", "utf8")
    let digest

    const copy = command("copy")
      .arg("source", path().exists())
      .arg("destination", path())
      .handle(async ({ source, destination, fs, crypto }) => {
        const data = await fs.read(source)
        digest = await crypto.digest("sha256", data)
        await fs.copy(source, destination, { overwrite: true })
      })

    const app = cli("demo").command(copy)
    const exitCode = await execute(app, ["copy", source, destination])

    assert.equal(exitCode, 0)
    assert.equal(digest, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
    assert.equal(await readFile(destination, "utf8"), "abc")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("builds auth headers", async () => {
  let bearer
  let basic

  const auth = command("auth").handle(({ auth }) => {
    bearer = auth.bearer("token")
    basic = auth.basic("user", "secret")
  })

  const app = cli("demo").command(auth)
  const exitCode = await execute(app, ["auth"])

  assert.equal(exitCode, 0)
  assert.deepEqual(bearer, { authorization: "Bearer token" })
  assert.deepEqual(basic, { authorization: "Basic dXNlcjpzZWNyZXQ=" })
})
