export interface QuickFixPlan {
  title: string;
  insertion: string;
}

export function getQuickFixPlan(code: string, lineText: string): QuickFixPlan | undefined {
  if (code === "unclosed-block") {
    return {
      title: "Add missing `end`",
      insertion: "end\n"
    };
  }

  if (code === "incomplete-message") {
    return {
      title: "Complete message syntax",
      insertion: lineText.includes(":") ? "" : ": message"
    };
  }

  if (code === "malformed-directive") {
    return {
      title: "Add directive value",
      insertion: " value"
    };
  }

  return undefined;
}
