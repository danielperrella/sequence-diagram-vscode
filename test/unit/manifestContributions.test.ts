import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

interface CommandContribution {
  command: string;
  icon?: string;
}

describe("package manifest contributions", () => {
  it("defines icons for title-bar commands", () => {
    const packageJsonPath = join(process.cwd(), "package.json");
    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      contributes: {
        commands: CommandContribution[];
        menus: {
          "editor/title": Array<{ command: string }>;
        };
      };
    };

    const commandById = new Map(manifest.contributes.commands.map((entry) => [entry.command, entry]));
    expect(commandById.get("sequencediagram.reloadPreview")?.icon).toBe("$(refresh)");
    expect(commandById.get("sequencediagram.exportSvg")?.icon).toBe("$(file-code)");
    expect(commandById.get("sequencediagram.exportPng")?.icon).toBe("$(file-media)");
    expect(commandById.get("sequencediagram.insertSnippet")?.icon).toBe("$(symbol-snippet)");

    const titleCommands = manifest.contributes.menus["editor/title"].map((entry) => entry.command);
    expect(titleCommands).toContain("sequencediagram.insertSnippet");
  });
});
