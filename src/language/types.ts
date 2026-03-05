export type SyntaxCategory =
  | "comments"
  | "title"
  | "participants"
  | "bottom-participants"
  | "messages"
  | "message-timing"
  | "incoming-outgoing"
  | "failure-messages"
  | "notes-boxes"
  | "references"
  | "dividers"
  | "create-destroy"
  | "activations"
  | "auto-activation"
  | "spaces"
  | "fragments"
  | "participant-groups"
  | "links"
  | "frame"
  | "element-styling"
  | "text-styling"
  | "named-type-styles"
  | "active-color"
  | "fonts"
  | "automatic-numbering"
  | "linear-messages"
  | "parallel"
  | "participant-spacing"
  | "entry-spacing"
  | "life-line-style"
  | "legacy-styling";

export type SeqdiagCompletionContext =
  | "lineStart"
  | "afterParticipant"
  | "afterArrow"
  | "afterColon"
  | "insideBlock"
  | "any";

export interface SyntaxEntry {
  id: string;
  category: SyntaxCategory;
  keywords: string[];
  patterns: string[];
  description: string;
  examples: string[];
  insertText: string;
  detail: string;
  kind: "keyword" | "snippet" | "operator";
  triggerContexts: SeqdiagCompletionContext[];
  priority: number;
  legacy?: boolean;
}

export type TokenKind =
  | "comment"
  | "keyword"
  | "arrow"
  | "participant"
  | "text"
  | "delimiter"
  | "unknown";

export interface Token {
  kind: TokenKind;
  value: string;
  start: number;
  end: number;
}

export type ParseIssueCode =
  | "unclosed-block"
  | "incomplete-message"
  | "unknown-token"
  | "unknown-participant"
  | "malformed-directive";

export interface ParseIssue {
  code: ParseIssueCode;
  message: string;
  severity: "error" | "warning";
  line: number;
  start: number;
  end: number;
  data?: Record<string, string>;
}

export interface ParseContext {
  cursorContext: SeqdiagCompletionContext;
  openBlocks: string[];
  participants: string[];
}

export interface ParseResult {
  issues: ParseIssue[];
  participants: Set<string>;
  openBlocks: Array<{ keyword: string; line: number }>;
}
