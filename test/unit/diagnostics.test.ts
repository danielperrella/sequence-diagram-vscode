import { describe, expect, it } from "vitest";
import { collectDiagnosticDescriptors } from "../../src/language/diagnostics";

describe("diagnostics", () => {
  it("maps parse issues to diagnostic descriptors", () => {
    const descriptors = collectDiagnosticDescriptors("title\nAlice->Bob");
    expect(descriptors.some((descriptor) => descriptor.code === "malformed-directive")).toBe(true);
    expect(descriptors.some((descriptor) => descriptor.code === "incomplete-message")).toBe(true);
  });
});
