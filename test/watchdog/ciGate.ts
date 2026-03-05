import { WatchdogReport } from "../types";

export function assertCiGate(report: WatchdogReport): void {
  if (report.overallStatus === "failed") {
    throw new Error("CI gate failed because at least one blocking test suite failed.");
  }
}
