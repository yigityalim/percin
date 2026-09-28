import { cli, command, execute, flag, path } from "@yigityalim/percin"

const copy = command("copy")
  .arg("source", path().exists())
  .arg("destination", path())
  .option("force", flag().short("f"))
  .handle(async ({ source, destination, force, fs, ui }) => {
    await fs.copy(source, destination, { overwrite: force })
    ui.success(destination)
  })

process.exitCode = await execute(cli("files").command(copy))
