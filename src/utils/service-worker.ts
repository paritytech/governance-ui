import { isPeriodicBackgroundSyncGranted } from './permissions';

export const REFERENDA_UPDATES_TAG = 'fetch-referenda-updates';

export async function registerServiceWorker() {
  const reg = await navigator.serviceWorker.register(
    new URL('../service-worker.ts', import.meta.url),
    {
      type: 'module',
    }
  );

  // Wait for the service worker to be ready
  await navigator.serviceWorker.ready;

  try {
    if (await isPeriodicBackgroundSyncGranted()) {
      await reg.periodicSync.register(REFERENDA_UPDATES_TAG, {
        minInterval: 24 * 60 * 60 * 1000, // 1 day
      });
    } else {
      console.warn('Permission to register a periodicSync denied');
    }
  } catch {
    console.warn('Periodic Sync could not be registered!');
  }

  reg.addEventListener('updatefound', () => {
    // A wild service worker has appeared in reg.installing!
    const newWorker = reg.installing;

    if (newWorker) {
      newWorker.state;
      // "installing" - the install event has fired, but not yet complete
      // "installed"  - install complete
      // "activating" - the activate event has fired, but not yet complete
      // "activated"  - fully active
      // "redundant"  - discarded. Either failed install, or it's been
      //                replaced by a newer version

      newWorker.addEventListener('statechange', () => {
        // newWorker.state has changed
      });
    }
  });

  navigator.serviceWorker.addEventListener('controllerchange', (e) => {
    // This fires when the service worker controlling this page
    // changes, eg a new worker has skipped waiting and become
    // the new active worker.
    console.debug('ServiceWorker has been activated', e);
  });

  navigator.serviceWorker.addEventListener('message', () => {
    console.log('New message');
  });

  navigator.serviceWorker.addEventListener('messageerror', () => {
    console.log('New message error');
  });

  window.addEventListener('beforeinstallprompt', () => {
    // This fires when the service worker controlling this page
    // changes, eg a new worker has skipped waiting and become
    // the new active worker.
    console.log('About to be installed');
  });

  window.addEventListener('appinstalled', () => {
    // This fires when the app has been installed
    console.log('App installed');
  });
}
