/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist, StaleWhileRevalidate } from "serwist";

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
      handler: new StaleWhileRevalidate({
        cacheName: "trpc-cache",
        plugins: [],
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event: PushEvent) => {
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

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});
