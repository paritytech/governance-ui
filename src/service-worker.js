import { manifest, version } from '@parcel/service-worker';

const ASSETS_CACHE = `assets-version-${version}`;
const ALL_CACHES = [ASSETS_CACHE];

async function install() {
  // Cache all assets
  const cache = await caches.open(ASSETS_CACHE);
  await cache.addAll(manifest);
}

// First entry point, only called once
// See https://web.dev/service-worker-lifecycle/
addEventListener('install', (e) => {
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
    // Only consider
    event.respondWith(
      caches.open(ASSETS_CACHE).then(function (cache) {
        return cache.match(event.request).then(async function (response) {
          if (response) {
            return response;
          } else {
            const responseFromNetwork = await fetch(event.request);
            cache.put(event.request, responseFromNetwork.clone());
            return responseFromNetwork;
          }
        });
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('periodicsync', event);
  if (event.tag === 'get-latest-news') {
    //event.waitUntil(fetchAndCacheLatestNews());
  }
});
