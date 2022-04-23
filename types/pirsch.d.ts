declare interface Window {
  pirsch(
    eventName: string,
    options: { duration?: number; meta?: { [key: string]: any } },
  ): void;
}
