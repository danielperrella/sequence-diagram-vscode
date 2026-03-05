import * as cp from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createArtifactDir, trimArtifactHistory, writeArtifact } from "../helpers/artifactCollector";
import { classifyFailure, diagnoseFailure } from "../helpers/failureClassifier";
import { shouldRetry } from "../helpers/retryPolicy";
import { TestArtifactRecord, TestSuiteName, WatchdogReport } from "../types";
import { writeJsonReport } from "./reportJson";
import { writeMarkdownReport } from "./reportMarkdown";
import { summarizeReport } from "./summarize";

const ARTIFACT_ROOT = path.resolve(process.cwd(), ".artifacts", "test-runs");

async function main(): Promise<void> {
  await trimArtifactHistory(ARTIFACT_ROOT);

  const suites: Array<{ name: TestSuiteName; command: string }> = [
    { name: "unit", command: "corepack pnpm test:unit" },
    { name: "webview", command: "corepack pnpm test:webview" },
    { name: "integration", command: "corepack pnpm test:integration" },
    { name: "ui", command: "corepack pnpm test:ui" }
  ];

  const suiteRecords: TestArtifactRecord[] = [];

  for (const suite of suites) {
    suiteRecords.push(await runSuite(suite.name, suite.command));
  }

  const diagnoses = suiteRecords
    .filter((suite) => suite.failureCategory)
    .map((suite) => diagnoseFailure(suite.failureCategory!));
  const report: WatchdogReport = {
    overallStatus: suiteRecords.some((suite) => suite.status === "failed") ? "failed" : "passed",
    suites: suiteRecords,
    diagnoses
  };

  const rootArtifactDir = path.join(ARTIFACT_ROOT, "latest");
  await fs.rm(rootArtifactDir, { recursive: true, force: true });
  await fs.mkdir(rootArtifactDir, { recursive: true });
  await writeJsonReport(rootArtifactDir, report);
  await writeMarkdownReport(rootArtifactDir, report);
  await writeArtifact(rootArtifactDir, "summary.txt", summarizeReport(report));

  console.log(summarizeReport(report));

  if (report.overallStatus === "failed") {
    process.exit(1);
  }
}

async function runSuite(name: TestSuiteName, command: string): Promise<TestArtifactRecord> {
  const startedAt = new Date().toISOString();
  const artifactDir = await createArtifactDir(ARTIFACT_ROOT, name);
  const firstAttempt = await runCommand(command);
  let retryCount = 0;
  let finalAttempt = firstAttempt;
  let status: TestArtifactRecord["status"] = firstAttempt.exitCode === 0 ? "passed" : "failed";
  let failureCategory = firstAttempt.exitCode === 0 ? undefined : classifyFailure({ suite: name, ...firstAttempt });

  await writeArtifact(artifactDir, "stdout.log", firstAttempt.stdout);
  await writeArtifact(artifactDir, "stderr.log", firstAttempt.stderr);
  await writeArtifact(
    artifactDir,
    "metadata.json",
    JSON.stringify(
      {
        os: os.platform(),
        node: process.version,
        suite: name,
        command
      },
      null,
      2
    )
  );

  if (failureCategory && shouldRetry(failureCategory)) {
    retryCount = 1;
    const retryAttempt = await runCommand(command);
    await writeArtifact(artifactDir, "stdout-retry.log", retryAttempt.stdout);
    await writeArtifact(artifactDir, "stderr-retry.log", retryAttempt.stderr);
    finalAttempt = retryAttempt;
    status = retryAttempt.exitCode === 0 ? "flaky" : "failed";
    failureCategory =
      retryAttempt.exitCode === 0
        ? failureCategory
        : classifyFailure({ suite: name, ...retryAttempt });
  }

  return {
    suite: name,
    status,
    startedAt,
    endedAt: new Date().toISOString(),
    retryCount,
    artifactDir,
    failureCategory,
    exitCode: finalAttempt.exitCode
  };
}

function runCommand(command: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    cp.exec(command, { cwd: process.cwd(), env: process.env }, (error, stdout, stderr) => {
      resolve({
        exitCode: error && typeof error.code === "number" ? error.code : 0,
        stdout,
        stderr
      });
    });
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
