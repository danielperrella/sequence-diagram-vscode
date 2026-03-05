import { SequenceDiagramWebviewRuntime } from "./runtime";

const runtime = new SequenceDiagramWebviewRuntime({
  previewImage: mustGet<HTMLImageElement>("previewImage"),
  previewShell: mustGet<HTMLDivElement>("previewShell"),
  zoomToolbar: mustGet<HTMLDivElement>("zoomToolbar"),
  zoomIn: mustGet<HTMLButtonElement>("zoomIn"),
  zoomOut: mustGet<HTMLButtonElement>("zoomOut"),
  zoomReset: mustGet<HTMLButtonElement>("zoomReset"),
  placeholder: mustGet<HTMLDivElement>("placeholder"),
  previewBadge: mustGet<HTMLSpanElement>("previewBadge"),
  runtimeFrame: mustGet<HTMLIFrameElement>("runtimeFrame")
});

runtime.initialize();

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing DOM element #${id}.`);
  }

  return element as T;
}
