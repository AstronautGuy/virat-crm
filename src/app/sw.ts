import { defaultCache } from "@serwist/next/browser";
import { type PrecacheEntry, Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/trpc"),
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "trpc-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new update in Virat CRM.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-96x96.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});
