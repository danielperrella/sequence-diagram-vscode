import { describe, expect, it } from "vitest";
import { getCompletionCandidates } from "../../src/language/completionProvider";

describe("completionEngine", () => {
  it("suggests title on empty line", () => {
    const items = getCompletionCandidates("", 0, 0);
    expect(items.some((item) => item.label === "title")).toBe(true);
  });

  it("prioritizes message completion after participant context", () => {
    const items = getCompletionCandidates("Alice", 0, 5);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].label.length).toBeGreaterThan(0);
  });

  it("filters by prefix", () => {
    const items = getCompletionCandidates("tit", 0, 3);
    expect(items.some((item) => item.label === "title")).toBe(true);
  });

  it("includes insert snippet templates in autocomplete", () => {
    const items = getCompletionCandidates("", 0, 0);
    expect(items.some((item) => item.label === "snippet: Message Pair")).toBe(true);
  });

  it("keeps syntax directives ahead of template snippets", () => {
    const items = getCompletionCandidates("", 0, 0);
    expect(items[0]?.label.startsWith("snippet:")).toBe(false);
  });

  it("deduplicates completion entries by normalized id/body", () => {
    const items = getCompletionCandidates("", 0, 0);
    const uniqueLabels = new Set(items.map((item) => item.label));
    expect(uniqueLabels.size).toBe(items.length);
  });
});
