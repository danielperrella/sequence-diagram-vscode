import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writePlaceholderScreenshot } from "../helpers/screenshotCollector";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

describe("writePlaceholderScreenshot", () => {
  it("creates the target directory before writing the placeholder artifact", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "seqdiag-screenshot-"));
    tempDirs.push(tempRoot);
    const target = path.join(tempRoot, ".artifacts", "ui-placeholder.txt");

    await writePlaceholderScreenshot(target, "ui smoke placeholder");

    const content = await fs.readFile(target, "utf8");
    expect(content).toBe("screenshot placeholder: ui smoke placeholder");
  });
});
