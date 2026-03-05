import * as vscode from "vscode";
import { getQuickFixPlan, QuickFixPlan } from "./quickFixEngine";

export class SeqdiagQuickFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  public provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const code = typeof diagnostic.code === "string" ? diagnostic.code : String(diagnostic.code ?? "");
      const plan = getQuickFixPlan(code, document.lineAt(diagnostic.range.start.line).text);

      if (plan) {
        actions.push(createQuickFixAction(document, diagnostic, code, plan));
      }
    }

    return actions;
  }
}

function createQuickFixAction(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
  code: string,
  plan: QuickFixPlan
): vscode.CodeAction {
  const action = new vscode.CodeAction(plan.title, vscode.CodeActionKind.QuickFix);
  action.diagnostics = [diagnostic];
  const edit = new vscode.WorkspaceEdit();
  const line = diagnostic.range.start.line;
  const lineText = document.lineAt(line).text;

  const insertPosition =
    code === "unclosed-block"
      ? new vscode.Position(Math.min(line + 1, document.lineCount), 0)
      : new vscode.Position(line, lineText.length);

  edit.insert(document.uri, insertPosition, plan.insertion);
  action.edit = edit;
  return action;
}
