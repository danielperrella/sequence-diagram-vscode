import { LogEvent, LogSink } from "../../src/logging/logger";

export class InMemoryLogCollector implements LogSink {
  private readonly events: LogEvent[] = [];

  public push(event: LogEvent): void {
    this.events.push(event);
  }

  public all(): LogEvent[] {
    return [...this.events];
  }
}
