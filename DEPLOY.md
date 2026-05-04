# Deployment auf shalem.de

Schritt-für-Schritt zwei Wege: **Vercel** (10 min, empfohlen) oder
**Hostinger Node.js Hosting** (30 min, mit eigener Plattform).

---

## Vorab — Repo bei GitHub anlegen

```bash
cd /pfad/zu/shalem-care
git init
git add .
git commit -m "Initial deploy bundle"
gh repo create dkorn/shalem-care --private --source=. --push
```

(oder ohne `gh` manuell auf github.com/new, dann
`git remote add origin git@github.com:dkorn/shalem-care.git && git push -u origin main`)

---

## Option A · Vercel (empfohlen für Demo)

Vercel ist die native Plattform für Next.js — Server Actions, Streaming,
ISR funktionieren ohne Konfiguration. Free-Tier reicht für die Demo.

1. **Importieren**: vercel.com → „Add New… › Project" → GitHub-Repo
   `shalem-care` auswählen.
2. **Build-Settings** überschreiben:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js (auto-erkannt)
   - **Build Command**: `next build`
   - **Output**: leer lassen (default `.next`)
3. **Environment Variables** anlegen (siehe `.env.example`):
   - `NEXT_PUBLIC_DEMO_MODE=1`
   - `DEEPSEEK_API_KEY=...` (optional, sonst Mock-Modus)
   - `SHALEM_STORE=memory`
4. „Deploy" klicken. Nach ~2 min läuft die App auf `*.vercel.app`.
5. **Custom Domain shalem.de**:
   - Vercel → Project → Settings → Domains → `shalem.de` hinzufügen.
   - Vercel zeigt zwei DNS-Records:
     - `A` Root → `76.76.21.21`
     - `CNAME` `www` → `cname.vercel-dns.com`
   - In Hostinger DNS-Zone diese Records anlegen, alte A/CNAME für
     `@` und `www` löschen.
   - SSL-Zertifikat wird automatisch von Vercel ausgestellt (~5 min).

---

## Option B · Hostinger Node.js Hosting

Falls die Demo zwingend bei Hostinger bleiben soll. Voraussetzung:
ein Hostinger-Plan mit Node.js-Hosting (nicht jeder Plan; falls nicht
verfügbar → Vercel).

### 1. Im Hostinger-Onboarding:
- **Bereitstellungsmethode**: „Git-Repository importieren"
- **Mit GitHub verbinden** → Account autorisieren → Repo `shalem-care` wählen
- **Branch**: `main`
- **Ordner / App-Wurzel**: `/` (Root, NICHT `/apps/web`)

### 2. Node.js-Konfiguration:
- **Node-Version**: 20 oder 22 (nicht 18 — Next.js 15.5 braucht ≥ 20.10)
- **Anwendungsstartdatei**: `apps/web/.next/standalone/apps/web/server.js`
- **Build-Befehl** (falls separates Feld): `npm run build`
- **Startbefehl**: `npm start`

### 3. Environment Variables:
- `NODE_ENV=production`
- `HOSTNAME=0.0.0.0`
- `PORT=` ← den Port nehmen, den Hostinger im Panel anzeigt
- `NEXT_PUBLIC_DEMO_MODE=1`
- `DEEPSEEK_API_KEY=...` (optional)

### 4. Domain anbinden:
- hPanel → Domains → shalem.de → DNS-Zone
- A-Record `@` → die Hosting-IP (steht unter „Server-Details")
- A-Record `www` → gleiche IP
- SSL-Zertifikat aktivieren (Let's Encrypt, automatisch)

### 5. Erste Deploys:
- Hostinger zieht das Repo, führt `postinstall` und `build` aus
- Beim ersten Build dauert `npm install` ~3 min
- App ist unter `https://shalem.de` erreichbar

### Troubleshooting Hostinger:
- **"Cannot find module ./server.js"**: Build hat das Standalone-Verzeichnis
  nicht korrekt erstellt. Im Panel Logs prüfen, dass `[post-build]` lief.
- **502 Bad Gateway**: PORT-Konflikt. Im Hostinger-Panel den von dort
  vergebenen Port als ENV-Variable setzen.
- **Build OOM**: Hostinger Shared-Hosting hat oft 512 MB RAM-Limit.
  Lösung: lokal `npm run build` ausführen, nur `.next/` und
  `apps/web/.next/standalone/` ins Repo committen, oder VPS-Plan upgraden.

---

## Option C · VPS / Eigener Server (Docker)

Wenn ein VPS verfügbar ist (Hostinger VPS, Hetzner, OVH, etc.):

```bash
ssh root@<vps-ip>
git clone https://github.com/dkorn/shalem-care
cd shalem-care
cp .env.example .env && nano .env  # Werte eintragen
docker compose up -d --build
```

Reverse Proxy (Caddy) für SSL:

```Caddyfile
shalem.de, www.shalem.de {
  reverse_proxy localhost:3000
}
```

DNS bei Hostinger: A-Record `@` und `www` → VPS-IP.

---

## Verifizieren nach Deploy

```bash
curl -I https://shalem.de/willkommen          # 200
curl -I https://shalem.de/dienst              # 200
curl -I https://shalem.de/arzt                # 200
```

Die Demo-Personas (Pflegekraft Dennis Reuter, Lead Detektiv Eins,
Arzt Dr. Hartmann) sind direkt nutzbar — keine Login-Hürde.

---

## Rebuild bei Code-Änderung

- **Vercel/Hostinger Git**: `git push origin main` → Auto-Deploy
- **VPS Docker**: `git pull && docker compose up -d --build`
