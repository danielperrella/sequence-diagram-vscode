import { findArrow } from "./tokenizer";
import { ParseContext, ParseIssue, ParseResult, SeqdiagCompletionContext } from "./types";

const BLOCK_OPENERS = new Set(["alt", "opt", "loop", "par", "critical", "break", "group", "frame", "box", "participantgroup"]);
const BLOCK_MIDDLE = new Set(["else"]);
const DIRECTIVES_WITH_REQUIRED_VALUE = new Set([
  "title",
  "participantspacing",
  "entryspacing",
  "lifelinestyle",
  "activecolor",
  "font",
  "style",
  "textstyle",
  "defstyle",
  "applystyle",
  "link"
]);
const PARTICIPANT_KEYWORDS = new Set(["participant", "actor", "boundary", "control", "entity", "database", "collections"]);

export function parseDocument(source: string): ParseResult {
  const lines = source.split(/\r?\n/);
  const issues: ParseIssue[] = [];
  const participants = new Set<string>();
  const openBlocks: Array<{ keyword: string; line: number }> = [];

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
      return;
    }

    const firstWord = firstKeyword(trimmed);

    if (firstWord && PARTICIPANT_KEYWORDS.has(firstWord)) {
      const participantName = extractParticipantName(trimmed);
      if (participantName) {
        participants.add(participantName);
      }
      return;
    }

    if (firstWord && BLOCK_OPENERS.has(firstWord)) {
      openBlocks.push({ keyword: firstWord, line: lineIndex });
      return;
    }

    if (firstWord === "end") {
      if (openBlocks.length === 0) {
        issues.push({
          code: "unknown-token",
          message: "Found `end` without an open block.",
          severity: "warning",
          line: lineIndex,
          start: line.indexOf("end"),
          end: line.indexOf("end") + 3
        });
      } else {
        openBlocks.pop();
      }
      return;
    }

    if (firstWord && BLOCK_MIDDLE.has(firstWord) && openBlocks.length === 0) {
      issues.push({
        code: "unknown-token",
        message: "Found fragment branch without a matching open fragment.",
        severity: "warning",
        line: lineIndex,
        start: line.indexOf(firstWord),
        end: line.indexOf(firstWord) + firstWord.length
      });
      return;
    }

    if (firstWord && DIRECTIVES_WITH_REQUIRED_VALUE.has(firstWord) && trimmed === firstWord) {
      issues.push({
        code: "malformed-directive",
        message: `Directive \`${firstWord}\` requires a value.`,
        severity: "warning",
        line: lineIndex,
        start: line.indexOf(firstWord),
        end: line.indexOf(firstWord) + firstWord.length,
        data: { keyword: firstWord }
      });
      return;
    }

    const arrow = findArrow(line);
    if (arrow) {
      const left = line.slice(0, arrow.start).trim();
      const rightAndMessage = line.slice(arrow.start + arrow.value.length);
      const colonIndex = rightAndMessage.indexOf(":");
      const right = (colonIndex >= 0 ? rightAndMessage.slice(0, colonIndex) : rightAndMessage).trim();
      const message = colonIndex >= 0 ? rightAndMessage.slice(colonIndex + 1).trim() : "";

      if (!left || !right || !message) {
        issues.push({
          code: "incomplete-message",
          message: "Message lines should include sender, receiver, and message text.",
          severity: "warning",
          line: lineIndex,
          start: arrow.start,
          end: arrow.start + arrow.value.length
        });
        return;
      }

      if (participants.size > 0) {
        if (!participants.has(stripDecorators(left))) {
          issues.push({
            code: "unknown-participant",
            message: `Sender \`${left}\` was not declared as a participant.`,
            severity: "warning",
            line: lineIndex,
            start: line.indexOf(left),
            end: line.indexOf(left) + left.length,
            data: { participant: left }
          });
        }
        if (!participants.has(stripDecorators(right))) {
          const rightStart = line.indexOf(right, arrow.start + arrow.value.length);
          issues.push({
            code: "unknown-participant",
            message: `Receiver \`${right}\` was not declared as a participant.`,
            severity: "warning",
            line: lineIndex,
            start: rightStart,
            end: rightStart + right.length,
            data: { participant: right }
          });
        }
      }
      return;
    }
  });

  for (const block of openBlocks) {
    issues.push({
      code: "unclosed-block",
      message: `Block \`${block.keyword}\` is missing a closing \`end\`.`,
      severity: "warning",
      line: block.line,
      start: 0,
      end: block.keyword.length,
      data: { keyword: block.keyword }
    });
  }

  return {
    issues,
    participants,
    openBlocks
  };
}

export function detectCompletionContext(source: string, line: number, character: number): ParseContext {
  const lines = source.split(/\r?\n/);
  const safeLine = Math.max(0, Math.min(line, Math.max(lines.length - 1, 0)));
  const currentLine = lines[safeLine] ?? "";
  const prefix = currentLine.slice(0, character);
  const parseResult = parseDocument(source);

  let cursorContext: SeqdiagCompletionContext = "any";
  const trimmedPrefix = prefix.trimStart();

  if (!trimmedPrefix.length) {
    cursorContext = "lineStart";
  } else if (findArrow(prefix)) {
    if (!prefix.includes(":")) {
      cursorContext = "afterArrow";
    } else {
      cursorContext = "afterColon";
    }
  } else if (/^[A-Za-z0-9_.\-[\]"]+\s*$/.test(trimmedPrefix)) {
    cursorContext = "afterParticipant";
  }

  if (parseResult.openBlocks.length > 0 && cursorContext === "lineStart") {
    cursorContext = "insideBlock";
  }

  return {
    cursorContext,
    openBlocks: parseResult.openBlocks.map((block) => block.keyword),
    participants: [...parseResult.participants]
  };
}

function firstKeyword(line: string): string | undefined {
  const match = /^([A-Za-z][\w-]*)/.exec(line);
  return match ? match[1].toLowerCase() : undefined;
}

function extractParticipantName(line: string): string | undefined {
  const aliasMatch = /\bas\s+([A-Za-z0-9_.-]+)/i.exec(line);
  if (aliasMatch?.[1]) {
    return aliasMatch[1];
  }

  const declarationMatch = /^(?:participant|actor|boundary|control|entity|database|collections)\s+("[^"]+"|\[[^\]]+\]|[A-Za-z0-9_.-]+)/i.exec(
    line
  );
  if (!declarationMatch?.[1]) {
    return undefined;
  }

  return stripDecorators(declarationMatch[1]);
}

function stripDecorators(value: string): string {
  return value.replace(/^"|"$/g, "").replace(/^\[|\]$/g, "").trim();
}
