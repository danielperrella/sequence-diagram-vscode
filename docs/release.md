# Release Checklist (VS Code Marketplace)

## 1. Prepare version

1. Update `package.json` version.
2. Add a matching heading to `CHANGELOG.md`:
   - `## <version> - YYYY-MM-DD`
3. Keep `## Unreleased` at the top for future changes.

## 2. Run quality gate

```bash
corepack pnpm lint
corepack pnpm build
corepack pnpm test:unit
corepack pnpm test:webview
corepack pnpm release:preflight
```

## 3. Validate package locally

```bash
corepack pnpm package:check
corepack pnpm package
```

Confirm the generated `.vsix` does not include development-only files (`src/`, `test/`, CI/config internals).

## 4. Publish manually

Use GitHub Actions workflow `Publish Marketplace`:

1. Open Actions -> `Publish Marketplace`.
2. Run with `publish=false` for package-only validation, or `publish=true` for live publish.
3. Ensure repository secret `VSCE_PAT` is configured before live publish.

## 5. Post-publish verification

1. Verify marketplace listing metadata (name, description, icon, links).
2. Install the published extension in a clean VS Code profile.
3. Smoke test:
   - open `.seqdiag`
   - toggle preview
   - export SVG and PNG
   - disable `sequencediagram.preview.enabled` and confirm preview/export disable behavior.

## 6. Git housekeeping

1. Commit release prep changes in one commit.
2. Merge to release branch.
3. Create tag `v<version>` (example: `v1.0.0`).
