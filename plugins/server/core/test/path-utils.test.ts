import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { getCurrentDir } from "../src/path-utils.js";

describe("getCurrentDir", () => {
  let workDir: string;
  let originalEntryScript: string | undefined;

  beforeEach(() => {
    workDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "path-utils-")));
    originalEntryScript = process.argv[1];
  });

  afterEach(() => {
    process.argv[1] = originalEntryScript as string;
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  it("returns the directory of the entry script", () => {
    const distDir = path.join(workDir, "pkg", "dist");
    fs.mkdirSync(distDir, { recursive: true });
    const entryScript = path.join(distDir, "index.js");
    fs.writeFileSync(entryScript, "");

    process.argv[1] = entryScript;

    expect(getCurrentDir()).toBe(distDir);
  });

  it("resolves a bin symlink to the real script directory, as started by npx", () => {
    const distDir = path.join(workDir, "node_modules", "pkg", "dist");
    const binDir = path.join(workDir, "node_modules", ".bin");
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(binDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, "index.js"), "");
    const binLink = path.join(binDir, "pkg");
    fs.symlinkSync(path.join("..", "pkg", "dist", "index.js"), binLink);

    process.argv[1] = binLink;

    expect(getCurrentDir()).toBe(distDir);
  });
});
