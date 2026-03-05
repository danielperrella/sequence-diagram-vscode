import * as vscode from "vscode";
import { getNonce } from "../utils/webview";

export function getWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const nonce = getNonce();
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "webview-runtime.js")
  );
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} data: blob: https: http:`,
    `style-src ${webview.cspSource} 'unsafe-inline' https: http:`,
    "font-src https: data:",
    `script-src 'nonce-${nonce}' ${webview.cspSource} https: http:`,
    "connect-src https: http:",
    "frame-src https: http: data: blob:"
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/@vscode/codicons/dist/codicon.css" />
  <title>SequenceDiagram Preview</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: var(--vscode-font-family);
    }

    html {
      height: 100%;
      overflow: hidden;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      overflow: hidden;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--vscode-textLink-foreground), transparent 82%), transparent 32%),
        var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }

    .headline {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    h1 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      margin-right: auto;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 999px;
      padding: 4px 10px;
      background: color-mix(in srgb, var(--vscode-badge-background), transparent 45%);
      font-size: 12px;
    }

    .pill::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--vscode-descriptionForeground);
      flex: 0 0 auto;
    }

    .pill[data-variant="ready"]::before {
      background: #2ea043;
    }

    .pill[data-variant="rendering"]::before {
      background: #d29922;
    }

    .pill[data-variant="error"]::before {
      background: #f85149;
    }

    .pill[data-variant="disabled"]::before {
      background: var(--vscode-disabledForeground);
    }

    .preview-shell {
      flex: 1;
      min-height: 0;
      border-radius: 14px;
      border: 1px solid var(--vscode-panel-border);
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--vscode-editorWidget-background), transparent 10%), transparent),
        var(--vscode-editorWidget-background);
      overflow: hidden;
      position: relative;
      padding: 18px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }

    .preview-toolbar {
      flex: 0 0 auto;
      z-index: 2;
      display: flex;
      gap: 6px;
    }

    .icon-button {
      width: 28px;
      height: 28px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--vscode-editor-foreground);
      background: color-mix(in srgb, var(--vscode-editorWidget-background), transparent 10%);
    }

    .icon-button:hover {
      background: color-mix(in srgb, var(--vscode-button-background), transparent 70%);
    }

    .icon-button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 1px;
    }

    .placeholder {
      position: absolute;
      inset: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed var(--vscode-panel-border);
      border-radius: 10px;
      padding: 18px;
      text-align: center;
      line-height: 1.5;
      opacity: 0.8;
    }

    .placeholder:empty {
      display: none;
    }

    .preview-shell img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      margin: 0;
      background: white;
      transform-origin: top left;
      user-select: none;
      -webkit-user-drag: none;
    }

    .hidden-frame {
      width: 0;
      height: 0;
      border: 0;
      position: absolute;
      inset: auto;
      visibility: hidden;
    }
  </style>
</head>
<body>
  <div class="headline">
    <h1>Rendered Preview</h1>
    <span id="previewBadge" class="pill" data-variant="rendering">Rendering</span>
    <div id="zoomToolbar" class="preview-toolbar" title="Zoom: 100%">
      <button id="zoomOut" class="icon-button" type="button" title="Zoom out" aria-label="Zoom out">
        <span class="codicon codicon-zoom-out" aria-hidden="true"></span>
      </button>
      <button id="zoomReset" class="icon-button" type="button" title="Reset zoom" aria-label="Reset zoom">
        <span class="codicon codicon-screen-normal" aria-hidden="true"></span>
      </button>
      <button id="zoomIn" class="icon-button" type="button" title="Zoom in" aria-label="Zoom in">
        <span class="codicon codicon-zoom-in" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <div id="previewShell" class="preview-shell">
    <img id="previewImage" alt="" hidden />
    <div id="placeholder" class="placeholder"></div>
  </div>
  <iframe id="runtimeFrame" class="hidden-frame" sandbox="allow-scripts allow-same-origin"></iframe>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
