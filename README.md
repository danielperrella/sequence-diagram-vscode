# SequenceDiagram for VS Code

Work with [SequenceDiagram](https://sequencediagram.org) diagrams directly in Visual Studio Code.

This extension keeps `.seqdiag` as plain text source in your workspace and renders diagrams in a split preview panel.

## Features

- Split preview for `.seqdiag` files
- Live rendering powered by the public `https://sequencediagram.org` runtime
- SVG and PNG export commands
- Writing assistance for `.seqdiag`:
  - autocomplete
  - hover help
  - snippets
  - diagnostics and quick fixes
- Zoom and pan controls in the preview panel

## Install

1. Open Visual Studio Code.
2. Open Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for `SequenceDiagram for VS Code`.
4. Install and open any `.seqdiag` file.

For manual installation, build a `.vsix` and install with `Extensions: Install from VSIX...`.

## Quick Start

1. Create or open a `.seqdiag` file.
2. Run `SequenceDiagram: Toggle Preview`.
3. Edit the text source and watch the split preview update.
4. Export via:
   - `SequenceDiagram: Export SVG`
   - `SequenceDiagram: Export PNG`

## Commands

- `SequenceDiagram: Toggle Preview`
- `SequenceDiagram: Reload Preview`
- `SequenceDiagram: Export SVG`
- `SequenceDiagram: Export PNG`
- `SequenceDiagram: Insert Snippet`

## Configuration

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `sequencediagram.preview.enabled` | `boolean` | `true` | Enables or disables remote preview/export rendering. |
| `sequencediagram.preview.debounceMs` | `number` | `300` | Delay before rerendering preview after edits. |
| `sequencediagram.export.defaultFormat` | `svg \| png` | `svg` | Preferred export format. |
| `sequencediagram.defaultDiagram` | `string` | built-in example | Initial content for new untitled diagrams. |

## Privacy, Network, and Offline Behavior

- `.seqdiag` files remain local and are the source of truth.
- Preview and export require the public SequenceDiagram runtime loaded from `https://sequencediagram.org`.
- If you disable remote rendering:

```json
"sequencediagram.preview.enabled": false
```

editing remains available, but preview and export are disabled.

## Known Limitations

- Preview and export are network-dependent because rendering uses the public SequenceDiagram runtime.
- When offline (or if the remote runtime is unreachable), rendering and export are unavailable.
- Integration and UI smoke suites are designed primarily for CI Linux environments.

## Development

### Requirements

- Node.js 24+
- `corepack`
- VS Code

### Setup

```bash
corepack enable
corepack prepare pnpm@10.6.5 --activate
corepack pnpm install
```

### Build and test

```bash
corepack pnpm build
corepack pnpm lint
corepack pnpm test:unit
corepack pnpm test:webview
```

### Full watchdog run

```bash
corepack pnpm test
```

### Package

```bash
corepack pnpm package
```

### Release checklist

Release flow is documented in [`docs/release.md`](./docs/release.md).

## Project Structure

```text
.
├── media/
├── src/
├── test/
├── docs/
├── package.json
└── tsconfig.json
```

## Contributing

Pull requests are welcome. Keep these rules intact:

- `.seqdiag` remains source of truth
- VS Code is the primary editing surface
- renderer integration remains isolated from editor logic
- network-dependent behavior is documented clearly

## License

[MIT](./LICENSE)
