import { describe, expect, it } from "vitest";
import { detectCompletionContext, parseDocument } from "../../src/language/parser";

describe("parser", () => {
  it("reports unclosed blocks", () => {
    const result = parseDocument("alt condition\nAlice->Bob: Hi");
    expect(result.issues.some((issue) => issue.code === "unclosed-block")).toBe(true);
  });

  it("reports incomplete messages", () => {
    const result = parseDocument("Alice->Bob");
    expect(result.issues.some((issue) => issue.code === "incomplete-message")).toBe(true);
  });

  it("detects context after an arrow", () => {
    const context = detectCompletionContext("Alice->", 0, 7);
    expect(context.cursorContext).toBe("afterArrow");
  });

  it("reports unknown participants when declarations exist", () => {
    const source = "participant Alice\nAlice->Bob: Hi";
    const result = parseDocument(source);
    expect(result.issues.some((issue) => issue.code === "unknown-participant")).toBe(true);
  });
});
