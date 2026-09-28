import { choice, command, flag, path, string } from "../src/index.js"

function expectType<T>(_value: T): void {}

command("hash")
  .arg("file", path().exists())
  .option("algorithm", choice(["sha256", "sha512"]).default("sha256").short("a"))
  .option("label", string())
  .option("force", flag().short("f"))
  .handle(async ({ file, algorithm, label, force, fs, crypto }) => {
    expectType<string>(file)
    expectType<"sha256" | "sha512">(algorithm)
    expectType<string | undefined>(label)
    expectType<boolean>(force)
    expectType<Uint8Array>(await fs.read(file))
    expectType<string>(await crypto.digest(algorithm, "test"))
  })
