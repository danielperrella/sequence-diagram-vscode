import { describe, expect, it } from "vitest";
import { decodeDataUrl } from "../../src/utils/dataUrl";

describe("decodeDataUrl", () => {
  it("decodes base64 data URLs", () => {
    const payload = decodeDataUrl("data:text/plain;base64,SGVsbG8=");
    expect(Buffer.from(payload).toString("utf8")).toBe("Hello");
  });

  it("decodes percent-encoded data URLs", () => {
    const payload = decodeDataUrl("data:text/plain,Hello%20World");
    expect(Buffer.from(payload).toString("utf8")).toBe("Hello World");
  });
});
