import * as path from "node:path";
import { writePlaceholderScreenshot } from "../helpers/screenshotCollector";

async function main(): Promise<void> {
  const enabled = process.env.SEQUENCEDIAGRAM_ENABLE_UI_TESTS === "1";

  if (!enabled) {
    console.log("UI smoke tests are scaffolded but skipped unless SEQUENCEDIAGRAM_ENABLE_UI_TESTS=1.");
    return;
  }

  const artifactPath = path.resolve(process.cwd(), ".artifacts/ui-placeholder.txt");
  await writePlaceholderScreenshot(artifactPath, "ui smoke placeholder");
  console.log("UI smoke placeholder completed.");
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
