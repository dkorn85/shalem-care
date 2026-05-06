// StationAkteFiles · gemeinsame Akte des Klienten — alle anwesenden
// Berufe sehen die selbe Liste, können neue hochladen (FotoUpload) und
// Tags hinzufügen.

import Image from "next/image";
import type { CockpitFile } from "@/lib/station-cockpit/store";

const TYP_LABEL: Record<CockpitFile["typ"], string> = {
  akte_seite: "Akte-Seite",
  wundfoto: "Wundfoto",
  befund: "Befund",
  verordnung: "Verordnung",
  bild: "Foto",
  audio_notiz: "Audio-Notiz",
};

const TYP_FARBE: Record<CockpitFile["typ"], string> = {
  akte_seite: "var(--vibe-team)",
  wundfoto: "var(--mon)",
  befund: "var(--vibe-profile)",
  verordnung: "var(--vibe-approval)",
  bild: "var(--sun)",
  audio_notiz: "var(--fri)",
};

export function StationAkteFiles({ files }: { files: CockpitFile[] }) {
  return (
    <section className="surface rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wider text-soft font-medium mb-1">Gemeinsame Akte · {files.length} Datei{files.length === 1 ? "" : "en"}</p>
      <p className="text-[12px] text-mute mb-3">Alle anwesenden Berufe sehen + bearbeiten dieselben Dateien. Phase-2 → CRDT-Live-Bearbeitung.</p>
      {files.length === 0 ? (
        <p className="text-[13px] text-soft italic">Noch keine Datei. Foto- oder Akte-Upload nutzen.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2">
          {files.map((f) => (
            <li key={f.id} className="surface-mute rounded-xl p-3 relative overflow-hidden">
              <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full" style={{ background: `rgb(${TYP_FARBE[f.typ]})` }} />
              <div className="ml-2 flex gap-3">
                {f.dataUrl && (
                  <div className="w-20 h-20 rounded-md overflow-hidden surface shrink-0">
                    {f.dataUrl.startsWith("/") ? (
                      <Image src={f.dataUrl} alt={f.titel} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <img src={f.dataUrl} alt={f.titel} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] font-medium leading-tight">{f.titel}</span>
                    <span className="chip text-[10px]" style={{ background: `rgb(${TYP_FARBE[f.typ]} / 0.15)`, color: `rgb(${TYP_FARBE[f.typ]})` }}>{TYP_LABEL[f.typ]}</span>
                  </div>
                  <p className="text-[11px] text-mute mt-0.5">
                    {new Date(f.hochgeladenAm).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {f.groesseKb && ` · ${f.groesseKb} KB`}
                  </p>
                  {f.tags && f.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {f.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded surface text-mute">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
