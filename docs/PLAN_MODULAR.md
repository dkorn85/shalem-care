# PLAN_MODULAR — Modularisierungs-Strategie

> "alles was modular sein kann modular, smooth effects"

Analysiert: `app/page.tsx`, `app/registrieren/page.tsx`, `app/warum/page.tsx`, `app/treuhand/page.tsx`, `app/compliance/page.tsx`, `app/notfall/page.tsx`, `app/admin/page.tsx`.

Befund: Es gibt **massive Wiederholung** in Inline-Sub-Components (`Saeule`, `Schritt`, `VertrauensTile`, `AuditIcon`, `Mini`, `QuickLink`) — alle bauen dasselbe Pattern: **farbiger Side-Stripe + ml-2.5 + Eyebrow + Title + Body**. Das ist 80 % der gesamten Marketing-/Cockpit-UI. Eine einzige `<AccentCard>` ersetzt 6+ Inline-Komponenten.

CSS-Bausteine sind teils schon da (`anim-slideUp`, `anim-float`, `anim-fadeIn`, `pageIn/Out`) — was fehlt: **scroll-getriggerter Reveal** (IntersectionObserver) und ein **Rolle-Theme-Layer**.

---

## Tier 1 · Höchster Hebel (sofort extrahieren)

### 1. `<AccentCard>` — DAS Pattern
Der **3px-Side-Stripe in Rollenfarbe + ml-2.5-Inhalt** taucht in *jeder* Page ≥ 4× auf. Ersetzt: `Saeule`, `Schritt`, `VertrauensTile`, `AuditIcon`, `Mini`, `QuickLink`, die `PILLARS`-Karten in `page.tsx`, die `HANDBUCH_KAPITEL`-Karten, die `PUNKTE`-Status-Liste in `compliance`, die `ESKALATIONS_KETTE`-Items, die `Hausmittel`-Tiles.

```tsx
type AccentCardProps = {
  accent: string;                   // "var(--mon)" | "var(--vibe-team)" | etc.
  eyebrow?: string;                 // "Schritt 1" / "KAP 03" / "Basis"
  title: string;
  body?: ReactNode;
  image?: { src: string; alt?: string; aspect?: string };
  chips?: { label: string; tone?: "neutral" | "accent" }[];
  href?: string;                    // wenn gesetzt → ganze Karte = Link
  variant?: "tile" | "row" | "stat"; // tile=mit Bild, row=horizontal, stat=Mini-KPI
  delay?: number;                   // anim-delay in 0.05s-Schritten
  hover?: "lift" | "glow" | "slide"; // smooth effect preset
  children?: ReactNode;             // optional: <details>-Block, Listen
};
```

**Smooth-Effekt:** `data-reveal` mit IntersectionObserver-Hook → `anim-slideUp` triggert, sobald Karte sichtbar wird (nicht mehr beim Page-Load alle gleichzeitig). Hover-Variante "lift": `translate-y-[-2px] shadow-elev` mit 200 ms cubic-bezier.

**Pages die profitieren:** alle 7 geprüften Pages.

---

### 2. `<HeroBanner>` — Marketing-Hero
`registrieren`, `warum`, `compliance` haben **identisches** Hero-Pattern: 16/9-Bild + Bottom-Gradient + Eyebrow + Headline mit `<span class="rainbow-text">` + Sub-Lead. `treuhand`, `notfall`, `admin` haben eine Variante davon (Side-by-Side statt Overlay).

```tsx
type HeroBannerProps = {
  variant: "overlay" | "split" | "compact"; // overlay=Bild full-bleed, split=lg:grid-12, compact=admin
  eyebrow?: string;
  title: ReactNode;                  // erlaubt <span class="rainbow-text">
  lead?: string;
  image?: { src: string; alt?: string; aspect?: string };
  loop?: { src: string };            // optionales Video-Loop (treuhand-fluss, notfall-puls)
  cta?: { label: string; href: string }[];
  priority?: boolean;
};
```

**Smooth-Effekt:** Headline `anim-slideUp` cascade (line-1 → line-2 → lead je 100 ms versetzt). Image: 800 ms `scale(1.04) → scale(1)` Ken-Burns auf Mount.

**Pages:** alle Marketing-Pages (`/`, `/warum`, `/registrieren`, `/compliance`, `/notfall`, `/treuhand`).

---

### 3. `<SectionHeader>` — Eyebrow + H2 + Lead
Wiederholt sich **jede 80 Zeilen**: `<p class="text-[11px] uppercase tracking-wider text-soft mb-3 font-medium">Eyebrow</p>` + `<h2>` mit optional `rainbow-text`-Highlight + `<p text-mute>`.

```tsx
type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  align?: "start" | "center";
  size?: "sm" | "md" | "lg";   // 24/32/44px
  accent?: string;             // färbt Eyebrow
};
```

**Smooth-Effekt:** Reveal beim Scroll, Eyebrow fade-in mit 50 ms Delay vor Title.

**Pages:** alle.

---

### 4. `<MediaSplit>` — Bild + Text Side-by-Side
`warum/page.tsx` hat 3× Sektion mit `lg:grid-cols-12` + `lg:order-1/2`, `treuhand` 2×, `compliance` 1×, `notfall` 1×, `page.tsx` 1× ("Drei Mitglieder, ein Schlussstein").

```tsx
type MediaSplitProps = {
  image: { src: string; alt?: string; aspect?: string };
  imageSide?: "left" | "right";   // alternierend für Storyflow
  ratio?: "5/7" | "7/5" | "6/6";  // Spalten-Verhältnis
  glow?: boolean;                 // Blur-Halo-Hintergrund (s. Schlussstein-Section)
  children: ReactNode;            // = SectionHeader + Liste
};
```

**Smooth-Effekt:** Bild slidet von der zugewandten Seite ein (`translate-x-[-20px] → 0`), Text-Spalte fade+slide-up parallel. Hover auf Bild: subtiles `scale(1.02)` mit `transition-transform 600ms`.

**Pages:** `warum`, `treuhand`, `notfall`, `compliance`, `page` (Schlussstein).

---

### 5. `<RevealOnScroll>` Wrapper + `useReveal()` Hook
Fehlt komplett. Der bestehende `anim-slideUp` feuert beim Mount → unterhalb des Folds kommt's nicht zur Geltung. Mit `IntersectionObserver` wird der Effekt erst bei Sichtbarkeit ausgelöst.

```tsx
// hooks/useReveal.ts
export function useReveal<T extends HTMLElement>(opts?: { once?: boolean; rootMargin?: string }) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.dataset.revealed = "true";
        if (opts?.once !== false) io.disconnect();
      }
    }, { rootMargin: opts?.rootMargin ?? "-10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// Component
<RevealOnScroll as="section" effect="slideUp" delay={0.1}>...</RevealOnScroll>
```

CSS:
```css
[data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity .5s var(--ease-out-quart), transform .5s var(--ease-out-quart); }
[data-reveal][data-revealed="true"] { opacity: 1; transform: none; }
```

---

## Tier 2 · Konsistenz-Layer

### 6. `<RoleTheme>` — Look-and-Feel pro Rolle
Aktuell: `AppShell` setzt nur `role="lead" | "nurse" | "klient" | "doctor"` als Layout-Switch. Was fehlt: ein **kohärenter Visual-Layer** der pro Rolle Akzentfarbe, Heading-Akzent und Hover-Effekt setzt.

```tsx
// lib/theme/role.ts
export const ROLE_THEME = {
  lead:   { accent: "var(--vibe-team)",  pattern: "rings",     hover: "lift",  serif: "display" },
  nurse:  { accent: "var(--mon)",        pattern: "weave",     hover: "glow",  serif: "display" },
  klient: { accent: "var(--sun)",        pattern: "soft-dots", hover: "breath",serif: "display" },
  doctor: { accent: "var(--vibe-stats)", pattern: "grid",      hover: "slide", serif: "mono"    },
} as const;

// component
<RoleTheme role="lead">  // setzt CSS-vars: --role-accent, --role-pattern, --role-hover
  <AppShell>...</AppShell>
</RoleTheme>
```

**Smooth-Effekt:** Beim Rollen-Wechsel (Persona-Switcher) crossfade der CSS-vars über 400 ms via `transition: --role-accent`. Pattern-Background als `mask-image` mit dezenter Opacity 0.04.

**Pages:** alle Rollen-Cockpits (`/admin`, `/pflege`, `/klient`, `/arzt`).

---

### 7. `<StatTile>` (Spezialfall von AccentCard, aber sehr häufig)
`StatsRow` existiert schon — aber `Mini` in `admin/page.tsx`, die KPI-Boxen in `treuhand`, die Säulen-Zahlen in `warum` (`82–86 %`, `4 %`, `0 €`) sind **nicht** in `StatsRow` zentralisiert.

```tsx
type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "flat";
  alarm?: boolean;
  color?: string;
  size?: "xs" | "sm" | "md";
  delay?: number;
};
```

**Smooth-Effekt:** Wert `count-up` Animation beim ersten Reveal (von 0 → Zielwert in 700 ms `ease-out-quart`). Alarm: `pulse-dot`-Indicator (already in CSS).

---

### 8. `<NumberedList>` — Drei-Schritt + Säulen-Liste
`treuhand` Schritt 1/2/3, `notfall` Eskalations-Kette 1–4, `KNEIPP_SAEULEN` 1–5. Pattern: nummerierter Marker + Title + Body + farbiger Akzent.

```tsx
type NumberedListProps = {
  variant: "horizontal" | "vertical";
  items: { number: string | number; title: string; body: string; accent: string; chip?: string; image?: string }[];
};
```

**Smooth-Effekt:** Stagger-Reveal — jedes Item +0.08 s versetzt.

---

### 9. `<RainbowText>` + `<RainbowBar>`
Die `<span class="rainbow-text">` und `<div class="rainbow-bar h-1.5 w-24 rounded-full mb-6">` sind in *jeder* Hero. Schon CSS-Klassen vorhanden — fehlt nur ein dünner Wrapper für Type-Safety + animierte Variante.

```tsx
<RainbowText animate="shimmer | static">alle</RainbowText>
<RainbowBar width="sm | md | lg" animated />
```

**Smooth-Effekt:** `shimmer`-Variante: bestehende `shimmer` keyframe (8s linear infinite).

---

## Tier 3 · Polish (Nice-to-have)

### 10. `<PageTransition>` — Route-Wechsel
Bereits halb in `globals.css` (`pageIn`/`pageOut` keyframes). Fehlt: View-Transition-API-Integration für Next.js 15.

```tsx
// app/template.tsx (Next 15 native pattern)
export default function Template({ children }: { children: ReactNode }) {
  return <div className="anim-pageIn">{children}</div>;
}
```

Mit View-Transitions-API: Bilder die in zwei Routen vorkommen (Hero-Image → Detail-Image) animieren via `view-transition-name` smooth zwischen den Pages.

---

### 11. `<HoverGlow>` Wrapper
Generischer Hover-Effekt-Container. Hat 3 Presets:
- `lift`: translateY(-2px) + shadow
- `glow`: box-shadow color-aware (Rolle-Accent)
- `slide`: ml-1 + Pfeil fade-in (so wie `QuickLink` in admin schon macht)

```tsx
<HoverGlow effect="glow" accent="var(--mon)">
  <Link href="...">...</Link>
</HoverGlow>
```

---

### 12. `<ListWithBullets>` — Bullet-Liste mit farbigen Dots
`page.tsx` Schlussstein-Section, `compliance` Phase-2-Liste, `notfall` Phase-2-Liste, `treuhand` Phase-2-Liste, alle nutzen identisches Pattern: `<li class="flex gap-2 items-baseline"><span>›</span><span>...</span></li>`.

```tsx
<ListWithBullets
  marker="dot" | "chevron" | "color-dot"
  items={[{ text: "...", accent?: "var(--mon)" }, ...]}
/>
```

---

## Priorisierung (Refactoring-Hebel)

| Rang | Komponente | Sparpotential | Pages betroffen | Aufwand |
|------|------------|--------------:|-----------------|--------:|
| 1 | `<AccentCard>` | ~600 LoC | 7/7 | 1 Tag |
| 2 | `<HeroBanner>` | ~250 LoC | 6/7 | 0.5 T |
| 3 | `<SectionHeader>` | ~150 LoC | 7/7 | 0.25 T |
| 4 | `<MediaSplit>` | ~200 LoC | 5/7 | 0.5 T |
| 5 | `<RevealOnScroll>` + Hook | neu | 7/7 | 0.5 T |
| 6 | `<RoleTheme>` | neu (UX) | alle Cockpits | 1 T |
| 7 | `<StatTile>` | ~80 LoC | admin, treuhand, warum | 0.25 T |
| 8 | `<NumberedList>` | ~120 LoC | treuhand, notfall, page | 0.25 T |

**Gesamt-Tier-1: ~1200 LoC weg, 4 Tage, sofort sichtbarer Konsistenz-Sprung.**

---

## Bonus-Patterns (entdeckt während Analyse)

- **`<DetailsBlock>`** — `<details><summary>Prinzipien · Zitate</summary>` taucht in `page.tsx` 2×, in Hausmittel-Tiles N×. Smoother Disclosure mit Höhe-Animation.
- **`<PhaseRoadmapList>`** — `treuhand` und `notfall` haben identische "Phase 2 · was kommt"-Listen. Einheitliches Pattern mit Status-Chip pro Item.
- **`<VideoLoop>`** — `treuhand-fluss.mp4` und `notfall-puls.mp4` nutzen identisches Setup (autoPlay/muted/loop/playsInline + Gradient-Overlay). Wrapper mit Lazy-Mount via IntersectionObserver wäre schöner für Performance.

---

## Datei-Struktur-Vorschlag

```
apps/web/components/
├── primitives/
│   ├── AccentCard.tsx
│   ├── HeroBanner.tsx
│   ├── SectionHeader.tsx
│   ├── MediaSplit.tsx
│   ├── StatTile.tsx
│   ├── NumberedList.tsx
│   ├── RainbowText.tsx
│   ├── RainbowBar.tsx
│   ├── ListWithBullets.tsx
│   ├── DetailsBlock.tsx
│   ├── VideoLoop.tsx
│   └── HoverGlow.tsx
├── motion/
│   ├── RevealOnScroll.tsx
│   ├── PageTransition.tsx
│   └── useReveal.ts
└── theme/
    ├── RoleTheme.tsx
    └── role-theme.ts
```

Bestehende `components/` bleibt für domain-spezifische Komponenten (`AnamneseFormular`, `KonferenzLive`, etc.) unverändert.
