export interface RendererRuntimeSource {
  loadRuntimeHtml(): Promise<string>;
}
