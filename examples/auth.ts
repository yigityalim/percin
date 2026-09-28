import { cli, command, execute, string } from "@yigityalim/percin"

const whoami = command("whoami")
  .option("token", string().required())
  .handle(async ({ token, auth, ui, signal }) => {
    const response = await fetch("https://api.example.com/v1/me", {
      headers: auth.bearer(token),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`)
    }

    const body = await response.text()
    ui.log(body)
  })

const app = cli("example").command(whoami)

process.exitCode = await execute(app)
