export type RenderFormat = "svg" | "png";

export interface RenderSuccess {
  ok: true;
  format: RenderFormat;
  dataUrl: string;
}

export interface RenderFailure {
  ok: false;
  code: "network" | "render" | "timeout" | "config";
  message: string;
}

export type RenderResult = RenderSuccess | RenderFailure;

export interface RendererConfig {
  baseUrl: string;
  debounceMs: number;
  previewEnabled: boolean;
  defaultExportFormat: RenderFormat;
}

export type ExtensionToWebviewMessage =
  | {
      type: "bootstrap";
      source: string;
      config: RendererConfig;
      rendererHtml: string | null;
      rendererError?: string;
    }
  | { type: "setSource"; source: string }
  | {
      type: "setConfig";
      config: RendererConfig;
      rendererHtml: string | null;
      rendererError?: string;
    }
  | {
      type: "render";
      source: string;
      format: RenderFormat;
      requestId: number;
      reason: "preview" | "export";
    };

export type WebviewToExtensionMessage =
  | { type: "ready" }
  | { type: "documentChanged"; source: string }
  | { type: "renderResult"; result: RenderResult; requestId: number }
  | {
      type: "log";
      level: "info" | "warn" | "error";
      scope: string;
      message: string;
    };
