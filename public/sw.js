'use strict';

const STATIC_CACHE = 'masjed-static-v1';
const DEVOTIONAL_CACHE = 'masjed-devotional-v1';
const RUNTIME_CACHE = 'masjed-runtime-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const PREFETCH_DEFAULTS = [
  '/devotions',
  '/devotional?type=dua&day=0',
  '/devotional?type=ziyarat&day=0',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      await staticCache.addAll(STATIC_ASSETS);

      const devotionalCache = await caches.open(DEVOTIONAL_CACHE);
      await devotionalCache.addAll(PREFETCH_DEFAULTS);
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, DEVOTIONAL_CACHE, RUNTIME_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
      await self.clients.claim();
    })()
  );
});

function isStaticAsset(url) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg')) return true;
  return false;
}

function isDevotionalRoute(url) {
  return url.pathname === '/devotional' || url.pathname === '/devotions';
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cachedResponse);
  return cachedResponse || fetchPromise;
}

async function maybeCacheDevotional(request, response) {
  try {
    if (!response || !response.ok) return;
    const url = new URL(request.url);
    if (!isDevotionalRoute(url)) return;
    const devotionalCache = await caches.open(DEVOTIONAL_CACHE);
    await devotionalCache.put(url.href, response.clone());
  } catch (error) {
    console.error('[SW] Failed to cache devotional route', error);
  }
}

async function handleNavigationRequest(event, request) {
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      await maybeCacheDevotional(request, preload.clone());
      return preload;
    }
  } catch (error) {
    console.warn('[SW] Preload failed', error);
  }

  try {
    const networkResponse = await fetch(request);
    await maybeCacheDevotional(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Navigation fallback due to', error);
    const devotionalCache = await caches.open(DEVOTIONAL_CACHE);
    const cachedDevotional = await devotionalCache.match(request.url);
    if (cachedDevotional) return cachedDevotional;

    const staticCache = await caches.open(STATIC_CACHE);
    const cachedPage = await staticCache.match(request, { ignoreSearch: true });
    if (cachedPage) return cachedPage;

    return staticCache.match(OFFLINE_URL);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event, request));
    return;
  }

  if (url.origin === self.location.origin && isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.origin === self.location.origin && isDevotionalRoute(url)) {
    event.respondWith(staleWhileRevalidate(request, DEVOTIONAL_CACHE));
    return;
  }

  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
});

async function broadcastMessage(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of clients) {
    client.postMessage(message);
  }
}

async function cacheDevotionalRoutes(routes) {
  if (!Array.isArray(routes) || !routes.length) return;
  const cache = await caches.open(DEVOTIONAL_CACHE);
  let completed = 0;
  const total = routes.length;
  for (const route of routes) {
    try {
      const request = new Request(route, { credentials: 'same-origin', mode: 'same-origin' });
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(new URL(route, self.location.origin).href, response.clone());
      }
      completed += 1;
      await broadcastMessage({ type: 'DEVOTIONAL_CACHE_PROGRESS', payload: { completed, total } });
    } catch (error) {
      console.error('[SW] Failed caching route', route, error);
      await broadcastMessage({ type: 'DEVOTIONAL_CACHE_ERROR', payload: { route } });
    }
  }
  await broadcastMessage({ type: 'DEVOTIONAL_CACHE_DONE', payload: { total } });
}

self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data) return;

  if (data.type === 'CACHE_DEVOTIONAL_ROUTES') {
    event.waitUntil(cacheDevotionalRoutes(data.routes));
    return;
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
