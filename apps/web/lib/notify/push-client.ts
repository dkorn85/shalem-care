"use client";

// Client-Helper · Subscription beim Browser-Push-Service abonnieren und
// an /api/push/subscribe schicken. Wird nach erfolgreichem
// Notification-Permission-Grant aufgerufen.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function subscribePush(input: {
  identityId?: string;
  rolle?: string;
  stationId?: string;
  einrichtungId?: string;
} = {}): Promise<{ ok: boolean; reason?: string }> {
  const identityId = input.identityId ?? "anonym";
  if (typeof window === "undefined") return { ok: false, reason: "kein-browser" };
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "browser-unsupported" };
  }
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { ok: false, reason: "vapid-key-fehlt" };
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const keyBytes = urlBase64ToUint8Array(vapidKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
      });
    }
    const r = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityId,
        rolle: input.rolle,
        stationId: input.stationId,
        einrichtungId: input.einrichtungId,
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
          auth:   arrayBufferToBase64(sub.getKey("auth")),
        },
      }),
    });
    if (!r.ok) return { ok: false, reason: `server-${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
