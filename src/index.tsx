import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import App from './app';
const theme = createTheme({
  type: 'light',
  theme: {
    fonts: {
      sans: 'Unbounded',
    },
  },
});

const container = document.getElementById('root');
if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(
    <React.StrictMode>
      <NextUIProvider theme={theme}>
        <main style={{ display: 'flex', height: '100vh' }}>
          <App />
        </main>
      </NextUIProvider>
    </React.StrictMode>
  );
}

navigator.permissions
  .query({ name: 'periodic-background-sync' })
  .then((status) => {
    console.log(status);
  });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(new URL('service-worker.js', import.meta.url), { type: 'module' })
    .then((_reg) => navigator.serviceWorker.ready)
    .then(async (reg) => {
      //await Notification.requestPermission();

      /*   if (reg.periodicSync) {
      await reg.periodicSync.register('sync-chain', {
        minInterval: 10 * 1000,
      });
    }
*/
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
}

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
