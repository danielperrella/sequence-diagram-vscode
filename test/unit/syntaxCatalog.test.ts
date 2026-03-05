import { describe, expect, it } from "vitest";
import { allSyntaxCategories, syntaxCatalog } from "../../src/language/syntaxCatalog";

describe("syntaxCatalog", () => {
  it("covers all key instruction categories", () => {
    const requiredCategories = [
      "comments",
      "title",
      "participants",
      "bottom-participants",
      "messages",
      "message-timing",
      "incoming-outgoing",
      "failure-messages",
      "notes-boxes",
      "references",
      "dividers",
      "create-destroy",
      "activations",
      "auto-activation",
      "spaces",
      "fragments",
      "participant-groups",
      "links",
      "frame",
      "element-styling",
      "text-styling",
      "named-type-styles",
      "active-color",
      "fonts",
      "automatic-numbering",
      "linear-messages",
      "parallel",
      "participant-spacing",
      "entry-spacing",
      "life-line-style",
      "legacy-styling"
    ];

    for (const category of requiredCategories) {
      expect(allSyntaxCategories).toContain(category);
    }
  });

  it("contains usable metadata for each entry", () => {
    for (const entry of syntaxCatalog) {
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.patterns.length).toBeGreaterThan(0);
      expect(entry.examples.length).toBeGreaterThan(0);
      expect(entry.insertText.length).toBeGreaterThan(0);
      expect(entry.triggerContexts.length).toBeGreaterThan(0);
    }
  });
});
