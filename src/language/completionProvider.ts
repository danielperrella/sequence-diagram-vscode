import * as vscode from "vscode";
import { syntaxCatalog } from "./syntaxCatalog";
import { detectCompletionContext } from "./parser";
import { SeqdiagCompletionContext, SyntaxEntry } from "./types";
import { getSnippetCompletionTemplates } from "./snippets";

export interface CompletionCandidate {
  id: string;
  label: string;
  detail: string;
  insertText: string;
  documentation: string;
  sortText: string;
  kind: "keyword" | "snippet" | "operator";
  source: "syntaxCatalog" | "template";
  commitCharacters?: string[];
}

export function getCompletionCandidates(source: string, line: number, character: number): CompletionCandidate[] {
  const context = detectCompletionContext(source, line, character);
  const cursorLine = source.split(/\r?\n/)[line] ?? "";
  const prefix = cursorLine.slice(0, character).trim();
  const lowerPrefix = prefix.toLowerCase();

  const syntaxCandidates = syntaxCatalog
    .filter((entry) => isEntryAllowedInContext(entry, context.cursorContext))
    .filter((entry) => matchesPrefix(entry, prefix, context.cursorContext))
    .map((entry) => ({
      id: entry.id,
      label: entry.keywords[0],
      detail: entry.detail,
      insertText: entry.insertText,
      documentation: `${entry.description}\n\nExample: ${entry.examples[0] ?? entry.patterns[0]}`,
      kind: entry.kind,
      priority: entry.priority,
      source: "syntaxCatalog" as const
    }));

  const templateCandidates = getSnippetCompletionTemplates()
    .filter((entry) => matchesSnippetTemplatePrefix(entry, lowerPrefix))
    .map((entry) => ({
      id: `template:${entry.id}`,
      label: entry.label,
      detail: entry.detail,
      insertText: entry.insertText,
      documentation: entry.documentation,
      kind: "snippet" as const,
      priority: entry.priority,
      source: "template" as const
    }));

  const deduped = dedupeCandidates([...syntaxCandidates, ...templateCandidates]).sort(
    (a, b) => b.priority - a.priority || a.id.localeCompare(b.id)
  );

  return deduped.map((entry, index) => ({
    id: entry.id,
    label: entry.label,
    detail: entry.detail,
    insertText: entry.insertText,
    documentation: entry.documentation,
    sortText: String(index).padStart(4, "0"),
    kind: entry.kind,
    source: entry.source
  }));
}

export class SeqdiagCompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const candidates = getCompletionCandidates(document.getText(), position.line, position.character);

    return candidates.map((candidate) => {
      const item = new vscode.CompletionItem(candidate.label, toVsCodeCompletionItemKind(candidate.kind));
      item.detail = candidate.detail;
      item.documentation = new vscode.MarkdownString(candidate.documentation);
      item.insertText = new vscode.SnippetString(candidate.insertText);
      item.sortText = candidate.sortText;
      item.commitCharacters = candidate.commitCharacters;
      return item;
    });
  }
}

function dedupeCandidates<T extends { id: string; insertText: string }>(candidates: T[]): T[] {
  const seenIds = new Set<string>();
  const seenBodies = new Set<string>();
  const result: T[] = [];

  for (const candidate of candidates) {
    const normalizedId = candidate.id.toLowerCase().trim();
    const normalizedBody = candidate.insertText.replace(/\s+/g, " ").trim().toLowerCase();
    if (seenIds.has(normalizedId) || seenBodies.has(normalizedBody)) {
      continue;
    }

    seenIds.add(normalizedId);
    seenBodies.add(normalizedBody);
    result.push(candidate);
  }

  return result;
}

function matchesPrefix(entry: SyntaxEntry, prefix: string, context: SeqdiagCompletionContext): boolean {
  if (context === "afterParticipant" || context === "afterArrow") {
    return true;
  }

  if (!prefix) {
    return true;
  }

  const lowerPrefix = prefix.toLowerCase();
  return entry.keywords.some((keyword) => keyword.toLowerCase().includes(lowerPrefix)) || entry.id.includes(lowerPrefix);
}

function matchesSnippetTemplatePrefix(
  entry: { id: string; label: string; detail: string },
  lowerPrefix: string
): boolean {
  if (!lowerPrefix) {
    return true;
  }

  return (
    entry.id.toLowerCase().includes(lowerPrefix) ||
    entry.label.toLowerCase().includes(lowerPrefix) ||
    entry.detail.toLowerCase().includes(lowerPrefix)
  );
}

function isEntryAllowedInContext(entry: SyntaxEntry, context: SeqdiagCompletionContext): boolean {
  return entry.triggerContexts.includes("any") || entry.triggerContexts.includes(context);
}

function toVsCodeCompletionItemKind(kind: CompletionCandidate["kind"]): vscode.CompletionItemKind {
  switch (kind) {
    case "operator":
      return vscode.CompletionItemKind.Operator;
    case "keyword":
      return vscode.CompletionItemKind.Keyword;
    default:
      return vscode.CompletionItemKind.Snippet;
  }
}
