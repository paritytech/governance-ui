export async function registerServiceWorker() {
  navigator.serviceWorker
    .register(new URL('service-worker.js', import.meta.url), {
      type: 'module',
    })
    .then(() => navigator.serviceWorker.ready)
    .then(async (reg) => {
      //await Notification.requestPermission();
      console.log('registered');
      try {
        await reg.periodicSync.register('get-latest-news', {
          //minInterval: 24 * 60 * 60 * 1000, // 1 day
          minInterval: 10 * 1000, // 10 seconds
        });
      } catch {
        console.log('Periodic Sync could not be registered!');
      }

      //    reg.showNotification("Markdowns synced to server");
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
    })
    .catch((err) => {
      console.log(`ServiceWorker registration failed: ${err}`);
    });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // This fires when the service worker controlling this page
    // changes, eg a new worker has skipped waiting and become
    // the new active worker.
    console.log('New ServiceWorker has been activated');
  });

  navigator.serviceWorker.addEventListener('beforeinstallprompt', () => {
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
