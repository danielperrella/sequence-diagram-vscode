import * as vscode from "vscode";
import { RenderFormat, RendererConfig } from "./protocol";

const DEFAULT_PUBLIC_URL = "https://sequencediagram.org";

export function getRendererConfig(): RendererConfig {
  const configuration = vscode.workspace.getConfiguration("sequencediagram");
  const debounceMs = configuration.get<number>("preview.debounceMs", 300);
  const previewEnabled = configuration.get<boolean>("preview.enabled", true);
  const defaultExportFormat = configuration.get<RenderFormat>("export.defaultFormat", "svg");

  return {
    baseUrl: DEFAULT_PUBLIC_URL,
    debounceMs: Math.max(0, debounceMs),
    previewEnabled,
    defaultExportFormat
  };
}

export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return DEFAULT_PUBLIC_URL;
  }

  return trimmed.replace(/\/+$/, "");
}
