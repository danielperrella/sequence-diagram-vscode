import { describe, expect, it } from "vitest";
import { RendererClient } from "../../src/webview/runtime/rendererClient";

describe("RendererClient", () => {
  it("returns an error when the API is missing", async () => {
    const client = new RendererClient(
      {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        srcdoc: "",
        contentWindow: {} as Window
      },
      { log: () => undefined }
    );

    const result = await client.render("svg", "Alice->Bob: Hi");
    expect(result.ok).toBe(false);
  });
});
