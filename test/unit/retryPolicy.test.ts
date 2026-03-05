import { describe, expect, it } from "vitest";
import { shouldRetry } from "../helpers/retryPolicy";

describe("retryPolicy", () => {
  it("retries only known flaky categories", () => {
    expect(shouldRetry("ui_selector_failure")).toBe(true);
    expect(shouldRetry("build_failure")).toBe(false);
  });
});
