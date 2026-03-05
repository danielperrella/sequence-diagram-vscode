import { describe, expect, it } from "vitest";
import { findArrow, tokenizeLine } from "../../src/language/tokenizer";

describe("tokenizer", () => {
  it("tokenizes comments", () => {
    const tokens = tokenizeLine("# a comment");
    expect(tokens).toHaveLength(1);
    expect(tokens[0].kind).toBe("comment");
  });

  it("extracts arrow and participants from message lines", () => {
    const tokens = tokenizeLine("Alice->Bob: hello");
    expect(tokens.some((token) => token.kind === "arrow" && token.value === "->")).toBe(true);
    expect(tokens.some((token) => token.kind === "participant" && token.value === "Alice")).toBe(true);
    expect(tokens.some((token) => token.kind === "participant" && token.value === "Bob")).toBe(true);
  });

  it("finds longest arrow token when overlapping", () => {
    const arrow = findArrow("Alice-->>Bob: async");
    expect(arrow?.value).toBe("-->>");
  });
});
