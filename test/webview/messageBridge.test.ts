import { describe, expect, it } from "vitest";
import { injectBaseTag } from "../../src/webview/runtime/helpers";

describe("message bridge helpers", () => {
  it("injects a base tag into renderer HTML", () => {
    const html = injectBaseTag("<html><head></head><body></body></html>", "https://example.com");
    expect(html).toContain('<base href="https://example.com/">');
  });
});
