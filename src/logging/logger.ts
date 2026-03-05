import * as path from "node:path";
import * as vscode from "vscode";

type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEvent {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  correlationId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface LogSink {
  push(event: LogEvent): void;
}

class SequenceDiagramLogger {
  private outputChannel: vscode.OutputChannel | undefined;
  private sinks: LogSink[] = [];

  public initialize(context: vscode.ExtensionContext): void {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel("SequenceDiagram");
      context.subscriptions.push(this.outputChannel);
    }
  }

  public child(scope: string): ScopedLogger {
    return new ScopedLogger(this, scope);
  }

  public addSink(sink: LogSink): vscode.Disposable {
    this.sinks.push(sink);

    return new vscode.Disposable(() => {
      this.sinks = this.sinks.filter((candidate) => candidate !== sink);
    });
  }

  public debug(
    scope: string,
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.write("debug", scope, message, correlationId, metadata);
  }

  public info(
    scope: string,
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.write("info", scope, message, correlationId, metadata);
  }

  public warn(
    scope: string,
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.write("warn", scope, message, correlationId, metadata);
  }

  public error(
    scope: string,
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.write("error", scope, message, correlationId, metadata);
  }

  private write(
    level: LogLevel,
    scope: string,
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    const event: LogEvent = {
      timestamp: timestamp(),
      level,
      scope,
      message,
      correlationId,
      metadata
    };
    const line = formatLogEvent(event);

    if (this.outputChannel) {
      this.outputChannel.appendLine(line);
    }

    for (const sink of this.sinks) {
      sink.push(event);
    }

    switch (level) {
      case "error":
        console.error(line);
        break;
      case "warn":
        console.warn(line);
        break;
      default:
        console.info(line);
        break;
    }
  }
}

export class ScopedLogger {
  public constructor(
    private readonly logger: SequenceDiagramLogger,
    private readonly scope: string
  ) {}

  public child(scopeSuffix: string): ScopedLogger {
    return new ScopedLogger(this.logger, `${this.scope}:${scopeSuffix}`);
  }

  public debug(
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.logger.debug(this.scope, message, correlationId, metadata);
  }

  public info(
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.logger.info(this.scope, message, correlationId, metadata);
  }

  public warn(
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.logger.warn(this.scope, message, correlationId, metadata);
  }

  public error(
    message: string,
    correlationId?: string,
    metadata?: Record<string, string | number | boolean>
  ): void {
    this.logger.error(this.scope, message, correlationId, metadata);
  }

  public forDocument(uri: vscode.Uri): ScopedLogger {
    return this.child(path.basename(uri.fsPath || uri.path || uri.toString()));
  }
}

export const appLogger = new SequenceDiagramLogger();
export const sequenceDiagramLogger = appLogger;

export function formatLogEvent(event: LogEvent): string {
  const correlationSegment = event.correlationId ? ` [${event.correlationId}]` : "";
  return `${event.timestamp} [SequenceDiagram][${event.level.toUpperCase()}][${event.scope}]${correlationSegment} ${event.message}`;
}

function timestamp(): string {
  return new Date().toISOString();
}
