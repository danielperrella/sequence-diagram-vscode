import { describe, expect, it } from "vitest";
import { normalizeBaseUrl } from "../../src/configuration";

describe("configuration", () => {
  it("removes trailing slashes from base URLs", () => {
    expect(normalizeBaseUrl("https://example.com///")).toBe("https://example.com");
  });

  it("falls back to the public renderer when empty", () => {
    expect(normalizeBaseUrl("")).toBe("https://sequencediagram.org");
  });
});
