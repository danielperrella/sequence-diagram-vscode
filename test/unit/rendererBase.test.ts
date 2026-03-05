import { describe, expect, it } from "vitest";
import { RendererConfig } from "../../src/protocol";
import { BaseWebRenderer } from "../../src/rendering/base";

class TestRenderer extends BaseWebRenderer {
  public constructor(config: RendererConfig) {
    super(config);
  }
}

describe("renderer base", () => {
  it("rejects invalid renderer URLs", () => {
    const renderer = new TestRenderer({
      baseUrl: "file:///tmp/renderer",
      debounceMs: 300,
      previewEnabled: true,
      defaultExportFormat: "svg"
    });

    expect(renderer.validate()?.code).toBe("config");
  });
});
