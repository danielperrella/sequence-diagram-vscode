export type TestSuiteName = "unit" | "webview" | "integration" | "ui";

export type FailureCategory =
  | "build_failure"
  | "activation_failure"
  | "custom_editor_registration_failure"
  | "webview_bootstrap_failure"
  | "renderer_bootstrap_failure"
  | "renderer_api_missing"
  | "preview_timeout"
  | "export_failure"
  | "ui_selector_failure"
  | "network_dependency_leak"
  | "flaky_timeout"
  | "unknown_failure";

export interface TestArtifactRecord {
  suite: TestSuiteName;
  status: "passed" | "failed" | "flaky" | "skipped";
  startedAt: string;
  endedAt: string;
  retryCount: number;
  artifactDir: string;
  failureCategory?: FailureCategory;
  exitCode: number;
}

export interface FailureDiagnosis {
  category: FailureCategory;
  summary: string;
  likelyCause: string;
  suspectedFiles: string[];
  reproCommand: string;
  suggestedActions: string[];
  confidence: "low" | "medium" | "high";
}

export interface WatchdogReport {
  overallStatus: "passed" | "failed";
  suites: TestArtifactRecord[];
  diagnoses: FailureDiagnosis[];
}
