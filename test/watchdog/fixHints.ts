import * as fs from "node:fs/promises";
import * as path from "node:path";
import { diagnoseFailure } from "../helpers/failureClassifier";
import { WatchdogReport } from "../types";

async function main(): Promise<void> {
  const reportPath = path.resolve(process.cwd(), ".artifacts", "test-runs", "latest", "watchdog-report.json");
  const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as WatchdogReport;
  const diagnoses = report.suites
    .filter((suite) => suite.failureCategory)
    .map((suite) => diagnoseFailure(suite.failureCategory!));

  console.log(JSON.stringify(diagnoses, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
