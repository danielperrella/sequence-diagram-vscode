import * as fs from "node:fs/promises";
import * as path from "node:path";
import { WatchdogReport } from "../types";

export async function writeJsonReport(artifactDir: string, report: WatchdogReport): Promise<void> {
  await fs.writeFile(
    path.join(artifactDir, "watchdog-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
}
