import { describe, expect, it } from "vitest";
import { classifyFailure } from "../helpers/failureClassifier";

describe("failureClassifier", () => {
  it("classifies renderer API failures", () => {
    expect(
      classifyFailure({
        suite: "webview",
        exitCode: 1,
        stdout: "",
        stderr: "SequenceDiagram API is not available in the renderer frame."
      })
    ).toBe("renderer_api_missing");
  });
});
