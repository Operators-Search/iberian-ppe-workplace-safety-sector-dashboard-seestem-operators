import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [command, ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      if (code && code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }

      resolve(undefined);
    });
  });
}

await run("./scripts/next-runner.mjs", ["prepare"]);
await run("./node_modules/typescript/bin/tsc", ["--noEmit"]);
