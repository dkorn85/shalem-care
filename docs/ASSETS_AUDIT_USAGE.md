# Asset-Audit · was wird genutzt, was liegt brach

**Stand:** 2026-05-05 · automatisch erfasst per Grep über `apps/web/{app,components,lib}` für jeden Datei-Pfad in `public/`.

## Genutzt (Stand jetzt)

199 Asset-Dateien insgesamt. Genutzte Dateien siehe direkte `src="/..."`-Referenzen
in den Komponenten — z.B. ImagingGallery, KlartextBegleiter, AudioPrompt,
OnboardingTour, AppShell-Backgrounds.

## Ungenutzt — Kandidaten zum Einbau

### Loops (Atmosphäre · 14 ungenutzt vor diesem Commit)

| Datei | Vorgesehen für | Empfehlung |
|---|---|---|
| `loops/akte-atem.mp4` | Klient-Akte Hintergrund | ✅ jetzt eingebaut auf `/klient/akte` |
| `loops/akte-ganzheit.mp4` | Akte/Holistik | Backup-Loop, optional auf `/klient/holistik` |
| `loops/akte-puls.mp4` | Akte/Vital | für `/klient/akte/befunde` als zarter Hintergrund |
| `loops/atmo-fenster.mp4` | Heller, ruhiger Atmo-Loop | ✅ jetzt eingebaut auf `/klient/holistik` |
| `loops/atmo-haende.mp4` | Pflege-warm | für `/pflege` Cockpit-Hero |
| `loops/atmo-wasser.mp4` | Therapie/Sozial | für `/therapie` oder `/sozial` |
| `loops/hero-haende.mp4` | Marketing-Hero | für `/warum` oder neue Marketing-Seite |
| `loops/hero-sonne.mp4` | Marketing-Hero (warm) | für Genossenschaft-Beitritt-Hero |
| `loops/hero-weg.mp4` | Onboarding-Hero | für `/willkommen` Hero |
| `loops/texture-atem.mp4` | Mikro-Hintergrund | als Body-Background für Marketing-Pages |
| `loops/texture-pflanze.mp4` | Marketing | für Hauswirtschaft-Seite oder Pflanzen-Pflege |
| `loops/texture-tee.mp4` | Marketing | für Cafeteria / Tagesstruktur |
| `loops/08_loop_geometry_breath_16x9.mp4` | Atemführung | für Schicht-Mantra-Komponente |
| `loops/09_loop_corridor_morning_16x9.mp4` | Frühschicht | für `/admin/dienstplan` Header |

### Onboarding-PNGs (8 ungenutzt)

`public/onboarding/balance.png`, `burnout-care.png`, `confetti.png`, `empty-state.png`,
`koop.png`, `lebensziel.png`, `skills.png`, `transparenz.png`, `welcome.png`

| Datei | Empfehlung |
|---|---|
| `welcome.png` | Hero-Bild für `/willkommen` |
| `balance.png` | für `/klient/akte` Balance-Card |
| `koop.png` | für `/genossenschaft` Hero |
| `lebensziel.png` | für `/klient` Heute-View bei Zielen |
| `transparenz.png` | für `/compliance` oder DSGVO |
| `burnout-care.png` | für Pflegekraft-Selbstfürsorge-Modul |
| `skills.png` | für Fortbildung-Modul |
| `confetti.png` | für Buchungsbestätigungen, Beitritts-Erfolg |
| `empty-state.png` | universal — Empty States in Listen-Views |

### Patterns (3 ungenutzt)

`public/patterns/brass-grain.png`, `sage-leaves.png`, `slate-mist.png`

Klassische Tile-Patterns für CSS-Hintergründe. Empfehlung: in `tailwind.config.js`
als `bg-image: url("/patterns/...")` mit `bg-repeat` ausgewählten Surfaces hinzufügen,
um die Optik weniger flach zu machen — z.B.:

- `sage-leaves` für Therapie/Heilerziehung-Cockpit (grün-natur)
- `brass-grain` für Lead/Admin-Cockpit (warmer, geerdeter Look)
- `slate-mist` für Notfall/Compliance (technisch-kühl)

## Skript zur Reproduktion

```bash
cd apps/web
for f in public/loops/*.mp4 public/onboarding/*.png public/patterns/*.png; do
  count=$(grep -rE "/${f#public/}" --include="*.tsx" --include="*.ts" app/ components/ lib/ 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then echo "UNGENUTZT: $f"; fi
done
```

## Nächste Schritte (priorisiert)

1. **`/willkommen` ausbauen** — `welcome.png` Hero + `hero-weg.mp4` Loop
2. **Pastell-Pass auf 12 Cockpits** — pro Beruf eigener Pastel-Token (analog `LiveMap.tsx`)
3. **Marketing-Seiten** mit `hero-sonne` / `hero-haende` aufwerten
4. **Patterns** in CSS einarbeiten — Tailwind-Config-Erweiterung
5. **Onboarding-Mini-Tour** mit den 8 Onboarding-PNGs als Schritt-Karten
