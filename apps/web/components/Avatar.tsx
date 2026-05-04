// Avatar-Komponenten · Klient und Pflege-/Arzt-Personen.
//
// Zeigt das illustrierte Portrait wenn unter public/klienten/<id>.png oder
// public/people/<id>.png hinterlegt — fällt sonst auf eine Initialen-
// Bubble mit Brand-Gradient zurück. So kann das Asset-Set inkrementell
// wachsen ohne dass die UI bricht.

import Image from "next/image";

const KLIENT_AVATARS = new Set([
  "klient-hr", "klient-wb", "klient-eg", "klient-rk",
  "klient-im", "klient-fl", "klient-mc", "klient-ko",
]);

const PERSON_AVATARS = new Set([
  "person-dr", "person-ls", "person-as-005",
  "person-arzt-001", "person-arzt-002", "person-tg-lead",
]);

export function KlientAvatar({
  id,
  initials,
  size = 48,
  ring,
}: {
  id: string;
  initials: string;
  size?: number;
  ring?: string;          // optionaler farbiger Ring (z.B. Pflegegrad-Farbe)
}) {
  const has = KLIENT_AVATARS.has(id);
  return (
    <div
      className="relative shrink-0 grid place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: ring ? `0 0 0 2px rgb(${ring})` : undefined,
        background: has
          ? "transparent"
          : "linear-gradient(135deg, rgb(var(--wed)), rgb(var(--vibe-team)))",
      }}
      aria-hidden
    >
      {has ? (
        <Image
          src={`/klienten/${id}.png`}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span className="text-white font-semibold" style={{ fontSize: size * 0.32 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

export function PersonAvatar({
  id,
  initials,
  size = 36,
  role,
}: {
  id: string;
  initials: string;
  size?: number;
  role?: "nurse" | "lead" | "klient" | "doctor" | "psychologist";
}) {
  const has = PERSON_AVATARS.has(id);

  // Rolle bestimmt Fallback-Gradient
  const grad =
    role === "doctor" || role === "psychologist"
      ? "linear-gradient(135deg, rgb(var(--vibe-profile)), rgb(var(--vibe-team)))"
    : role === "lead"
      ? "linear-gradient(135deg, rgb(var(--vibe-team)), rgb(var(--thu)))"
    : role === "klient"
      ? "linear-gradient(135deg, rgb(var(--sun)), rgb(var(--fri)))"
      : "linear-gradient(135deg, rgb(var(--mon)), rgb(var(--thu)))";

  return (
    <div
      className="relative shrink-0 grid place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: has ? "rgb(var(--bg-mute))" : grad,
      }}
      aria-hidden
    >
      {has ? (
        <Image
          src={`/people/${id}.png`}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span className="text-white font-semibold" style={{ fontSize: size * 0.34 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

// PortraitFrame — größere Variante für Profil-Header & Persona-Tour:
// quadratisch, abgerundete Ecken, transparenter Hintergrund.
export function PortraitFrame({
  src,
  alt,
  size = 96,
  shape = "rounded",
}: {
  src: string;
  alt?: string;
  size?: number;
  shape?: "circle" | "rounded" | "square";
}) {
  const radius = shape === "circle" ? "50%" : shape === "rounded" ? size * 0.18 : 0;
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, background: "transparent" }}
    >
      <Image src={src} alt={alt ?? ""} fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}
