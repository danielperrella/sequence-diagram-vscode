import * as fs from "node:fs/promises";
import * as path from "node:path";
import { WatchdogReport } from "../types";

export async function writeMarkdownReport(artifactDir: string, report: WatchdogReport): Promise<void> {
  const body = [
    "# SequenceDiagram Test Watchdog",
    "",
    `Overall status: **${report.overallStatus}**`,
    "",
    "## Suites",
    ...report.suites.map(
      (suite) => `- ${suite.suite}: ${suite.status} (exitCode=${suite.exitCode}, category=${suite.failureCategory ?? "n/a"})`
    ),
    "",
    "## Diagnoses",
    ...report.diagnoses.map((diagnosis) => `- ${diagnosis.category}: ${diagnosis.summary}`)
  ].join("\n");

  await fs.writeFile(path.join(artifactDir, "watchdog-report.md"), body, "utf8");
}
