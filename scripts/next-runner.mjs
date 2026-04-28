import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const DIST_DIR_NAME = "next-build-link";
const USE_LOCAL_WINDOWS_BUILD_WORKAROUND = process.platform === "win32" && !process.env.VERCEL;

function getExternalBuildTarget(projectRoot) {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  const projectName = path.basename(projectRoot).replace(/[^a-zA-Z0-9_-]+/g, "-");
  const hash = createHash("sha1").update(projectRoot).digest("hex").slice(0, 10);
  return path.join(localAppData, "CodexNextBuild", `${projectName}-${hash}`);
}

function removePath(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function ensureJunction(linkPath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.mkdirSync(targetPath, { recursive: true });

  try {
    const stats = fs.lstatSync(linkPath);
    if (stats.isSymbolicLink()) {
      const existingTarget = fs.readlinkSync(linkPath);
      if (path.resolve(path.dirname(linkPath), existingTarget) === path.resolve(targetPath)) {
        return;
      }
    }

    removePath(linkPath);
  } catch {
    // Path does not exist yet.
  }

  fs.symlinkSync(targetPath, linkPath, "junction");
}

function prepareNextBuildDir(nextArgs) {
  if (!USE_LOCAL_WINDOWS_BUILD_WORKAROUND) {
    return;
  }

  const command = nextArgs[0];
  if (command === "build") {
    removePath(targetPath);
  }

  ensureJunction(linkPath, targetPath);
}

function runNext(nextArgs) {
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  const inheritedNodePath = process.env.NODE_PATH;
  const env = {
    ...process.env,
    NODE_PATH: inheritedNodePath ? `${nodeModulesPath}${path.delimiter}${inheritedNodePath}` : nodeModulesPath,
  };
  const child = spawn(process.execPath, [path.join("node_modules", "next", "dist", "bin", "next"), ...nextArgs], {
    stdio: "inherit",
    cwd: process.cwd(),
    env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

const projectRoot = process.cwd();
const linkPath = path.join(projectRoot, DIST_DIR_NAME);
const targetPath = getExternalBuildTarget(projectRoot);
const commandArgs = process.argv.slice(2);

prepareNextBuildDir(commandArgs);

if (commandArgs[0] === "prepare") {
  process.exit(0);
}

runNext(commandArgs);
