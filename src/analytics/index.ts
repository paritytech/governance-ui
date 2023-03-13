export type AnalyticEvent = 'Delegate';

declare global {
  interface Window {
    sa_event: (
      event: AnalyticEvent,
      metadata?: Record<string, string>
    ) => void | undefined;
  }
}

export class SimpleAnalytics {
  static track = (event: AnalyticEvent, metadata?: Record<string, string>) => {
    console.log(event, metadata);
    window.sa_event && window.sa_event(event, metadata);
  };
}
