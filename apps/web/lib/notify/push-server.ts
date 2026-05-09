// Server-Push-Helper · sendet über web-push an gespeicherte Abos.
// Wird nur server-side genutzt (in Server-Actions / API-Routes).

import webpush from "web-push";
import { listAbos, loescheAbo } from "./push-store";

let _initialized = false;
function init() {
  if (_initialized) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT ?? "mailto:hallo@shalem.de";
  if (!pub || !priv) {
    console.warn("[push] VAPID-Keys fehlen — Server-Push deaktiviert.");
    return;
  }
  webpush.setVapidDetails(sub, pub, priv);
  _initialized = true;
}

export async function sendePush(input: {
  identityId?: string;          // wenn null → Broadcast an alle
  titel: string;
  beschreibung?: string;
  href?: string;
  art?: "info" | "erfolg" | "warnung" | "fehler" | "lana";
}): Promise<{ versandt: number; verworfen: number }> {
  init();
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return { versandt: 0, verworfen: 0 };

  const abos = listAbos(input.identityId ? { identityId: input.identityId } : undefined);
  let versandt = 0, verworfen = 0;
  const payload = JSON.stringify({
    titel: input.titel,
    beschreibung: input.beschreibung ?? "",
    href: input.href ?? "/",
    art: input.art ?? "info",
  });

  await Promise.all(
    abos.map(async (a) => {
      try {
        await webpush.sendNotification(
          { endpoint: a.endpoint, keys: a.keys },
          payload,
        );
        versandt++;
      } catch (err: unknown) {
        // 404/410 = Abo abgelaufen oder Empfänger hat unsubscribed
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          loescheAbo(a.endpoint);
          verworfen++;
        }
      }
    }),
  );

  return { versandt, verworfen };
}
