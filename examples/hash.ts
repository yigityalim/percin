import { choice, cli, command, execute, path } from "@yigityalim/percin"

const hash = command("hash")
  .arg("file", path().exists())
  .option("algorithm", choice(["sha256", "sha512"]).default("sha256").short("a"))
  .handle(async ({ file, algorithm, fs, crypto, ui }) => {
    const data = await fs.read(file)
    ui.log(await crypto.digest(algorithm, data))
  })

process.exitCode = await execute(cli("hashfile").command(hash))
