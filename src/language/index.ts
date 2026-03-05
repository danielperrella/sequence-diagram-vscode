import * as vscode from "vscode";
import { SeqdiagCompletionProvider } from "./completionProvider";
import { createSeqdiagDiagnosticCollection, refreshDiagnostics } from "./diagnostics";
import { SeqdiagHoverProvider } from "./hoverProvider";
import { SeqdiagQuickFixProvider } from "./quickFixProvider";
import { snippetTemplates } from "./snippets";

export function registerSeqdiagLanguageFeatures(context: vscode.ExtensionContext): vscode.Disposable {
  const selector: vscode.DocumentSelector = [
    { language: "seqdiag", scheme: "file" },
    { language: "seqdiag", scheme: "untitled" }
  ];

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    selector,
    new SeqdiagCompletionProvider(),
    " ",
    "-",
    ">",
    "<",
    ":",
    "#",
    "(",
    ")",
    ","
  );

  const hoverProvider = vscode.languages.registerHoverProvider(selector, new SeqdiagHoverProvider());
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(selector, new SeqdiagQuickFixProvider(), {
    providedCodeActionKinds: SeqdiagQuickFixProvider.providedCodeActionKinds
  });

  const diagnostics = createSeqdiagDiagnosticCollection();

  for (const document of vscode.workspace.textDocuments) {
    refreshDiagnostics(diagnostics, document);
  }

  const diagnosticsOnOpen = vscode.workspace.onDidOpenTextDocument((document) => {
    refreshDiagnostics(diagnostics, document);
  });

  const diagnosticsOnChange = vscode.workspace.onDidChangeTextDocument((event) => {
    refreshDiagnostics(diagnostics, event.document);
  });

  const diagnosticsOnClose = vscode.workspace.onDidCloseTextDocument((document) => {
    diagnostics.delete(document.uri);
  });

  const insertSnippetCommand = vscode.commands.registerCommand("sequencediagram.insertSnippet", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== "seqdiag") {
      void vscode.window.showWarningMessage("Open a .seqdiag file to insert a snippet.");
      return;
    }

    const picked = await vscode.window.showQuickPick(
      snippetTemplates.map((template) => ({
        label: template.label,
        description: template.description,
        template
      })),
      {
        title: "SequenceDiagram snippets"
      }
    );

    if (!picked) {
      return;
    }

    await editor.insertSnippet(new vscode.SnippetString(picked.template.body));
  });

  const disposable = vscode.Disposable.from(
    completionProvider,
    hoverProvider,
    codeActionProvider,
    diagnostics,
    diagnosticsOnOpen,
    diagnosticsOnChange,
    diagnosticsOnClose,
    insertSnippetCommand
  );

  context.subscriptions.push(disposable);
  return disposable;
}
