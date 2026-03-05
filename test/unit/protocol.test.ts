import { describe, expect, it } from "vitest";
import { ExtensionToWebviewMessage } from "../../src/protocol";

describe("protocol", () => {
  it("supports explicit render requests with a reason", () => {
    const message: ExtensionToWebviewMessage = {
      type: "render",
      source: "Alice->Bob: Hi",
      format: "svg",
      requestId: 1,
      reason: "preview"
    };

    expect(message.reason).toBe("preview");
  });
});
