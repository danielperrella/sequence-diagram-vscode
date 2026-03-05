import { ExtensionToWebviewMessage, RenderFormat, RenderResult, RendererConfig } from "../../protocol";
import { PreviewScheduler } from "./previewScheduler";
import { RendererClient } from "./rendererClient";
import {
  canPan,
  defaultPreviewZoomConfig,
  nextPanTranslation,
  normalizedPanTranslationForZoom,
  wheelDirection,
  withZoomDelta
} from "./zoom";

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
};

interface DomRefs {
  previewImage: HTMLImageElement;
  previewShell: HTMLDivElement;
  zoomToolbar: HTMLDivElement;
  zoomIn: HTMLButtonElement;
  zoomOut: HTMLButtonElement;
  zoomReset: HTMLButtonElement;
  placeholder: HTMLDivElement;
  previewBadge: HTMLSpanElement;
  runtimeFrame: HTMLIFrameElement;
}

interface BootstrapLike {
  source: string;
  config: RendererConfig;
  rendererHtml: string | null;
  rendererError?: string;
}

interface PanState {
  startClientX: number;
  startClientY: number;
  startTranslateX: number;
  startTranslateY: number;
}

export class SequenceDiagramWebviewRuntime {
  private readonly vscodeApi = acquireVsCodeApi();
  private readonly rendererClient: RendererClient;
  private readonly scheduler = new PreviewScheduler(
    {
      setTimeout: (handler, delay) => window.setTimeout(handler, delay),
      clearTimeout: (handle) => window.clearTimeout(handle)
    },
    (requestId) => {
      void this.performRender("svg", requestId, "preview");
    }
  );

  private source = "";
  private config: RendererConfig | undefined;
  private rendererHtml: string | null = null;
  private rendererError = "";
  private rendererReady = false;
  private latestPreviewRequestId = 0;
  private currentZoom = 1;
  private readonly zoomConfig = defaultPreviewZoomConfig;
  private panState: PanState | null = null;
  private isSpacePressed = false;
  private translateX = 0;
  private translateY = 0;

  public constructor(private readonly dom: DomRefs) {
    this.rendererClient = new RendererClient(dom.runtimeFrame, {
      log: (level, scope, message) => this.emitLog(level, scope, message)
    });
  }

  public initialize(): void {
    this.emitLog("info", "Lifecycle", "Webview runtime initialized.");
    this.bindZoomControls();
    this.applyZoom();

    window.addEventListener("message", (event) => {
      void this.handleMessage(event.data as ExtensionToWebviewMessage);
    });

    this.vscodeApi.postMessage({ type: "ready" });
  }

  private bindZoomControls(): void {
    this.dom.zoomIn.addEventListener("click", () => {
      this.setZoom(withZoomDelta(this.currentZoom, this.zoomConfig.step, this.zoomConfig));
    });

    this.dom.zoomOut.addEventListener("click", () => {
      this.setZoom(withZoomDelta(this.currentZoom, -this.zoomConfig.step, this.zoomConfig));
    });

    this.dom.zoomReset.addEventListener("click", () => {
      this.translateX = 0;
      this.translateY = 0;
      this.setZoom(1);
    });

    this.dom.previewShell.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        if (!event.ctrlKey) {
          return;
        }

        const direction = wheelDirection(event.deltaY);
        if (direction === 0) {
          return;
        }

        event.preventDefault();
        this.setZoom(withZoomDelta(this.currentZoom, direction * this.zoomConfig.step, this.zoomConfig));
      },
      { passive: false }
    );

    this.dom.previewShell.addEventListener("mousedown", (event: MouseEvent) => {
      if (event.button !== 0 || !this.canPan()) {
        return;
      }

      if (event.target instanceof HTMLElement && this.dom.zoomToolbar.contains(event.target)) {
        return;
      }

      event.preventDefault();
      this.panState = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startTranslateX: this.translateX,
        startTranslateY: this.translateY
      };
      this.updatePanCursor();
    });

    window.addEventListener("mousemove", (event: MouseEvent) => {
      if (!this.panState) {
        return;
      }

      const deltaX = event.clientX - this.panState.startClientX;
      const deltaY = event.clientY - this.panState.startClientY;
      const next = nextPanTranslation(
        { x: this.panState.startTranslateX, y: this.panState.startTranslateY },
        deltaX,
        deltaY
      );
      this.translateX = next.x;
      this.translateY = next.y;
      this.applyZoom();
    });

    window.addEventListener("mouseup", () => {
      if (!this.panState) {
        return;
      }

      this.panState = null;
      this.updatePanCursor();
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.code !== "Space" || isInteractiveElement(event.target)) {
        return;
      }

      if (!this.isSpacePressed) {
        this.isSpacePressed = true;
        this.updatePanCursor();
      }

      event.preventDefault();
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.code !== "Space") {
        return;
      }

      this.isSpacePressed = false;
      const nextTranslation = normalizedPanTranslationForZoom(this.currentZoom, this.isSpacePressed, {
        x: this.translateX,
        y: this.translateY
      });
      this.translateX = nextTranslation.x;
      this.translateY = nextTranslation.y;
      this.applyZoom();
      this.updatePanCursor();

      if (!isInteractiveElement(event.target)) {
        event.preventDefault();
      }
    });

    window.addEventListener("blur", () => {
      if (!this.panState) {
        this.isSpacePressed = false;
        const nextTranslation = normalizedPanTranslationForZoom(this.currentZoom, this.isSpacePressed, {
          x: this.translateX,
          y: this.translateY
        });
        this.translateX = nextTranslation.x;
        this.translateY = nextTranslation.y;
        this.applyZoom();
        this.updatePanCursor();
        return;
      }

      this.panState = null;
      this.isSpacePressed = false;
      const nextTranslation = normalizedPanTranslationForZoom(this.currentZoom, this.isSpacePressed, {
        x: this.translateX,
        y: this.translateY
      });
      this.translateX = nextTranslation.x;
      this.translateY = nextTranslation.y;
      this.applyZoom();
      this.updatePanCursor();
    });
  }

  public async handleMessage(message: ExtensionToWebviewMessage): Promise<void> {
    switch (message.type) {
      case "bootstrap":
        this.emitLog("info", "Lifecycle", "Received bootstrap message from extension host.");
        this.applyBootstrap(message);
        await this.mountRenderer();
        break;
      case "setSource":
        this.emitLog("info", "Preview", "Received source update from extension host.");
        this.source = message.source;
        this.schedulePreviewRender(true);
        break;
      case "setConfig":
        this.emitLog("info", "Lifecycle", "Received configuration update from extension host.");
        this.applyBootstrap({
          source: this.source,
          config: message.config,
          rendererHtml: message.rendererHtml,
          rendererError: message.rendererError
        });
        await this.mountRenderer();
        break;
      case "render":
        this.emitLog(
          "info",
          "Renderer",
          `Received explicit render request ${message.requestId} for format ${message.format}.`
        );
        await this.performRender(message.format, message.requestId, message.reason);
        break;
    }
  }

  private applyBootstrap(payload: BootstrapLike): void {
    this.source = payload.source;
    this.config = payload.config;
    this.rendererHtml = payload.rendererHtml;
    this.rendererError = payload.rendererError ?? "";
  }

  private async mountRenderer(): Promise<void> {
    this.rendererReady = false;

    if (!this.config || !this.config.previewEnabled) {
      this.rendererError = "Remote preview is disabled in settings.";
      this.emitLog("warn", "Renderer", this.rendererError);
      this.setStatus("Disabled");
      this.showPlaceholder(this.rendererError);
      return;
    }

    if (!this.rendererHtml) {
      this.rendererError = this.rendererError || "Renderer HTML is not available.";
      this.emitLog("error", "Renderer", this.rendererError);
      this.setStatus("Error");
      this.showPlaceholder(this.rendererError);
      return;
    }

    this.emitLog("info", "Renderer", `Mounting renderer runtime from ${this.config.baseUrl}.`);
    this.setStatus("Loading");

    try {
      await this.rendererClient.mount(this.rendererHtml, this.config.baseUrl);
      this.rendererReady = true;
      this.rendererError = "";
      this.setStatus("Ready");
      this.schedulePreviewRender(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Renderer did not become ready.";
      this.rendererError = message;
      this.setStatus("Error");
      this.showPlaceholder(message);
      this.emitLog("error", "Renderer", message);
    }
  }

  private schedulePreviewRender(forceImmediate: boolean): void {
    if (!this.config) {
      return;
    }

    if (!this.config.previewEnabled) {
      this.emitLog("warn", "Preview", "Preview render scheduling skipped because preview is disabled.");
      this.setStatus("Disabled");
      this.showPlaceholder("Preview disabled by configuration.");
      return;
    }

    const delay = forceImmediate ? 0 : this.config.debounceMs;
    const requestId = this.scheduler.schedule(delay);
    this.emitLog("info", "Preview", `Scheduling preview render request ${requestId} with delay ${delay}ms.`);
  }

  private async performRender(
    format: RenderFormat,
    requestId: number,
    reason: "preview" | "export"
  ): Promise<void> {
    if (!this.source.trim()) {
      if (reason === "preview") {
        this.latestPreviewRequestId = requestId;
        this.setStatus("Idle");
        this.showPlaceholder("");
      }

      this.emitResult(requestId, {
        ok: false,
        code: "render",
        message: "Document is empty."
      });
      return;
    }

    if (!this.rendererReady) {
      this.emitLog("warn", "Renderer", "Render requested before renderer was ready.");
      this.emitResult(requestId, {
        ok: false,
        code: "network",
        message: this.rendererError || "Renderer is not ready yet."
      });
      return;
    }

    if (reason === "preview" && format === "svg") {
      this.emitLog("info", "Preview", `Starting SVG preview render request ${requestId}.`);
      this.setStatus("Rendering");
    }

    const result = await this.rendererClient.render(format, this.source);

    if (reason === "preview" && requestId >= this.latestPreviewRequestId) {
      this.latestPreviewRequestId = requestId;

      if (result.ok && format === "svg") {
        this.showPreview(result.dataUrl);
        this.setStatus("Ready");
      } else if (!result.ok && format === "svg") {
        this.setStatus("Error");
        this.showPlaceholder(result.message);
      }
    }

    this.emitResult(requestId, result);
  }

  private emitResult(requestId: number, result: RenderResult): void {
    this.vscodeApi.postMessage({
      type: "renderResult",
      requestId,
      result
    });
  }

  private emitLog(level: "info" | "warn" | "error", scope: string, message: string): void {
    const prefix = `[SequenceDiagram][${scope}]`;

    switch (level) {
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      case "warn":
        console.warn(`${prefix} ${message}`);
        break;
      default:
        console.info(`${prefix} ${message}`);
        break;
    }

    this.vscodeApi.postMessage({ type: "log", level, scope, message });
  }

  private setStatus(kind: "Loading" | "Idle" | "Rendering" | "Ready" | "Error" | "Disabled"): void {
    const normalizedKind = kind === "Loading" ? "Rendering" : kind === "Idle" ? "Ready" : kind;
    this.dom.previewBadge.textContent = normalizedKind;
    this.dom.previewBadge.dataset.variant = toBadgeVariant(normalizedKind);
  }

  private showPlaceholder(message: string): void {
    this.dom.previewImage.hidden = true;
    this.dom.previewImage.removeAttribute("src");
    this.dom.placeholder.hidden = false;
    this.dom.placeholder.textContent = message;
    this.panState = null;
    this.translateX = 0;
    this.translateY = 0;
    this.updatePanCursor();
  }

  private showPreview(dataUrl: string): void {
    this.dom.placeholder.hidden = true;
    this.dom.previewImage.hidden = false;
    this.dom.previewImage.src = dataUrl;
    this.applyZoom();
  }

  private setZoom(nextZoom: number): void {
    this.currentZoom = nextZoom;
    const nextTranslation = normalizedPanTranslationForZoom(this.currentZoom, this.isSpacePressed, {
      x: this.translateX,
      y: this.translateY
    });
    this.translateX = nextTranslation.x;
    this.translateY = nextTranslation.y;
    this.applyZoom();
  }

  private applyZoom(): void {
    this.dom.previewImage.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.currentZoom})`;
    this.dom.zoomToolbar.setAttribute("title", `Zoom: ${Math.round(this.currentZoom * 100)}%`);
    this.updatePanCursor();
  }

  private canPan(): boolean {
    return !this.dom.previewImage.hidden && !!this.dom.previewImage.src && canPan(this.currentZoom, this.isSpacePressed);
  }

  private updatePanCursor(): void {
    if (!this.canPan()) {
      this.dom.previewShell.style.cursor = "default";
      return;
    }

    this.dom.previewShell.style.cursor = this.panState ? "grabbing" : "grab";
  }
}

function toBadgeVariant(kind: "Rendering" | "Ready" | "Error" | "Disabled"): string {
  switch (kind) {
    case "Ready":
      return "ready";
    case "Rendering":
      return "rendering";
    case "Disabled":
      return "disabled";
    default:
      return "error";
  }
}

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return !!target.closest("button, input, textarea, select, a, [contenteditable='true']");
}
