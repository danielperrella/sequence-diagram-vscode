# Changelog

## Unreleased

- remove deprecated `onCommand:*` activation events from extension manifest.
- fix command palette labels by avoiding duplicated `SequenceDiagram` prefix in command titles.

## 1.0.0 - 2026-03-05

- remove configurable renderer modes; preview/export now always use the public `https://sequencediagram.org` runtime.
- simplify preview header UI: keep only one status chip plus zoom controls next to the title.
- add status chip semaphore indicator (`Ready` green, `Rendering` orange, `Error` red, `Disabled` gray).
- add full in-editor writing assistance for `.seqdiag`:
  - context-aware autocomplete mapped to the official instructions syntax;
  - hover documentation with syntax examples;
  - diagnostics for common authoring errors and quick fixes;
  - snippet insertion command (`SequenceDiagram: Insert Snippet`);
  - `Insert Snippet` templates now also show in IntelliSense suggestions.
- switch to standard VS Code text editor plus split preview panel for `.seqdiag` files.
- remove custom editor manifest contribution and runtime wiring.
- replace `SequenceDiagram: Open Editor` with `SequenceDiagram: Toggle Preview` (breaking command rename).
- remove `SequenceDiagram: Open Text Source` command.
- show preview/export/reload buttons in editor title bar for `.seqdiag` files.
- remove `Loading SequenceDiagram runtime...` placeholder text during renderer mount.
- remove idle placeholder copy under preview and hide pre-render image alt text.
- rerender on focus change only when switching to a different `.seqdiag` document.
- add preview zoom controls (`zoom in`, `zoom out`, `reset`) plus `Ctrl + mouse wheel` zoom in the webview.
- allow click-drag panning inside the preview while zoomed in.
- support Figma-style preview panning with `Space + drag` at any zoom level.
- disable native vertical scrolling in the preview container and keep panning via drag.
- prevent parent/container vertical overflow on layout resize in preview webview.
- add icon contributions for reload/export/snippet commands and show snippet action in `.seqdiag` editor title.

### Breaking changes

- replaced `SequenceDiagram: Open Editor` with `SequenceDiagram: Toggle Preview`.
- removed `SequenceDiagram: Open Text Source`.
- switched from custom editor contribution to standard VS Code text editor + split preview.

## 0.0.1

- scaffolding iniziale del repository;
- base TypeScript per estensione VS Code;
- custom editor per file `.seqdiag`;
- preview webview con renderer configurabile `public` o `onPrem`;
- export `SVG` e `PNG`;
- setup documentato per utilizzo con `pnpm`;
- infrastruttura di test con unit, webview, integration e watchdog reporting.
