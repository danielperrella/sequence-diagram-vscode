export interface SeqdiagSnippetTemplate {
  id: string;
  label: string;
  description: string;
  body: string;
}

export interface SeqdiagSnippetCompletionTemplate {
  id: string;
  label: string;
  detail: string;
  insertText: string;
  documentation: string;
  priority: number;
}

export const snippetTemplates: SeqdiagSnippetTemplate[] = [
  {
    id: "message-pair",
    label: "Message Pair",
    description: "Request and response between two participants.",
    body: "${1:Client}->${2:Server}: ${3:request}\n${2:Server}-->${1:Client}: ${4:response}"
  },
  {
    id: "note-over",
    label: "Note Over",
    description: "A note over one or multiple participants.",
    body: "note over ${1:Alice,Bob}: ${2:note}"
  },
  {
    id: "alt-else-end",
    label: "Alt / Else / End",
    description: "Conditional fragment skeleton.",
    body: "alt ${1:condition}\n  ${2:Alice->Bob: success}\nelse ${3:fallback}\n  ${4:Alice->Bob: failure}\nend"
  },
  {
    id: "loop-end",
    label: "Loop / End",
    description: "Loop fragment skeleton.",
    body: "loop ${1:while condition}\n  ${2:Alice->Bob: repeat}\nend"
  },
  {
    id: "participant-group",
    label: "Participant Group",
    description: "Group participants in a block.",
    body: "participantgroup ${1:Services}\n  participant ${2:API}\n  participant ${3:DB}\nend"
  },
  {
    id: "style-block",
    label: "Style Block",
    description: "Style directives for targets.",
    body: "style ${1:API} ${2:fill:#eef,stroke:#224}\ntextstyle ${3:message} ${4:bold}"
  },
  {
    id: "create-destroy",
    label: "Create / Destroy",
    description: "Participant lifecycle with activation.",
    body: "create ${1:Worker}\n${2:Controller}->${1:Worker}: ${3:start}\nactivate ${1:Worker}\n${1:Worker}-->${2:Controller}: ${4:done}\ndeactivate ${1:Worker}\ndestroy ${1:Worker}"
  },
  {
    id: "reference-divider",
    label: "Reference + Divider",
    description: "Reference callout and phase divider.",
    body: "ref over ${1:API,DB}: ${2:transaction detail}\n== ${3:Next Phase} =="
  }
];

export function getSnippetCompletionTemplates(): SeqdiagSnippetCompletionTemplate[] {
  return snippetTemplates.map((template) => ({
    id: template.id,
    label: `snippet: ${template.label}`,
    detail: "Template snippet",
    insertText: template.body,
    documentation: `${template.description}\n\nAvailable also in SequenceDiagram: Insert Snippet.`,
    priority: 25
  }));
}
