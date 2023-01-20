declare module '*.module.css' {
  const styles: Record<string, string>;
  export = styles;
}

declare module 'jsx:*.svg' {
  import { ComponentType, SVGProps } from 'react';
  const SVGComponent: ComponentType<SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}

interface SyncEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

interface ServiceWorkerGlobalScopeEventMap {
  periodicsync: SyncEvent;
}

interface PeriodicSyncManager {
  register(tag: string, options?: {minInterval: number}): Promise<undefined>;
  unregister(tag: string): Promise<void>;
  getTags(): Promise<Array<string>>;
}

interface ServiceWorkerRegistration {
  periodicSync: PeriodicSyncManager
}
