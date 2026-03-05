import * as fs from "node:fs/promises";

export async function writePlaceholderScreenshot(target: string, label: string): Promise<void> {
  await fs.writeFile(target, `screenshot placeholder: ${label}`, "utf8");
}
