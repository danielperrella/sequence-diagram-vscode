import { RendererConfig } from "../protocol";
import { BaseWebRenderer } from "./base";

export class PublicWebRenderer extends BaseWebRenderer {
  public constructor(config: RendererConfig) {
    super({
      ...config,
      baseUrl: "https://sequencediagram.org"
    });
  }
}
