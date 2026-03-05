import * as path from "node:path";
import * as vscode from "vscode";
import { getRendererConfig } from "../configuration";
import { DiagramExportService } from "../export/exportService";
import { appLogger, ScopedLogger } from "../logging/logger";
import {
  ExtensionToWebviewMessage,
  RenderFormat,
  RenderResult,
  RendererConfig,
  WebviewToExtensionMessage
} from "../protocol";
import { createRenderer } from "../rendering";
import { getWebviewHtml } from "../webview/app";

interface RendererBootstrap {
  rendererHtml: string | null;
  rendererError?: string;
}

interface PendingRenderRequest {
  resolve: (value: RenderResult) => void;
}

interface QueuedMessage {
  message: ExtensionToWebviewMessage;
}

export class SequenceDiagramPreviewController implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private currentConfig: RendererConfig;
  private currentDocument: vscode.TextDocument | undefined;
  private currentSource = "";
  private readonly pendingRenderRequests = new Map<number, PendingRenderRequest>();
  private nextRenderRequestId = 0;
  private isWebviewReady = false;
  private readonly queuedMessages: QueuedMessage[] = [];
  private readonly logger = appLogger.child("PreviewController");
  private readonly exportService: DiagramExportService;
  private readonly disposables: vscode.Disposable[] = [];

  public constructor(private readonly context: vscode.ExtensionContext) {
    this.currentConfig = getRendererConfig();
    this.exportService = new DiagramExportService(vscode.window, vscode.workspace.fs, this.logger.child("Export"));

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        void this.handleActiveTextEditorChange(editor);
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        void this.handleDocumentChange(event);
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("sequencediagram")) {
          void this.handleConfigurationChange();
        }
      })
    );

    void this.handleActiveTextEditorChange(vscode.window.activeTextEditor);
  }

  public dispose(): void {
    this.panel?.dispose();
    vscode.Disposable.from(...this.disposables).dispose();
  }

  public async togglePreview(): Promise<void> {
    if (!this.panel) {
      await this.openPreviewPanel();
      return;
    }

    this.panel.reveal(vscode.ViewColumn.Beside, true);
    await this.handleActiveTextEditorChange(vscode.window.activeTextEditor);
  }

  public async reloadPreview(): Promise<boolean> {
    if (!this.panel || !this.currentDocument) {
      return false;
    }

    await this.postMessage({
      type: "setSource",
      source: this.currentSource
    });
    return true;
  }

  public async exportDiagram(format: RenderFormat): Promise<boolean> {
    if (!this.panel || !this.currentDocument) {
      return false;
    }

    const result = await this.requestRender(format);

    if (!result.ok) {
      this.logger.error(`Export failed: ${result.message}`);
      void vscode.window.showErrorMessage(`Unable to export diagram: ${result.message}`);
      return true;
    }

    const selectedUri = await this.exportService.exportFromDataUrl(
      this.currentDocument.uri,
      format,
      result.dataUrl
    );

    if (!selectedUri) {
      return true;
    }

    void vscode.window.showInformationMessage(
      `Sequence diagram exported to ${path.basename(selectedUri.fsPath)}.`
    );
    return true;
  }

  private async openPreviewPanel(): Promise<void> {
    this.panel = vscode.window.createWebviewPanel(
      "sequencediagram.preview",
      "SequenceDiagram Preview",
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
        localResourceRoots: [this.context.extensionUri],
        retainContextWhenHidden: true
      }
    );
    this.isWebviewReady = false;
    this.queuedMessages.length = 0;
    this.panel.webview.html = getWebviewHtml(this.panel.webview, this.context.extensionUri);

    const panelDisposables: vscode.Disposable[] = [];
    panelDisposables.push(
      this.panel.webview.onDidReceiveMessage((message: WebviewToExtensionMessage) => {
        void this.handleWebviewMessage(message);
      }),
      this.panel.onDidDispose(() => {
        this.logger.info("Preview panel disposed.");
        this.panel = undefined;
        this.isWebviewReady = false;
        this.queuedMessages.length = 0;
        this.pendingRenderRequests.clear();
        vscode.Disposable.from(...panelDisposables).dispose();
      })
    );

    this.captureSeqdiagContext(vscode.window.activeTextEditor);
    const bootstrap = await this.getRendererBootstrap();
    await this.postMessage({
      type: "bootstrap",
      source: this.currentSource,
      config: this.currentConfig,
      rendererHtml: bootstrap.rendererHtml,
      rendererError: bootstrap.rendererError
    });
  }

  private async handleActiveTextEditorChange(editor: vscode.TextEditor | undefined): Promise<void> {
    if (!editor || !isSeqdiagDocument(editor.document)) {
      this.logger.info("Focus moved to non-.seqdiag: keep current preview");
      return;
    }

    const hasChanged = this.captureSeqdiagContext(editor);
    const nextDocumentUri = this.currentDocument?.uri.toString();

    if (!hasChanged) {
      this.logger.info("Focus changed but same .seqdiag: skip rerender");
      return;
    }

    this.logger.info(`Focus changed to new .seqdiag: ${nextDocumentUri ?? "unknown"}, pushing setSource`);

    if (this.panel) {
      await this.postMessage({
        type: "setSource",
        source: this.currentSource
      });
    }
  }

  private async handleDocumentChange(event: vscode.TextDocumentChangeEvent): Promise<void> {
    if (!this.currentDocument) {
      return;
    }

    if (event.document.uri.toString() !== this.currentDocument.uri.toString()) {
      return;
    }

    this.currentSource = event.document.getText();

    if (!this.panel) {
      return;
    }

    await this.postMessage({
      type: "setSource",
      source: this.currentSource
    });
  }

  private async handleConfigurationChange(): Promise<void> {
    this.currentConfig = getRendererConfig();

    if (!this.panel) {
      return;
    }

    const bootstrap = await this.getRendererBootstrap();
    await this.postMessage({
      type: "setConfig",
      config: this.currentConfig,
      rendererHtml: bootstrap.rendererHtml,
      rendererError: bootstrap.rendererError
    });
    await this.postMessage({
      type: "setSource",
      source: this.currentSource
    });
  }

  private captureSeqdiagContext(editor: vscode.TextEditor | undefined): boolean {
    if (!editor || !isSeqdiagDocument(editor.document)) {
      return false;
    }

    const previousDocumentUri = this.currentDocument?.uri.toString();
    const nextDocumentUri = editor.document.uri.toString();

    this.currentDocument = editor.document;
    this.currentSource = editor.document.getText();

    return previousDocumentUri !== nextDocumentUri;
  }

  private async requestRender(format: RenderFormat): Promise<RenderResult> {
    const requestId = ++this.nextRenderRequestId;
    this.logger.info(`Queueing ${format.toUpperCase()} render request ${requestId}.`);

    return new Promise<RenderResult>((resolve) => {
      this.pendingRenderRequests.set(requestId, { resolve });
      void this.postMessage({
        type: "render",
        source: this.currentSource,
        format,
        requestId,
        reason: "export"
      });
    });
  }

  private async getRendererBootstrap(): Promise<RendererBootstrap> {
    if (!this.currentConfig.previewEnabled) {
      this.logger.warn("Renderer bootstrap skipped because preview is disabled.");
      return {
        rendererHtml: null,
        rendererError: "Remote preview is disabled."
      };
    }

    const renderer = createRenderer(this.currentConfig);
    const validationError = renderer.validate();

    if (validationError) {
      this.logger.error(`Renderer configuration validation failed: ${validationError.message}`);
      return {
        rendererHtml: null,
        rendererError: validationError.message
      };
    }

    try {
      this.logger.info(`Loading renderer bootstrap from ${this.currentConfig.baseUrl}.`);
      return {
        rendererHtml: await renderer.loadRuntimeHtml()
      };
    } catch (error) {
      this.logger.error(
        `Unable to load renderer runtime: ${error instanceof Error ? error.message : "Unknown error."}`
      );
      return {
        rendererHtml: null,
        rendererError: error instanceof Error ? error.message : "Unable to load renderer runtime."
      };
    }
  }

  private async postMessage(message: ExtensionToWebviewMessage): Promise<void> {
    if (!this.panel) {
      return;
    }

    if (!this.isWebviewReady) {
      this.queuedMessages.push({ message });
      return;
    }

    await this.panel.webview.postMessage(message);
  }

  private async handleWebviewMessage(message: WebviewToExtensionMessage): Promise<void> {
    switch (message.type) {
      case "ready":
        this.isWebviewReady = true;
        await this.flushQueuedMessages();
        break;
      case "renderResult":
        this.pendingRenderRequests.get(message.requestId)?.resolve(message.result);
        this.pendingRenderRequests.delete(message.requestId);
        break;
      case "log":
        logFromWebview(this.logger, message.scope, message.level, message.message);
        break;
      default:
        break;
    }
  }

  private async flushQueuedMessages(): Promise<void> {
    while (this.queuedMessages.length > 0) {
      const queued = this.queuedMessages.shift();

      if (!queued || !this.panel) {
        continue;
      }

      await this.panel.webview.postMessage(queued.message);
    }
  }
}

function logFromWebview(
  logger: ScopedLogger,
  scope: string,
  level: "info" | "warn" | "error",
  message: string
): void {
  const scopedLogger = logger.child(`Webview:${scope}`);

  switch (level) {
    case "error":
      scopedLogger.error(message);
      break;
    case "warn":
      scopedLogger.warn(message);
      break;
    default:
      scopedLogger.info(message);
      break;
  }
}

function isSeqdiagDocument(document: vscode.TextDocument): boolean {
  return document.languageId === "seqdiag" || document.uri.path.endsWith(".seqdiag");
}
