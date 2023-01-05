import { manifest, version } from '@parcel/service-worker';
import { getAllReferenda } from './chain/referenda';
import { measured } from './utils/performance';
import { endpointFor, Network, newApi } from './utils/polkadot-api';
import { timeout } from './utils/promise';
import { getAllReferenda } from './chain/referenda';
import { endpointFor, Network, newApi } from './utils/polkadot-api';
import { REFERENDA_UPDATES_TAG } from './utils/service-worker';

const ASSETS_CACHE = `assets-version-${version}`;
const ALL_CACHES = [ASSETS_CACHE];

async function install() {
  // Cache all assets
  const cache = await caches.open(ASSETS_CACHE);
  await cache.addAll(manifest);
}

// First entry point, only called once per service worker version
// See https://web.dev/service-worker-lifecycle/
addEventListener('install', (e) => {
  // Use latest version right away, even if some clients are using an older version
  self.skipWaiting();

  e.waitUntil(install());
});

async function activate() {
  // Delete older caches
  const keys = await caches.keys();
  await Promise.all(
    keys.map((key) => !ALL_CACHES.includes(key) && caches.delete(key))
  );
}

self.addEventListener('activate', (e) => {
  e.waitUntil(activate());
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin == location.origin && manifest.includes(url.pathname)) {
    // Only consider cached assets
    event.respondWith(
      caches.open(ASSETS_CACHE).then((cache) => {
        return cache.match(event.request).then(async (response) => {
          if (response) {
            return response;
          } else {
            // This should never happen
            const responseFromNetwork = await fetch(event.request);
            cache.put(event.request, responseFromNetwork.clone());
            return responseFromNetwork;
          }
        });
      })
    );
  }
});

// Fired when user clicks on a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const scope = self.registration.scope;
  const action = event.action; // Identify if the user clicked on the notification itself or on one action

  event.waitUntil(
    clients // eslint-disable-line
      .matchAll({
        type: 'window',
      })
      .then((allClients) => {
        const client = allClients.find((client) => client.url == scope);
        if (client) {
          // Focus on a matching hidden client
          return client.focus();
        } else {
          // Otherwise open a new window
          return clients.openWindow(scope); // eslint-disable-line
        }
      })
  );
});

self.addEventListener('periodicsync', async async (event) => {
  if (event.tag === REFERENDA_UPDATES_TAG) {
    // TODO
    // Retrieve referenda updates, based on those trigger a notification
    /*const api = await newApi(endpointFor(Network.Kusama));
    const allReferenda = await measured('allReferenda', () =>
      timeout(getAllReferenda(api), 1000)
    );
    console.log("referenda", allReferenda)*/

    const api = await newApi(endpointFor(Network.Kusama)); // TODO access proper endpoints
    const referenda = await getAllReferenda(api);

    // TODO only retrieved referenda to be voted on and not yet seen
    if (referenda.size > 0) {
      // See https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification

      self.registration.showNotification('Referenda', {
        body: `${referenda.size} new referenda to be voted on`,
        icon: '../assets/icons/icon-192x192.png',
        tag: 'referenda-updates',
        requireInteraction: true,
        data: { referenda },
      });
    }
  }
});
