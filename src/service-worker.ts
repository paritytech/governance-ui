import { manifest, version } from '@parcel/service-worker';

async function install() {
  // Cache all assets
  const cache = await caches.open(version);
  const keys = await cache.keys();
  console.debug('Clearing existing keys', keys);
  // Clear existing cached elements
  await Promise.all(keys.map((key) => cache.delete(key)));
  const deduplicatedManifest = Array.from(new Set(manifest));
  console.debug('Caching keys', deduplicatedManifest);
  await cache.addAll(deduplicatedManifest);
}

// First entry point, only called once per service worker version
// See https://web.dev/service-worker-lifecycle/
addEventListener('install', (e) => {
  console.log('Installing SW');
  e.waitUntil(
    install().catch((err) => {
      console.error('Error while installing SW', err);
    })
  );
});

async function activate() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)));
}

addEventListener('activate', (e) => {
  console.log('Activating SW');
  e.waitUntil(
    activate().catch((err) => {
      console.error('Error while activating SW', err);
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (url.origin == location.origin && manifest.includes(url.pathname)) {
    // Only consider cached assets
    event.respondWith(
      caches.open(version).then((cache) => {
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
