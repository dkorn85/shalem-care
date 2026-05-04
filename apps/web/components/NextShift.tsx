import type { Slot } from "@medplum/fhirtypes";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { getShiftType, getTariff } from "@/lib/fhir";
import { appleMapsNavUrl, googleMapsNavUrl } from "@/lib/maps";

const SHIFT_LABEL: Record<string, string> = {
  early: "Frühschicht",
  late: "Spätschicht",
  night: "Nachtschicht",
  intermediate: "Zwischendienst",
};

const SHIFT_COLOR: Record<string, string> = {
  early: "var(--mon)",
  late: "var(--fri)",
  night: "var(--sun)",
  intermediate: "var(--tue)",
};

export type NextShiftProps = {
  slot: Slot | null;
  einrichtung: {
    name: string;
    address: string;
    location: { lat: number; lng: number };
  } | null;
  station: {
    name: string;
    fachbereich: string;
  } | null;
  qualification: string;
  taskBrief: string;
};

export function NextShift({ slot, einrichtung, station, qualification, taskBrief }: NextShiftProps) {
  if (!slot || !einrichtung || !station) {
    return (
      <article className="surface rounded-2xl p-6 mb-6 text-center">
        <p className="text-[14px] text-mute">Kein nächster Dienst geplant.</p>
        <p className="text-[12px] text-soft mt-1">Im Marktplatz unten verfügbare Schichten anschauen.</p>
      </article>
    );
  }

  const start = new Date(slot.start!);
  const end = new Date(slot.end!);
  const shiftType = getShiftType(slot) ?? "early";
  const accent = SHIFT_COLOR[shiftType];
  const label = SHIFT_LABEL[shiftType];

  const timeFromNow = formatDistanceToNow(start, { addSuffix: true, locale: de });
  const dayLabel = isToday(start) ? "Heute" : isTomorrow(start) ? "Morgen" : format(start, "EEEE, d. MMMM", { locale: de });
  const timeLabel = `${format(start, "HH:mm", { locale: de })}–${format(end, "HH:mm", { locale: de })}`;
  const durationHours = (end.getTime() - start.getTime()) / 3_600_000;

  const apple = appleMapsNavUrl(einrichtung.location.lat, einrichtung.location.lng);
  const google = googleMapsNavUrl(einrichtung.location.lat, einrichtung.location.lng);

  return (
    <article className="surface rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden anim-float">
      <span aria-hidden className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ background: `rgb(${accent})` }} />
      <div className="ml-3">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <p className="text-[11px] uppercase tracking-wider text-soft font-medium">Nächster Dienst</p>
          <span className="text-[12px] text-mute font-mono">{timeFromNow}</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
          <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-tight2">{dayLabel}</h2>
          <span className="font-mono text-[18px] font-medium" style={{ color: `rgb(${accent})` }}>
            {timeLabel}
          </span>
          <span className="chip" style={{ background: `rgb(${accent} / 0.15)`, color: `rgb(${accent})` }}>
            {label}
          </span>
        </div>

        <p className="text-[14px] text-mute mt-3">
          <span className="text-[rgb(var(--fg))] font-medium">{einrichtung.name}</span>
          {" — "}{station.name} · {station.fachbereich}
        </p>
        <p className="text-[12px] text-soft mt-1">{einrichtung.address}</p>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-[12px]">
          <div>
            <dt className="text-soft uppercase tracking-wide text-[10px] font-medium">Dauer</dt>
            <dd className="font-mono mt-0.5">{durationHours.toFixed(1)} h</dd>
          </div>
          <div>
            <dt className="text-soft uppercase tracking-wide text-[10px] font-medium">Qualifikation</dt>
            <dd className="mt-0.5">{qualification}</dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-soft uppercase tracking-wide text-[10px] font-medium">Tarif</dt>
            <dd className="font-mono mt-0.5">{getTariff(slot) ?? "TVöD-P"}</dd>
          </div>
        </dl>

        <div className="mt-4 surface-mute rounded-lg p-3">
          <p className="text-[11px] uppercase tracking-wide text-soft font-medium mb-1">Aufgabenbereich</p>
          <p className="text-[13px]">{taskBrief}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={apple} target="_blank" rel="noopener" className="btn">
            <span aria-hidden>🗺️</span> Apple Maps
          </a>
          <a href={google} target="_blank" rel="noopener" className="btn">
            <span aria-hidden>🗺️</span> Google Maps
          </a>
          <span className="text-[11px] text-soft ml-1">Routenplanung</span>
        </div>
      </div>
    </article>
  );
}
