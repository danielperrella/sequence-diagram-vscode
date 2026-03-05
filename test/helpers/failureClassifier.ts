import { FailureCategory, FailureDiagnosis } from "../types";

export interface FailureClassifierInput {
  suite: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function classifyFailure(input: FailureClassifierInput): FailureCategory {
  const output = `${input.stdout}\n${input.stderr}`;

  if (output.includes("Renderer returned HTTP 500")) {
    return "renderer_bootstrap_failure";
  }

  if (output.includes("Timed out while loading SequenceDiagram renderer")) {
    return "preview_timeout";
  }

  if (output.includes("SequenceDiagram API is not available")) {
    return "renderer_api_missing";
  }

  if (output.includes("Preview panel") || output.includes("toggle preview")) {
    return "custom_editor_registration_failure";
  }

  if (input.suite === "ui" && /timeout|element/i.test(output)) {
    return "ui_selector_failure";
  }

  if (input.exitCode !== 0 && /tsc|typescript/i.test(output)) {
    return "build_failure";
  }

  return "unknown_failure";
}

export function diagnoseFailure(category: FailureCategory): FailureDiagnosis {
  switch (category) {
    case "renderer_bootstrap_failure":
      return {
        category,
        summary: "Renderer bootstrap failed.",
        likelyCause: "The configured renderer endpoint returned an invalid or failing runtime.",
        suspectedFiles: ["src/rendering/base.ts", "src/preview/SequenceDiagramPreviewController.ts"],
        reproCommand: "corepack pnpm test:integration",
        suggestedActions: [
          "Inspect fake renderer traces.",
          "Check runtime HTML sanitization and URL configuration.",
          "Verify bootstrap message payloads."
        ],
        confidence: "high"
      };
    case "preview_timeout":
      return {
        category,
        summary: "Preview rendering timed out.",
        likelyCause: "Renderer readiness race or stale render scheduling.",
        suspectedFiles: ["src/webview/runtime/runtime.ts", "src/webview/runtime/rendererClient.ts"],
        reproCommand: "corepack pnpm test:webview",
        suggestedActions: [
          "Inspect preview scheduling logic.",
          "Verify renderer readiness before rendering.",
          "Check timeout thresholds and stale request handling."
        ],
        confidence: "high"
      };
    case "renderer_api_missing":
      return {
        category,
        summary: "Renderer API is missing from the runtime frame.",
        likelyCause: "Runtime HTML loaded but did not expose SEQ.api methods.",
        suspectedFiles: ["src/webview/runtime/rendererClient.ts", "test/helpers/fakeRendererServer.ts"],
        reproCommand: "corepack pnpm test:webview",
        suggestedActions: [
          "Validate runtime HTML injection.",
          "Check base tag injection and CSP sanitization.",
          "Confirm fake renderer scenario setup."
        ],
        confidence: "high"
      };
    case "custom_editor_registration_failure":
      return {
        category,
        summary: "Preview panel wiring failed.",
        likelyCause: "Manifest contribution or activation wiring is incorrect.",
        suspectedFiles: ["package.json", "src/extension.ts"],
        reproCommand: "corepack pnpm test:integration",
        suggestedActions: [
          "Inspect commands and editor/title contributions in package.json.",
          "Verify toggle preview command wiring.",
          "Confirm preview panel creation and webview bootstrapping."
        ],
        confidence: "medium"
      };
    case "ui_selector_failure":
      return {
        category,
        summary: "UI smoke test could not find expected workbench elements.",
        likelyCause: "Workbench automation selectors drifted or VS Code startup was slow.",
        suspectedFiles: ["test/ui/runUiSmoke.ts"],
        reproCommand: "corepack pnpm test:ui",
        suggestedActions: [
          "Review screenshot artifacts.",
          "Update selectors or increase startup waits.",
          "Re-run once to detect flakiness."
        ],
        confidence: "medium"
      };
    case "build_failure":
      return {
        category,
        summary: "Build failed before test execution.",
        likelyCause: "TypeScript or bundling error.",
        suspectedFiles: ["package.json", "tsconfig.json", "src"],
        reproCommand: "corepack pnpm build",
        suggestedActions: [
          "Run the build locally.",
          "Fix TypeScript or esbuild errors.",
          "Check generated webview bundle inputs."
        ],
        confidence: "high"
      };
    default:
      return {
        category,
        summary: "Unknown test failure.",
        likelyCause: "The failure did not match a known signature.",
        suspectedFiles: ["src", "test"],
        reproCommand: "corepack pnpm test",
        suggestedActions: [
          "Inspect stdout/stderr artifacts.",
          "Review SequenceDiagram output channel logs.",
          "Add a new classifier rule if the failure is recurring."
        ],
        confidence: "low"
      };
  }
}
