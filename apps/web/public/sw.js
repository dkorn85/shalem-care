// Service Worker · Phase 1: nur Installation + Aktivierung, damit die
// PWA installierbar wird und Notifications zeigen kann. Kein Caching
// (Next.js liefert eigene HTTP-Caches), keine Push-Subscription Phase B.

const VERSION = "shalem-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push-Event: zeigt Notification an (für Phase 2 mit echtem Backend).
// Format: { titel, beschreibung, href, art }
self.addEventListener("push", (event) => {
  let data = { titel: "Shalem Care", beschreibung: "", href: "/", art: "info" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.titel, {
      body: data.beschreibung,
      icon: "/icon-192.png",
      badge: "/icon-badge.png",
      data: { href: data.href },
      tag: "shalem-" + Date.now(),
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((all) => {
        for (const c of all) {
          if (c.url.includes(href) && "focus" in c) return c.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(href);
      })
  );
});
