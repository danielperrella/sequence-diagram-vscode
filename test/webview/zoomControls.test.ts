import { describe, expect, it } from "vitest";
import {
  canPan,
  canPanAtZoom,
  clampZoom,
  defaultPreviewZoomConfig,
  nextPanTranslation,
  normalizedPanTranslationForZoom,
  wheelDirection,
  withZoomDelta
} from "../../src/webview/runtime/zoom";

describe("zoom controls", () => {
  it("clamps zoom between min and max", () => {
    expect(clampZoom(0.1, defaultPreviewZoomConfig)).toBe(0.25);
    expect(clampZoom(4, defaultPreviewZoomConfig)).toBe(3);
  });

  it("applies step changes for zoom in/out", () => {
    expect(withZoomDelta(1, 0.1, defaultPreviewZoomConfig)).toBe(1.1);
    expect(withZoomDelta(1, -0.1, defaultPreviewZoomConfig)).toBe(0.9);
  });

  it("respects min/max when applying deltas", () => {
    expect(withZoomDelta(0.25, -0.1, defaultPreviewZoomConfig)).toBe(0.25);
    expect(withZoomDelta(3, 0.1, defaultPreviewZoomConfig)).toBe(3);
  });

  it("maps wheel directions correctly", () => {
    expect(wheelDirection(-100)).toBe(1);
    expect(wheelDirection(100)).toBe(-1);
    expect(wheelDirection(0)).toBe(0);
  });

  it("allows panning only when zoom is above 100%", () => {
    expect(canPanAtZoom(1)).toBe(false);
    expect(canPanAtZoom(1.01)).toBe(true);
  });

  it("allows panning with spacebar even at 100%", () => {
    expect(canPan(1, false)).toBe(false);
    expect(canPan(1, true)).toBe(true);
    expect(canPan(1.25, false)).toBe(true);
  });

  it("updates pan translation using drag deltas", () => {
    expect(nextPanTranslation({ x: 0, y: 0 }, 10, -5)).toEqual({ x: 10, y: -5 });
  });

  it("resets translation at zoom <= 100% unless space is pressed", () => {
    expect(normalizedPanTranslationForZoom(1, false, { x: 30, y: 40 })).toEqual({ x: 0, y: 0 });
    expect(normalizedPanTranslationForZoom(1, true, { x: 30, y: 40 })).toEqual({ x: 30, y: 40 });
    expect(normalizedPanTranslationForZoom(1.5, false, { x: 30, y: 40 })).toEqual({ x: 30, y: 40 });
  });
});
