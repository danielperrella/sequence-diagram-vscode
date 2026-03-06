import * as assert from "node:assert";
import * as path from "node:path";
import * as vscode from "vscode";

suite("SequenceDiagram integration", () => {
  test("registers the extension and opens a .seqdiag document", async () => {
    try {
      await vscode.workspace.getConfiguration().update(
        "sequencediagram.preview.enabled",
        false,
        vscode.ConfigurationTarget.Global
      );

      const extension = vscode.extensions.getExtension("perrelladaniel.sequencediagram-vscode");
      await extension?.activate();
      assert.ok(extension, "Extension should be available.");

      const fileUri = vscode.Uri.file(
        path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd(), "test", "fixtures", "workspace", "sample.seqdiag")
      );
      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document);
      await vscode.commands.executeCommand("sequencediagram.togglePreview");

      assert.strictEqual(document.languageId, "seqdiag");

      const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
        "vscode.executeCompletionItemProvider",
        fileUri,
        new vscode.Position(0, 0),
        "#"
      );
      assert.ok(completions, "Completion provider should return items.");
      assert.ok(completions.items.some((item) => item.label === "title"), "Expected title completion.");
    } finally {
      await vscode.workspace.getConfiguration().update(
        "sequencediagram.preview.enabled",
        undefined,
        vscode.ConfigurationTarget.Global
      );
    }
  });
});
