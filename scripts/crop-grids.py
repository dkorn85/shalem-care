"""Crop 5 GPT-Image-2.0 9er-Grids in 45 Einzelbilder + Chroma-Key
für die Sim-Persona-Avatare.

Aufruf: python scripts/crop-grids.py
Erwartet die 5 Source-Bilder in C:\\Users\\dkorn\\Downloads\\.
"""

import os
from PIL import Image

DOWNLOADS = r"C:\Users\dkorn\Downloads"
PUBLIC = r"C:\Users\dkorn\Downloads\shalem-care-v0.1.0\shalem-care\.claude\worktrees\keen-ramanujan-a94771\apps\web\public"


def crop_grid(src_name, out_paths):
    """Schneidet src in 3x3 Zellen + speichert nach out_paths (Reihenfolge: links→rechts, oben→unten)."""
    src = os.path.join(DOWNLOADS, src_name)
    im = Image.open(src)
    w, h = im.size
    cw, ch = w // 3, h // 3
    for i in range(3):
        for j in range(3):
            cell = im.crop((j * cw, i * ch, (j + 1) * cw, (i + 1) * ch))
            idx = i * 3 + j
            out = out_paths[idx]
            os.makedirs(os.path.dirname(out), exist_ok=True)
            cell.save(out, optimize=True)
            print(f"  → {os.path.relpath(out, PUBLIC)} ({cell.size[0]}×{cell.size[1]})")


def chroma_key_inplace(path):
    """Macht das #00FF00 Greenscreen transparent. Toleranz fuer Aliasing-Edges."""
    im = Image.open(path).convert("RGBA")
    pixels = list(im.getdata())
    new = []
    for r, g, b, a in pixels:
        # Pure-Green: g hoch, r+b niedrig → transparent
        # Edge-Aliasing: leicht-grünliche Pixel → halb transparent
        if g > 200 and r < 130 and b < 130:
            new.append((r, g, b, 0))
        elif g > 170 and r < 160 and b < 160 and (g - max(r, b)) > 40:
            # Soft edge: alpha proportional zur Grün-Dominanz
            ratio = (g - max(r, b)) / 100
            alpha = max(0, int(255 * (1 - ratio)))
            new.append((r, g, b, alpha))
        else:
            new.append((r, g, b, a))
    im.putdata(new)
    im.save(path, optimize=True)
    print(f"  ✓ chroma-key applied")


# ─── Grid 1: Berufs-Portraits ────────────────────────────────────
print("Grid 1 · portraits-berufe.png → portraits/ + people/ + klienten/")
crop_grid(
    "portraits-berufe.png",
    [
        # Row 1 (Lieferanten-Berufe)
        f"{PUBLIC}/portraits/10_9_portrait_hausmeister_1x1.png",
        f"{PUBLIC}/portraits/10_10_portrait_reinigung_1x1.png",
        f"{PUBLIC}/portraits/10_11_portrait_recycling_1x1.png",
        # Row 2 (Persona-Portraits)
        f"{PUBLIC}/portraits/10_12_portrait_lebensmittel_1x1.png",
        f"{PUBLIC}/klienten/klient-hr-portrait.png",
        f"{PUBLIC}/people/fam-petra-portrait.png",
        # Row 3
        f"{PUBLIC}/people/person-arzt-001-portrait.png",
        f"{PUBLIC}/people/person-eh-001-portrait.png",
        f"{PUBLIC}/people/person-pdl-001-portrait.png",
    ],
)

# ─── Grid 2: Akte-Header (16:9) ───────────────────────────────────
print("\nGrid 2 · akte-header.png → akte/")
crop_grid(
    "akte-header.png",
    [
        f"{PUBLIC}/akte/header-gemeinwohl.png",
        f"{PUBLIC}/akte/header-lieferanten.png",
        f"{PUBLIC}/akte/header-expertenstandards.png",
        f"{PUBLIC}/akte/header-netz-berufe.png",
        f"{PUBLIC}/akte/header-demo-leben.png",
        f"{PUBLIC}/akte/header-pflege-assessment.png",
        f"{PUBLIC}/akte/header-hausmeister.png",
        f"{PUBLIC}/akte/header-reinigung.png",
        f"{PUBLIC}/akte/header-lebensmittel.png",
    ],
)

# ─── Grid 3: GWÖ-Werte + Berührungsgruppen ───────────────────────
print("\nGrid 3 · beruehrungsgruppen.png → icons/")
crop_grid(
    "beruehrungsgruppen.png",
    [
        f"{PUBLIC}/icons/gwoe-menschenwuerde.png",
        f"{PUBLIC}/icons/gwoe-solidaritaet.png",
        f"{PUBLIC}/icons/gwoe-nachhaltigkeit.png",
        f"{PUBLIC}/icons/gwoe-transparenz.png",
        f"{PUBLIC}/icons/gwoe-mitbestimmung.png",
        f"{PUBLIC}/icons/gwoe-grp-lieferanten.png",
        f"{PUBLIC}/icons/gwoe-grp-eigentuemer.png",
        f"{PUBLIC}/icons/gwoe-grp-mitarbeitende.png",
        f"{PUBLIC}/icons/gwoe-grp-kunden.png",
    ],
)

# ─── Grid 4: Sim-Personas (Greenscreen → Alpha) ──────────────────
print("\nGrid 4 · sim-persona.png → people/ + klienten/ (mit Chroma-Key)")
sim_paths = [
    f"{PUBLIC}/klienten/klient-hr.png",
    f"{PUBLIC}/people/fam-petra.png",
    f"{PUBLIC}/people/person-dr.png",
    f"{PUBLIC}/people/person-arzt-001.png",
    f"{PUBLIC}/people/person-therapeut-001.png",
    f"{PUBLIC}/people/person-hwf-001.png",
    f"{PUBLIC}/people/person-hm-001.png",
    f"{PUBLIC}/people/person-rei-001.png",
    f"{PUBLIC}/people/person-eh-001.png",
]
crop_grid("sim-persona.png", sim_paths)
print("\nApplying chroma-key to all 9 persona avatars …")
for p in sim_paths:
    print(f"  {os.path.relpath(p, PUBLIC)}")
    chroma_key_inplace(p)

# ─── Grid 5: DNQP-Standard-Glyphen ───────────────────────────────
print("\nGrid 5 · dnqp.png → icons/")
crop_grid(
    "dnqp.png",
    [
        f"{PUBLIC}/icons/dnqp-dekubitus.png",
        f"{PUBLIC}/icons/dnqp-schmerz.png",
        f"{PUBLIC}/icons/dnqp-sturz.png",
        f"{PUBLIC}/icons/dnqp-ernaehrung.png",
        f"{PUBLIC}/icons/dnqp-wunde.png",
        f"{PUBLIC}/icons/dnqp-mobilitaet.png",
        f"{PUBLIC}/icons/dnqp-demenz.png",
        f"{PUBLIC}/icons/dnqp-hautintegritaet.png",
        f"{PUBLIC}/icons/dnqp-kontinenz.png",
    ],
)

print("\n✓ Alle 45 Bilder erzeugt.")
