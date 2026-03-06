import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function writePlaceholderScreenshot(target: string, label: string): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `screenshot placeholder: ${label}`, "utf8");
}
