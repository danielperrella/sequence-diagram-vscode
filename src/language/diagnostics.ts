import * as vscode from "vscode";
import { parseDocument } from "./parser";
import { ParseIssue } from "./types";

export const SEQDIAG_DIAGNOSTIC_SOURCE = "sequencediagram";

export interface DiagnosticDescriptor {
  code: string;
  message: string;
  severity: "error" | "warning";
  line: number;
  start: number;
  end: number;
}

export function collectDiagnosticDescriptors(source: string): DiagnosticDescriptor[] {
  return parseDocument(source).issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    severity: issue.severity,
    line: issue.line,
    start: issue.start,
    end: issue.end
  }));
}

export function computeDiagnostics(document: vscode.TextDocument): vscode.Diagnostic[] {
  return parseDocument(document.getText()).issues.map((issue) => toDiagnostic(document, issue));
}

export function createSeqdiagDiagnosticCollection(): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection(SEQDIAG_DIAGNOSTIC_SOURCE);
}

export function refreshDiagnostics(
  collection: vscode.DiagnosticCollection,
  document: vscode.TextDocument | undefined
): void {
  if (!document || document.languageId !== "seqdiag") {
    return;
  }

  collection.set(document.uri, computeDiagnostics(document));
}

function toDiagnostic(document: vscode.TextDocument, issue: ParseIssue): vscode.Diagnostic {
  const line = document.lineAt(Math.max(issue.line, 0));
  const start = Math.max(0, Math.min(issue.start, line.text.length));
  const end = Math.max(start + 1, Math.min(issue.end, line.text.length));
  const range = new vscode.Range(issue.line, start, issue.line, end);

  const diagnostic = new vscode.Diagnostic(
    range,
    issue.message,
    issue.severity === "error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
  );
  diagnostic.source = SEQDIAG_DIAGNOSTIC_SOURCE;
  diagnostic.code = issue.code;
  if (issue.data) {
    diagnostic.relatedInformation = [];
  }

  return diagnostic;
}
