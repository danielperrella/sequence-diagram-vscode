export interface TimerApi {
  setTimeout(handler: () => void, delay: number): number;
  clearTimeout(handle: number): void;
}

export class PreviewScheduler {
  private currentHandle: number | undefined;
  private currentRequestId = 0;

  public constructor(
    private readonly timers: TimerApi,
    private readonly onFire: (requestId: number) => void
  ) {}

  public schedule(delay: number): number {
    if (this.currentHandle !== undefined) {
      this.timers.clearTimeout(this.currentHandle);
    }

    const requestId = ++this.currentRequestId;
    this.currentHandle = this.timers.setTimeout(() => {
      this.currentHandle = undefined;
      this.onFire(requestId);
    }, delay);

    return requestId;
  }
}
