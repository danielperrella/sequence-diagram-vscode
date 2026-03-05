import { RenderFormat, RenderResult } from "../../protocol";
import { injectBaseTag, normalizeBaseUrl } from "./helpers";

type SeqWindow = Window & {
  SEQ?: {
    api?: Record<string, unknown>;
  };
};

export interface FrameApi {
  addEventListener(type: "load", listener: () => void): void;
  removeEventListener(type: "load", listener: () => void): void;
  srcdoc: string;
  contentWindow: SeqWindow | null;
}

export interface RendererClientLogger {
  log(level: "info" | "warn" | "error", scope: string, message: string): void;
}

export class RendererClient {
  public constructor(
    private readonly runtimeFrame: FrameApi,
    private readonly logger: RendererClientLogger
  ) {}

  public async mount(runtimeHtml: string, baseUrl: string, timeoutMs = 10000): Promise<void> {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    const runtimeHtmlWithBase = injectBaseTag(runtimeHtml, normalizedBaseUrl);

    await new Promise<void>((resolve, reject) => {
      const onLoad = async () => {
        this.runtimeFrame.removeEventListener("load", onLoad);

        try {
          await this.waitForRenderer(timeoutMs);
          this.logger.log("info", "Renderer", "Renderer runtime became ready.");
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      this.runtimeFrame.addEventListener("load", onLoad);
      this.runtimeFrame.srcdoc = runtimeHtmlWithBase;
    });
  }

  public async render(format: RenderFormat, source: string, timeoutMs = 10000): Promise<RenderResult> {
    const api = this.runtimeFrame.contentWindow?.SEQ?.api;

    if (!api) {
      return {
        ok: false,
        code: "render",
        message: "SequenceDiagram API is not available in the renderer frame."
      };
    }

    const methodName = format === "png" ? "generatePngDataUrl" : "generateSvgDataUrl";
    const method = api[methodName];

    if (typeof method !== "function") {
      return {
        ok: false,
        code: "render",
        message: `Renderer method ${methodName} is not available.`
      };
    }

    return new Promise<RenderResult>((resolve) => {
      let settled = false;
      const timeoutHandle = window.setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        resolve({
          ok: false,
          code: "timeout",
          message: `Rendering timed out after ${timeoutMs / 1000} seconds.`
        });
      }, timeoutMs);

      try {
        (method as (value: string, callback: (dataUrl: string) => void) => void)(source, (dataUrl) => {
          if (settled) {
            return;
          }

          settled = true;
          window.clearTimeout(timeoutHandle);

          if (typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
            resolve({
              ok: true,
              format,
              dataUrl
            });
            return;
          }

          resolve({
            ok: false,
            code: "render",
            message: "Renderer returned an invalid data URL."
          });
        });
      } catch (error) {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutHandle);
        resolve({
          ok: false,
          code: "render",
          message: error instanceof Error ? error.message : "Unexpected renderer error."
        });
      }
    });
  }

  private async waitForRenderer(timeoutMs: number): Promise<void> {
    const startedAt = Date.now();

    await new Promise<void>((resolve, reject) => {
      const tick = () => {
        const api = this.runtimeFrame.contentWindow?.SEQ?.api;

        if (
          api &&
          typeof api.generateSvgDataUrl === "function" &&
          typeof api.generatePngDataUrl === "function"
        ) {
          resolve();
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error("Timed out while loading SequenceDiagram renderer."));
          return;
        }

        window.setTimeout(tick, 100);
      };

      tick();
    });
  }
}
