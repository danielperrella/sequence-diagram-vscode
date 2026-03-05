import { WatchdogReport } from "../types";

export function summarizeReport(report: WatchdogReport): string {
  const lines = [
    `Watchdog overall status: ${report.overallStatus}`,
    ...report.suites.map(
      (suite) => ` - ${suite.suite}: ${suite.status}${suite.failureCategory ? ` (${suite.failureCategory})` : ""}`
    )
  ];

  return lines.join("\n");
}
