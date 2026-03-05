import { describe, expect, it } from "vitest";
import { formatLogEvent } from "../../src/logging/logger";

describe("logger", () => {
  it("formats structured log events consistently", () => {
    const line = formatLogEvent({
      timestamp: "2026-03-04T10:00:00.000Z",
      level: "info",
      scope: "Test",
      message: "Hello world"
    });

    expect(line).toContain("[SequenceDiagram][INFO][Test] Hello world");
  });
});
