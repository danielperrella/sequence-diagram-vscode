# AGENTS.md

## Source Scope

Questa cartella contiene il codice TypeScript dell'estensione VS Code.

## Guidelines

- Mantieni `extension.ts` leggero: bootstrap, registrazione comandi e wiring.
- Sposta la logica della webview in moduli dedicati sotto `src/webview/`.
- Mantieni l'integrazione dell'editor custom sotto `src/editor/`.
- Mantieni gli adapter renderer sotto `src/rendering/`.
- Se cambi la webview, preserva moduli runtime testabili sotto `src/webview/runtime/`.
- Evita dipendenze cicliche tra moduli `src/`.
- Se aggiungi messaggistica tra webview ed extension host, tipizza payload e messaggi.
