import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "../../src/webview/runtime/helpers";

describe("preview state helpers", () => {
  it("normalizes renderer URLs", () => {
    expect(normalizeBaseUrl("https://example.com/")).toBe("https://example.com");
  });
});
