import * as vscode from "vscode";
import { catalogByKeyword } from "./syntaxCatalog";

export class SeqdiagHoverProvider implements vscode.HoverProvider {
  public provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /[#/A-Za-z0-9_-]+/);
    if (!range) {
      return undefined;
    }

    const word = document.getText(range).toLowerCase();
    const matches = catalogByKeyword.get(word);
    if (!matches || matches.length === 0) {
      return undefined;
    }

    const best = matches[0];
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`**${best.detail}**\n\n`);
    markdown.appendMarkdown(`${best.description}\n\n`);
    markdown.appendMarkdown(`Syntax: \`${best.patterns[0]}\`\n\n`);
    markdown.appendMarkdown(`Example: \`${best.examples[0]}\``);

    return new vscode.Hover(markdown, range);
  }
}
