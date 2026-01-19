// Service Worker for PWA
// Simple cache strategy: cache shell assets, offline fallback

// Remove explicit ServiceWorkerGlobalScope declaration, which causes redeclare/typing error.
// Instead, use self as any to avoid TypeScript typing issues or import standard lib dom types for service workers.
// The following suppresses TS errors for "self" and service worker events. 
// @ts-expect-error
const swSelf: ServiceWorkerGlobalScope = self as any;

const CACHE_NAME = "viettea-sales-v1";
const OFFLINE_URL = "/offline.html";

const assetsToCache = [
  "/",
  "/agent-chat",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
];

// Type assertions ensure correct event typing for TS (TS infers base Event, not ExtendableEvent/FetchEvent).
swSelf.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(assetsToCache);
      })
      .catch((error) => {
        // Using console instead of globalThis.console to ensure compatibility
        console.error("Cache installation failed:", error);
      }),
  );
});

swSelf.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

swSelf.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If it's a navigation request, show offline page
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL).then((offlinePage) => {
              return offlinePage || new Response("Offline", { status: 503, statusText: "Service Unavailable" });
            });
          }
          // Return a fallback error response for non-navigation requests
          return new Response("Network error", { status: 503, statusText: "Service Unavailable" });
        });
      }),
  );
});

// Type definitions for ExtendableEvent and FetchEvent for TypeScript (necessary for type checking)
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}
