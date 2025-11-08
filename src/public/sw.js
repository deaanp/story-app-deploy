import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { openDB } from "idb";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, 
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    url.origin.includes("story-api.dicoding.dev") &&
    request.method === "GET" &&
    !url.href.includes("/notifications"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60, 
      }),
    ],
  })
);

registerRoute(
  ({ url }) =>
    url.origin.includes("story-api.dicoding.dev") &&
    url.pathname.startsWith("/images/stories"),
  new StaleWhileRevalidate({
    cacheName: "stories-data",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, 
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin.includes("tile.openstreetmap.org"),
  new StaleWhileRevalidate({
    cacheName: "osm-tiles",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, 
      }),
    ],
  })
);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const mapTileDomains = [
    "a.tile.openstreetmap.org",
    "b.tile.openstreetmap.org",
    "c.tile.openstreetmap.org",
  ];
  if (mapTileDomains.includes(url.hostname)) return;

  if (request.destination === "image") {
    event.respondWith(fetch(request).catch(() => new Response("Image unavailable")));
    return;
  }

  if (
    request.method !== "GET" &&
    !request.url.includes("/login") &&
    !request.url.includes("/register")
  ) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (err) {
          console.warn("[SW] Offline detected. Request body not readable in SW — handled in main thread instead.");
          return new Response(
            JSON.stringify({
              error: "Offline mode: request will be saved by the app.",
            }),
            {
              status: 202,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      })()
    );
    return;
  }
});

self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(clients.claim());
});


self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Story App",
      options: {
        body: event.data.text() || "Anda menerima notifikasi baru!",
        url: "/#/",
      },
    };
  }

  const title = data.title || "Story App";
  const body = data.options?.body || "New story update!";
  const targetUrl = data.options?.url || "/#/";

  const options = {
    body,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    data: { url: targetUrl },
    actions: [{ action: "open", title: "View Story" }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/#/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            client.focus();
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
  );
});

self.addEventListener("sync", async (event) => {
  if (event.tag === "sync-pending-stories") {
    event.waitUntil(syncPendingStories());
  }
});

async function syncPendingStories() {
  const db = await openDB("story-db", 2);
  const tx = db.transaction("pending-stories", "readwrite");
  const store = tx.objectStore("pending-stories");
  const allPending = await store.getAll();

  for (const item of allPending) {
    try {
      const base64ToBlob = (base64) => {
        const parts = base64.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const binary = atob(parts[1]);
        let length = binary.length;
        const buffer = new Uint8Array(length);
        while (length--) buffer[length] = binary.charCodeAt(length);
        return new Blob([buffer], { type: mime });
      };

      const blob = base64ToBlob(item.imageBase64);
      formData.append("photo", blob, "story.jpg");

      if (!item.token) {
        console.warn("[SW] Missing token for pending story, skipping...");
        continue;
      }

      const res = await fetch("https://story-api.dicoding.dev/v1/stories", {
        method: "POST",
        headers: { Authorization: `Bearer ${item.token}` },
        body: formData,
      });

      if (res.ok) {
        await store.delete(item.tempId);
        console.log("[SW] Synced story successfully", item.tempId);
      } else {
        console.error("[SW] Failed to sync story:", res.status);
      }
    } catch (err) {
      console.error("[SW] Failed to sync story:", err);
    }
  }

  await tx.done;
  console.log("[SW] Sync pending stories done");
  console.log("[SW] Background Sync Registered and Completed");
}
