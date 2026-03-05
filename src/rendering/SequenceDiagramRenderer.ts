import { RenderFailure, RendererConfig } from "../protocol";
import { RendererRuntimeSource } from "./RendererRuntimeSource";

export interface SequenceDiagramRenderer extends RendererRuntimeSource {
  readonly config: RendererConfig;
  validate(): RenderFailure | undefined;
}
