export interface PreviewZoomConfig {
  min: number;
  max: number;
  step: number;
}

export interface PanTranslation {
  x: number;
  y: number;
}

export const defaultPreviewZoomConfig: PreviewZoomConfig = {
  min: 0.25,
  max: 3,
  step: 0.1
};

export function clampZoom(value: number, config: PreviewZoomConfig = defaultPreviewZoomConfig): number {
  return Math.min(config.max, Math.max(config.min, value));
}

export function withZoomDelta(
  currentZoom: number,
  delta: number,
  config: PreviewZoomConfig = defaultPreviewZoomConfig
): number {
  const next = currentZoom + delta;
  return Number(clampZoom(next, config).toFixed(2));
}

export function wheelDirection(deltaY: number): -1 | 0 | 1 {
  if (deltaY === 0) {
    return 0;
  }

  return deltaY > 0 ? -1 : 1;
}

export function canPanAtZoom(zoom: number): boolean {
  return zoom > 1;
}

export function canPan(zoom: number, isSpacePressed: boolean): boolean {
  return isSpacePressed || canPanAtZoom(zoom);
}

export function nextPanTranslation(start: PanTranslation, deltaX: number, deltaY: number): PanTranslation {
  return {
    x: start.x + deltaX,
    y: start.y + deltaY
  };
}

export function normalizedPanTranslationForZoom(
  zoom: number,
  isSpacePressed: boolean,
  current: PanTranslation
): PanTranslation {
  if (zoom <= 1 && !isSpacePressed) {
    return { x: 0, y: 0 };
  }

  return current;
}
