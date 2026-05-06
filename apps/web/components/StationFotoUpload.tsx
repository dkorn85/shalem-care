"use client";

// StationFotoUpload · Wundfoto / Akte-Seite / Tagesfoto.
// Client-Side Resize auf 1024px, dann data-URL → Server-Action.
// Phase-2: S3-Pre-Signed-Upload + WebRTC-Live-Video-Capture.

import { useRef, useState, useTransition } from "react";
import { ladeFotoHoch, postNachricht } from "@/lib/station-cockpit/actions";
import type { CockpitFile } from "@/lib/station-cockpit/store";
import type { Berufsfeld } from "@/lib/team-um-klient/store";

const MAX_KANTE = 1024;

async function bildAlsDataUrl(datei: File): Promise<{ dataUrl: string; sizeKb: number }> {
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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { dataUrl, sizeKb: Math.round(dataUrl.length * 0.75 / 1024) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const FOTO_TYPEN: { code: CockpitFile["typ"]; label: string }[] = [
  { code: "wundfoto",  label: "Wunde" },
  { code: "akte_seite",label: "Akte-Seite" },
  { code: "befund",    label: "Befund" },
  { code: "verordnung",label: "Verordnung" },
  { code: "bild",      label: "Tages-Foto" },
];

export function StationFotoUpload({
  klientId, klientName, viewerPersonId, viewerName, viewerBeruf,
}: {
  klientId: string;
  klientName: string;
  viewerPersonId: string;
  viewerName: string;
  viewerBeruf: Berufsfeld;
}) {
  const [titel, setTitel] = useState("");
  const [typ, setTyp] = useState<CockpitFile["typ"]>("wundfoto");
  const [vorschau, setVorschau] = useState<string | null>(null);
  const [datei, setDatei] = useState<{ dataUrl: string; sizeKb: number } | null>(null);
  const [pending, start] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const verarbeite = async (file?: File) => {
    setFehler(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFehler("Nur Bilddateien."); return; }
    if (file.size > 12 * 1024 * 1024) { setFehler("> 12 MB. Bitte kleineres Bild."); return; }
    try {
      const { dataUrl, sizeKb } = await bildAlsDataUrl(file);
      setDatei({ dataUrl, sizeKb });
      setVorschau(dataUrl);
      if (!titel) setTitel(`${typ === "wundfoto" ? "Wundfoto" : "Foto"} ${new Date().toLocaleDateString("de-DE")}`);
    } catch {
      setFehler("Bild konnte nicht verarbeitet werden.");
    }
  };

  const senden = () => {
    if (!datei) return;
    setFehler(null);
    setFeedback(null);
    start(async () => {
      const r = await ladeFotoHoch({
        klientId, vonPersonId: viewerPersonId, titel, typ,
        dataUrl: datei.dataUrl, groesseKb: datei.sizeKb,
      });
      if (!r.ok) { setFehler(r.error); return; }
      // Auch im Chat-Feed posten
      await postNachricht({
        klientId, vonPersonId: viewerPersonId, vonName: viewerName, vonBeruf: viewerBeruf,
        text: `${typ === "wundfoto" ? "Wundfoto" : typ === "akte_seite" ? "Akte-Seite" : "Foto"} hochgeladen: ${titel}`,
        anhang: { typ: "foto", url: datei.dataUrl, titel },
      });
      setVorschau(null);
      setDatei(null);
      setTitel("");
      setFeedback(`✓ ${titel} ist in der Akte und im Chat sichtbar.`);
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <section className="surface rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Foto / Datei zur Akte hinzufügen</p>
      <p className="text-[12px] text-mute mb-3">{klientName} · sichtbar für alle anwesenden Berufe + Chat-Eintrag automatisch</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {FOTO_TYPEN.map((t) => (
          <button
            key={t.code}
            onClick={() => setTyp(t.code)}
            className="text-[11px] px-2.5 py-1 rounded-md transition-colors"
            style={{
              background: typ === t.code ? "rgb(var(--accent) / 0.18)" : "rgb(var(--bg-mute))",
              color: typ === t.code ? "rgb(var(--accent))" : "rgb(var(--fg-mute))",
            }}
          >{t.label}</button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-start">
        <label
          className="relative w-32 h-32 rounded-xl surface-mute grid place-items-center overflow-hidden cursor-pointer shrink-0"
          aria-label="Foto wählen oder hier ablegen"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => verarbeite(e.target.files?.[0])}
          />
          {vorschau ? (
            <img src={vorschau} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] text-soft text-center px-2">+ Bild wählen<br/><span className="text-[10px]">(oder Foto aufnehmen)</span></span>
          )}
        </label>

        <div className="flex-1 min-w-[200px] space-y-2">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="Titel (z.B. Sakraldekubitus 2026-05-06)"
            className="input text-[13px] w-full"
            disabled={pending}
            aria-label="Foto-Titel"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={senden}
              disabled={pending || !datei}
              className="text-[12px] px-3 py-1.5 rounded-md"
              style={{ background: "rgb(var(--accent))", color: "white", opacity: pending || !datei ? 0.6 : 1 }}
            >
              {pending ? "Sende …" : "Hochladen + Chat-Eintrag"}
            </button>
            {datei && (
              <span className="text-[11px] text-soft self-center">~{datei.sizeKb} KB · 1024 px max</span>
            )}
          </div>
          {fehler && <p className="text-[11px]" style={{ color: "rgb(var(--mon))" }}>{fehler}</p>}
          {feedback && <p className="text-[11px]" style={{ color: "rgb(var(--thu))" }}>{feedback}</p>}
        </div>
      </div>
    </section>
  );
}
