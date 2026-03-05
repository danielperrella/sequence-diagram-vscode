import { Token } from "./types";

const ARROW_TOKENS = ["-->>", "->>", "-->", "->", "<--", "<-", "=>", "=>>", "-x", "x-"];

export function tokenizeLine(line: string): Token[] {
  const trimmed = line.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return [{ kind: "comment", value: trimmed, start: line.indexOf(trimmed), end: line.length }];
  }

  const tokens: Token[] = [];
  const firstWordMatch = /^\s*([A-Za-z][\w-]*)/.exec(line);
  if (firstWordMatch) {
    const keyword = firstWordMatch[1];
    const start = line.indexOf(keyword);
    tokens.push({ kind: "keyword", value: keyword, start, end: start + keyword.length });
  }

  const arrow = findArrow(line);
  if (arrow) {
    tokens.push({ kind: "arrow", value: arrow.value, start: arrow.start, end: arrow.start + arrow.value.length });

    const left = line.slice(0, arrow.start).trim();
    const right = line.slice(arrow.start + arrow.value.length).split(":")[0].trim();

    if (left) {
      const leftStart = line.indexOf(left);
      tokens.push({ kind: "participant", value: left, start: leftStart, end: leftStart + left.length });
    }

    if (right) {
      const rightStart = line.indexOf(right, arrow.start + arrow.value.length);
      tokens.push({ kind: "participant", value: right, start: rightStart, end: rightStart + right.length });
    }
  }

  const colonIndex = line.indexOf(":");
  if (colonIndex >= 0) {
    tokens.push({ kind: "delimiter", value: ":", start: colonIndex, end: colonIndex + 1 });
    const message = line.slice(colonIndex + 1).trim();
    if (message) {
      const messageStart = line.indexOf(message, colonIndex + 1);
      tokens.push({ kind: "text", value: message, start: messageStart, end: messageStart + message.length });
    }
  }

  return tokens.sort((a, b) => a.start - b.start);
}

export function findArrow(line: string): { value: string; start: number } | undefined {
  let best: { value: string; start: number } | undefined;

  for (const arrow of ARROW_TOKENS) {
    const index = line.indexOf(arrow);
    if (index < 0) {
      continue;
    }

    if (!best || index < best.start || (index === best.start && arrow.length > best.value.length)) {
      best = { value: arrow, start: index };
    }
  }

  return best;
}
