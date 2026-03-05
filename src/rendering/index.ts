import { RendererConfig } from "../protocol";
import { PublicWebRenderer } from "./PublicWebRenderer";
import { SequenceDiagramRenderer } from "./SequenceDiagramRenderer";

export function createRenderer(config: RendererConfig): SequenceDiagramRenderer {
  return new PublicWebRenderer(config);
}
