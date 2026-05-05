# Asset-Brief · Block 12 · Stilisierte Bildgebung (Wirbelsäule + mehr)

**Stand:** 2026-05-05 nach Befunde-Erweiterung um 5 Klient:innen
**Pipeline:** GPT Image 2.0 (Stills für Bildgebung) — keine Loops
**Ziel:** ergänzt die bestehenden SVG-Inline-Placeholder durch eigenständige
PNG-Illustrationen, die als Bild-URL in `ImagingBefund.ansichten[].bildUrl`
geladen werden. Sobald gerendert, ersetzen sie automatisch den SVG-Placeholder
(die Komponente fällt nur zurück, wenn die URL fehlt — Phase 2 liefert echte
DICOM-Frames über DICOMweb).

## Globale Regeln

> Stylized medical imaging aesthetic, monochrome neutral palette (warm grey
> for X-ray, cool blue-grey for MRI, near-black with green halftone for
> ultrasound, near-black with sharp white edges for CT). Anatomy is
> approximate-correct, not textbook precise. Subject occupies center with
> ~15 % padding. Soft scan-line artifacts acceptable. No annotations,
> no legends, no tags, no patient identifiers.

**Anti-Pattern:** keine farbigen Pathologie-Hervorhebungen (kein Rot für
"Befund hier"), keine Pfeile, keine Beschriftungen, keine 3D-Ray-Tracing
oder Hyperrealismus. Es geht um eine ruhige instructional-style
Visualisierung.

**Format:**
- Quadratisch 1024×1024
- PNG, 24-bit, kein Alpha
- Bezeichnung passend zum Pfad in `befund/store.ts`

---

## Wirbelsäule

### LWS lateral · `/befunde/demo/lws-lateral.png`
```
X-ray lateral view of lumbar spine, classic standing radiograph aesthetic.
5 lumbar vertebrae and S1 visible. Subtle anterior curvature (lordosis),
intervertebral disc spaces clearly visible as darker bands. Mild osteophyte
spurring at L3-L5 endplates suggesting spondylosis. Soft tissue silhouette
visible. Warm grey palette, faint film-grain. 1024x1024 PNG.
```

### LWS a.p. · `/befunde/demo/lws-ap.png`
```
X-ray anteroposterior view of lumbar spine. Vertebral bodies symmetric,
pedicles visible as oval projections, transverse processes extend laterally.
Sacrum visible at lower edge. Warm grey radiograph aesthetic. 1024x1024.
```

### LWS sagittal MRT · `/befunde/demo/lws-mrt-sag.png` + `lws-mrt-sag-im.png`
```
T2-weighted sagittal MRI of lumbar spine. Spinal cord ending at L1 (conus),
cauda equina visible as fine streaks within thecal sac. At L4-L5 (or L5-S1
for second variant): subtle posterior disc bulge encroaching on thecal sac.
Cool blue-grey palette, dark CSF appearing bright. 1024x1024 PNG.
```

### LWS axial MRT · `/befunde/demo/lws-mrt-ax.png` + `lws-mrt-ax-im.png`
```
T2-weighted axial MRI through L4-L5 (or L5-S1) disc level. Vertebral body
in center, posterior elements (lamina, spinous process) at top, paraspinal
muscles laterally. Disc with mild posterior-lateral bulge.
1024x1024 PNG, blue-grey palette.
```

### BWS sagittal CT · `/befunde/demo/bws-ct-sag.png`
```
Sagittal reformatted CT of thoracic spine. 12 thoracic vertebrae stacked,
mild kyphotic curve. T12 with anterior wedge compression (osteoporotic
sinterungsfracture, height loss ~30 %). Trabecular bone visible. Sharp
white-on-black CT aesthetic. 1024x1024 PNG.
```

### BWS axial CT · `/befunde/demo/bws-ct-ax.png`
```
Axial CT through mid-thoracic vertebra. Vertebral body, costovertebral
joints, ribs visible bilaterally. Spinal canal central. Sharp CT aesthetic
with bone window. 1024x1024 PNG.
```

### HWS sagittal MRT · `/befunde/demo/hws-mrt-sag.png`
```
T2-weighted sagittal MRI of cervical spine. 7 cervical vertebrae, foramen
magnum visible top, C5-C6 with subtle anterior slip (spondylolisthesis Grade
I, Meyerding). Mild canal stenosis. Cool blue-grey palette. 1024x1024 PNG.
```

### HWS axial MRT · `/befunde/demo/hws-mrt-ax.png`
```
T2-weighted axial MRI at C5-C6 level. Vertebral body, spinal cord central,
nerve roots exiting through neural foramina. Mild cord signal change.
1024x1024 PNG, cool blue-grey.
```

---

## Schädel

### CT axial · `/befunde/demo/schaedel-ct-ax.png`
```
Axial brain CT, basal ganglia level. Symmetric ventricles, gyri/sulci
pattern visible, mild cortical atrophy (widened sulci). Faint hypodensity
right MCA territory representing chronic ischemic infarct. Sharp white-on-
black CT aesthetic, brain window. 1024x1024 PNG.
```

### CT coronar · `/befunde/demo/schaedel-ct-cor.png`
```
Coronal brain CT, mid-section. Ventricles, basal ganglia, cortical mantle
visible. Subtle right hemisphere volume loss. CT brain window. 1024x1024.
```

### MRT axial · `/befunde/demo/schaedel-mrt-ax.png` + `schaedel-mrt-ax-fl.png`
```
T2-FLAIR axial MRI at basal ganglia level. Symmetric ventricles, periventricular
white matter with confluent FLAIR hyperintensities (Fazekas 3 pattern, vascular
leukoaraiosis). For -fl variant: additional cystic defect right MCA territory
(post-infarct). Cool blue-grey palette. 1024x1024 PNG.
```

### MRT sagittal · `/befunde/demo/schaedel-mrt-sag.png`
```
T1 sagittal MRI midline brain. Corpus callosum, brainstem, cerebellum,
ventricles visible. Cool blue-grey palette. 1024x1024.
```

### MRT coronar · `/befunde/demo/schaedel-mrt-cor-fl.png`
```
T2-FLAIR coronal MRI mid-brain. Ventricles, deep gray matter visible.
Right MCA territory with cystic encephalomalacia. 1024x1024.
```

---

## Thorax

### Röntgen a.p. · `/befunde/demo/thorax-ap.png`
```
Standard chest radiograph PA view. Lung fields hyperinflated with
flattened diaphragm and increased AP-diameter — emphysematous pattern
consistent with COPD GOLD 3. Heart silhouette mid-line normal size.
No infiltrates. Warm grey radiograph aesthetic. 1024x1024 PNG.
```

### Röntgen lateral · `/befunde/demo/thorax-lateral.png`
```
Lateral chest radiograph. Increased retrosternal airspace, flattened
hemidiaphragms, kyphotic thoracic spine. Warm grey radiograph aesthetic.
1024x1024 PNG.
```

---

## Knie

### MRT sagittal · `/befunde/demo/knie-mrt-sag.png`
```
T2-weighted sagittal MRI of right knee. Femur, tibia, patella visible.
Cartilage thinning on tibial plateau. Subchondral edema medial femoral
condyle. Posterior horn medial meniscus with complex tear. Cool blue-grey
palette. 1024x1024 PNG.
```

### MRT coronar · `/befunde/demo/knie-mrt-cor.png`
```
T2-weighted coronal MRI of right knee. Medial and lateral compartments,
menisci visible. Joint space narrowing medially. Subchondral marrow
edema. Cool blue-grey palette. 1024x1024 PNG.
```

---

## Carotiden (Sonographie)

### Carotis-Sono links / rechts · `/befunde/demo/carotis-sono-li.png` + `carotis-sono-re.png`
```
Carotid duplex ultrasound long-axis view. Common carotid artery with
distinct wall echo, internal lumen anechoic. Bifurcation visible
distally. Soft plaque visible at proximal ICA on right side variant.
Doppler color overlay subtle (warm orange-red flow direction).
Black background with green-yellow ultrasound halftone. 1024x1024 PNG.
```

---

## Liefer-Reihenfolge (Empfehlung)

1. **Erste Welle** — am häufigsten verwendet:
   `lws-lateral · lws-mrt-sag · lws-mrt-ax · schaedel-ct-ax · schaedel-mrt-ax · thorax-ap`

2. **Zweite Welle** — ergänzend:
   `lws-ap · bws-ct-sag · bws-ct-ax · hws-mrt-sag · hws-mrt-ax`

3. **Dritte Welle** — Knie + Vergleichs-Varianten:
   `knie-mrt-sag · knie-mrt-cor · schaedel-mrt-ax-fl · schaedel-mrt-cor-fl · lws-mrt-sag-im · lws-mrt-ax-im`

4. **Polish** — Ultraschall + zusätzliche Projektionen:
   `carotis-sono-li · carotis-sono-re · schaedel-ct-cor · thorax-lateral · schaedel-mrt-sag`

## Hinweis für die Pipeline

GPT Image 2.0 versucht oft, Pathologien farbig hervorzuheben — explizit
"no colored highlighting" und "no annotation arrows" mitgeben. Bei
schwierigen Generationen alternativer Prompt-Ansatz: "in the style of
a medical textbook illustration", aber das verschiebt den Look stärker
in Richtung Lehrbuch-Diagramm und weg von Radiologen-Bildschirm.

Sobald geliefert: einfach unter `apps/web/public/befunde/demo/` ablegen.
ImagingGallery erkennt automatisch ob die URL existiert und ersetzt das
SVG-Placeholder. Phase 2 ersetzt dann den `bildUrl` durch echte DICOM-
WADO-URLs.
