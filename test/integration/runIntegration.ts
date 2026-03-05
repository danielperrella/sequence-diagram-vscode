import * as path from "node:path";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  if (process.platform === "darwin" && process.env.SEQUENCEDIAGRAM_FORCE_VSCODE_E2E !== "1") {
    console.log(
      "Skipping @vscode/test-electron integration tests on macOS in local mode. Run in CI/Linux or set SEQUENCEDIAGRAM_FORCE_VSCODE_E2E=1 to force execution."
    );
    return;
  }

  const extensionDevelopmentPath = path.resolve(__dirname, "../../..");
  const extensionTestsPath = path.resolve(__dirname, "./suite/index.js");

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: []
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
