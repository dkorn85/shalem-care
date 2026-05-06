"use client";

// ProfilbildUpload · Drag&Drop oder Datei-Auswahl, lokale Vorschau,
// dann data-URL an Server-Action.
//
// Phase 1: Bild wird als data-URL im in-memory-Profil gespeichert
// (max ~500 KB nach Client-Resize). Phase 2 → S3-Pre-Signed-Upload
// + CDN-Pfad zurück.

import { useRef, useState, useTransition } from "react";
import { ladeProfilbild, entferneProfilbild } from "@/lib/profile/actions";

const FALLBACK_AVATARE = [
  { code: "sage",  url: "/portraits/fallback-01-sage.png",  hue: "Sage" },
  { code: "rose",  url: "/portraits/fallback-02-rose.png",  hue: "Rose" },
  { code: "slate", url: "/portraits/fallback-03-slate.png", hue: "Slate" },
  { code: "brass", url: "/portraits/fallback-04-brass.png", hue: "Brass" },
  { code: "bone",  url: "/portraits/fallback-05-bone.png",  hue: "Bone" },
  { code: "mint",  url: "/portraits/fallback-06-mint.png",  hue: "Mint" },
];

const MAX_KANTE = 512; // px — vor Upload runter-skalieren

async function bildAlsDataUrl(datei: File): Promise<string> {
  const url = URL.createObjectURL(datei);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const ratio = Math.min(1, MAX_KANTE / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("kein 2d-Kontext");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProfilbildUpload({
  personId,
  aktuellesBild,
  fallbackInitialen,
}: {
  personId: string;
  aktuellesBild?: string;
  fallbackInitialen: string;
}) {
  const [vorschau, setVorschau] = useState<string | undefined>(aktuellesBild);
  const [fehler, setFehler] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [zeigeFallbacks, setZeigeFallbacks] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const waehleFallback = (url: string) => {
    setVorschau(url);
    setZeigeFallbacks(false);
    start(async () => {
      const r = await ladeProfilbild(personId, url);
      if (!r.ok) setFehler(r.error);
    });
  };

  const verarbeite = async (datei?: File) => {
    setFehler(null);
    if (!datei) return;
    if (!datei.type.startsWith("image/")) {
      setFehler("Nur Bilddateien (PNG, JPG, WebP).");
      return;
    }
    if (datei.size > 8 * 1024 * 1024) {
      setFehler("Datei ist > 8 MB. Bitte kleineres Bild wählen.");
      return;
    }
    try {
      const dataUrl = await bildAlsDataUrl(datei);
      setVorschau(dataUrl);
      start(async () => {
        const r = await ladeProfilbild(personId, dataUrl);
        if (!r.ok) setFehler(r.error);
      });
    } catch (e) {
      setFehler("Bild konnte nicht verarbeitet werden.");
    }
  };

  const entfernen = () => {
    setVorschau(undefined);
    start(async () => {
      await entferneProfilbild(personId);
    });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div
        className={`relative w-24 h-24 rounded-full overflow-hidden grid place-items-center transition-shadow ${drag ? "ring-2" : ""}`}
        style={{
          background: vorschau ? "transparent" : "linear-gradient(135deg, rgb(var(--mon)), rgb(var(--thu)))",
          boxShadow: drag ? "0 0 0 3px rgb(var(--accent))" : undefined,
        }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          verarbeite(e.dataTransfer.files?.[0]);
        }}
      >
        {vorschau ? (
          <img src={vorschau} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-semibold text-[28px]">{fallbackInitialen}</span>
        )}
        {pending && (
          <div className="absolute inset-0 grid place-items-center bg-black/30 text-white text-[10px] uppercase tracking-wider">
            speichern
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium mb-1">Profilbild</p>
        <p className="text-[11px] text-mute leading-snug mb-2">
          Auch ein Foto vom Garten oder Lieblingsbuch zählt — die Klient:innen sollen den Menschen sehen, nicht nur das Schild „Pflegekraft".
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => verarbeite(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "rgb(var(--accent))", color: "white" }}
          >
            {vorschau ? "Bild ändern" : "Bild wählen"}
          </button>
          <button
            type="button"
            onClick={() => setZeigeFallbacks((s) => !s)}
            disabled={pending}
            className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
            style={{ background: "transparent", color: "rgb(var(--accent))", boxShadow: "inset 0 0 0 1px rgb(var(--accent) / 0.3)" }}
          >
            {zeigeFallbacks ? "Schließen" : "Standard-Avatar wählen"}
          </button>
          {vorschau && (
            <button
              type="button"
              onClick={entfernen}
              disabled={pending}
              className="text-[12px] px-3 py-1.5 rounded-md transition-colors"
              style={{ background: "transparent", color: "rgb(var(--fg-mute))", boxShadow: "inset 0 0 0 1px rgb(var(--fg-mute) / 0.3)" }}
            >
              Entfernen
            </button>
          )}
        </div>
        {fehler && <p className="text-[11px] mt-1.5" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}
        {zeigeFallbacks && (
          <div className="mt-3 surface-mute rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-wider font-medium mb-2" style={{ color: "rgb(var(--fg-mute))" }}>Standard-Avatare · ohne eigenes Foto</p>
            <ul className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FALLBACK_AVATARE.map((a) => (
                <li key={a.code}>
                  <button
                    type="button"
                    onClick={() => waehleFallback(a.url)}
                    disabled={pending}
                    aria-label={`Standard-Avatar ${a.hue} wählen`}
                    className="w-full aspect-square rounded-full overflow-hidden transition-transform hover:scale-105"
                    style={{ boxShadow: vorschau === a.url ? "0 0 0 2px rgb(var(--accent))" : "0 0 0 1px rgb(var(--border))" }}
                  >
                    <img src={a.url} alt="" className="w-full h-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
