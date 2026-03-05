import { describe, expect, it } from "vitest";
import { getQuickFixPlan } from "../../src/language/quickFixEngine";

describe("quickFix", () => {
  it("returns end insertion for unclosed blocks", () => {
    const plan = getQuickFixPlan("unclosed-block", "alt condition");
    expect(plan?.insertion).toBe("end\n");
  });

  it("returns message skeleton for incomplete messages", () => {
    const plan = getQuickFixPlan("incomplete-message", "Alice->Bob");
    expect(plan?.insertion).toBe(": message");
  });

  it("returns directive filler for malformed directives", () => {
    const plan = getQuickFixPlan("malformed-directive", "title");
    expect(plan?.insertion).toBe(" value");
  });
});
