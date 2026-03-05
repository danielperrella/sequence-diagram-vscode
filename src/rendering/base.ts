import { RenderFailure, RendererConfig } from "../protocol";
import { appLogger } from "../logging/logger";
import { SequenceDiagramRenderer } from "./SequenceDiagramRenderer";

export abstract class BaseWebRenderer implements SequenceDiagramRenderer {
  public readonly config: RendererConfig;
  private readonly logger = appLogger.child("Renderer");

  protected constructor(config: RendererConfig) {
    this.config = config;
  }

  public validate(): RenderFailure | undefined {
    try {
      const url = new URL(this.config.baseUrl);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return {
          ok: false,
          code: "config",
          message: "The renderer URL must use http or https."
        };
      }
    } catch {
      return {
        ok: false,
        code: "config",
        message: "The configured renderer URL is not valid."
      };
    }

    return undefined;
  }

  public async loadRuntimeHtml(): Promise<string> {
    this.logger.info(`Loading renderer runtime from ${this.config.baseUrl}.`);
    const response = await fetch(this.config.baseUrl, {
      headers: {
        "user-agent": "VSCode-SequenceDiagram-Extension"
      }
    });

    if (!response.ok) {
      this.logger.error(`Renderer runtime request failed with HTTP ${response.status}.`);
      throw new Error(`Renderer returned HTTP ${response.status}.`);
    }

    this.logger.info("Renderer runtime loaded successfully.");
    return sanitizeRuntimeHtml(await response.text());
  }
}

function sanitizeRuntimeHtml(html: string): string {
  return html.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ""
  );
}
