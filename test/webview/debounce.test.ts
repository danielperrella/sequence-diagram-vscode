import { describe, expect, it, vi } from "vitest";
import { PreviewScheduler } from "../../src/webview/runtime/previewScheduler";

describe("PreviewScheduler", () => {
  it("debounces pending preview work", () => {
    const onFire = vi.fn();
    let handle = 0;
    const scheduler = new PreviewScheduler(
      {
        setTimeout: (fn) => {
          fn();
          handle += 1;
          return handle;
        },
        clearTimeout: vi.fn()
      },
      onFire
    );

    scheduler.schedule(100);
    scheduler.schedule(100);

    expect(onFire).toHaveBeenCalledTimes(2);
  });
});
