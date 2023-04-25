export type AnalyticEvent =
  | 'Click'
  | 'Select'
  | 'Scroll'
  | 'Delegate'
  | 'Undelegate';

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
    window.sa_event && window.sa_event(event, metadata);
  };
}
