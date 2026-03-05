# Release Checklist (VS Code Marketplace)

## 0. First-time setup (click-by-click)

Complete this section once per publisher/repository.

### 0.1 Create or verify Marketplace publisher

1. Open `https://marketplace.visualstudio.com/manage` and sign in with your Microsoft account.
2. Open **Publishers**.
3. If `PerrellaDaniel` already exists, open it and confirm you can manage it.
4. If it does not exist, select **Create publisher** and fill:
   - Publisher ID: `PerrellaDaniel`
   - Display name: `Daniel Perrella` (or your preferred public name)
5. Save and verify the publisher page is active.

### 0.2 Create a Personal Access Token (Azure DevOps)

1. Open `https://dev.azure.com` and sign in with the same account.
2. Select top-right profile icon -> **Personal access tokens**.
3. Select **+ New Token**.
4. Set:
   - Name: `vsce-marketplace-publish`
   - Organization: `All accessible organizations`
   - Expiration: choose a policy-compliant date
   - Scopes: `Custom defined` -> `Marketplace` -> `Manage`
5. Select **Create**.
6. Copy the token immediately (it will not be shown again).

### 0.3 Configure GitHub repository secret

1. Open your repository on GitHub.
2. Go to **Settings** -> **Secrets and variables** -> **Actions**.
3. Select **New repository secret**.
4. Set:
   - Name: `VSCE_PAT`
   - Secret: paste the Azure DevOps PAT from step 0.2
5. Save and verify `VSCE_PAT` appears in the repository secrets list.

### 0.4 Verify extension manifest identity

1. Open `package.json`.
2. Confirm:
   - `"publisher": "PerrellaDaniel"`
   - `"author": "Daniel Perrella"`
3. Commit any pending metadata changes before release.

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
2. Run with `publish=false` for package-only validation.
3. Download `vsix-package` artifact and optionally install locally (`Extensions: Install from VSIX...`).
4. Run again with `publish=true` for live publish.
5. Ensure repository secret `VSCE_PAT` is configured before live publish.

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
