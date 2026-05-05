# Auth-Setup · OAuth-Provider in Supabase aktivieren

**Stand:** 2026-05-05 · Branch `claude/tender-nightingale-f1bb8b`

Die App hat das **UI-Gerüst** für OAuth-Login fertig (`/registrieren`,
`/registrieren/verifizieren`, Provider-Katalog in `lib/auth/providers.ts`).
Damit echte Logins funktionieren, musst du jeden Provider **in Supabase
einmalig konfigurieren**. Dieser Brief führt dich durch.

## Voraussetzung

- Supabase-Projekt: `gpchwlqeqejxvynewjns` (Frankfurt)
- Du musst Owner-Rechte im Dashboard haben (https://app.supabase.com)
- Schema ist bereits angelegt — `profiles`, `user_roles`, `verifications`
  + Auto-Profile-Trigger auf `auth.users`. Migration: `init_auth_profiles_verifications`.

## 1 · Site-URL + Redirect-URLs

Supabase Dashboard → **Authentication → URL Configuration**

```
Site URL:                  https://shalem.de
Additional Redirect URLs:  http://localhost:3000/auth/callback
                           https://shalem.de/auth/callback
```

Ohne korrekte Redirect-URLs lehnt jeder Provider den Callback ab.

## 2 · Provider · Mainstream

### Google

1. **Google Cloud Console** → *APIs & Services → Credentials* → *Create OAuth 2.0 Client ID*
2. Type: *Web application*
3. Authorized redirect URI: `https://gpchwlqeqejxvynewjns.supabase.co/auth/v1/callback`
4. Client-ID + Secret kopieren
5. Supabase → *Authentication → Providers → Google* → einschalten, ID + Secret eintragen

### Apple

1. **Apple Developer** → *Certificates, IDs & Profiles → Identifiers* → neue Service-ID
2. *Sign in with Apple* aktivieren, Domains: `gpchwlqeqejxvynewjns.supabase.co`
3. Return-URL: `https://gpchwlqeqejxvynewjns.supabase.co/auth/v1/callback`
4. Apple-Key (`.p8`) erzeugen, Apple-Team-ID + Key-ID + Service-ID notieren
5. Supabase → *Apple Provider* → alle vier Werte eintragen

### Microsoft (Azure)

1. **Azure Portal** → *App Registrations → New Registration*
2. Redirect URI: `https://gpchwlqeqejxvynewjns.supabase.co/auth/v1/callback`
3. Supported account types: *Accounts in any organizational directory and personal Microsoft accounts*
4. Client-ID kopieren, dann *Certificates & Secrets* → neuer Client-Secret
5. Supabase → *Azure Provider* → einschalten, ID + Secret eintragen

### GitHub

1. **GitHub** → *Settings → Developer settings → OAuth Apps → New OAuth App*
2. Authorization callback URL: `https://gpchwlqeqejxvynewjns.supabase.co/auth/v1/callback`
3. Client-ID kopieren, *Generate new client secret*
4. Supabase → *GitHub Provider* → einschalten, beides eintragen

### Email + Passwort

Standardmässig aktiv. In *Authentication → Providers → Email* prüfen ob:
- *Enable Email Provider* ✓
- *Confirm Email* ✓ (Doppel-Opt-In = DSGVO-konform)
- SMTP-Server: in *Settings → SMTP* eigenen Versender setzen
  (Hostinger Mail-Server oder Postmark/SendGrid). Sonst bekommst du
  pro Tag nur 30 Test-Mails.

## 3 · Provider · Echtheits-Zertifizierung (Phase 2)

Diese sind in Supabase nicht direkt als OAuth-Provider verfügbar —
sie kommen über Custom-OAuth oder spezielle Integrationen.

### Verimi (verimi.de)

- Deutsche ID-Plattform mit Personalausweis-NFC-Read-Out
- **Aktivierung:** B2B-Vertrag erforderlich (Verimi Business)
- **Integration:** OAuth 2.0 Custom-Provider in Supabase
  (*Authentication → Providers → Generic OAuth*)
- **Endpoint-Quellen:**
  - Authorization: `https://verimi.de/oauth2/auth`
  - Token: `https://verimi.de/oauth2/token`
  - User-Info: `https://verimi.de/oauth2/userinfo`
- **Datenschutz:** Verimi liefert verifizierte Felder (Vorname, Nachname,
  Geburtsdatum, Adresse) als signiertes JWT — direkt in `profiles` schreiben.

### yes® (yes.com)

- Bank-Login als Identitäts-Provider · KYC durch deine Hausbank
- **Aktivierung:** yes-Vertrag + Test-Sandbox unter `dev.yes.com`
- **Integration:** OpenID-Connect — Supabase Generic-OIDC
- **Datenschutz:** Bank gibt Identitäts-Bestätigung + Adresse weiter,
  keine Kontodaten

### Gesundheits-ID (gematik)

- Für Pflegekräfte mit elektronischem Heilberufsausweis (eHBA)
- **Aktivierung:** SMC-B-Karte + TI-Konnektor (kommt mit dem
  geplanten gematik-TI-Konnektor-Stub aus der Roadmap)
- **Integration:** TI-Föderationsdienst-OIDC (Spezifikations-Doc bei
  gematik.de)
- **Vertrauen:** höchstes Level — ärztliche Approbation digital signiert

## 4 · Storage-Bucket für Verifizierungs-Uploads

```sql
-- In Supabase SQL-Editor ausführen
insert into storage.buckets (id, name, public)
values ('verifizierungen', 'verifizierungen', false);

create policy "user_uploads_own_files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verifizierungen'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "user_reads_own_files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verifizierungen'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

Datei-Pfad-Konvention: `<user_id>/<rolle>/<feldname>.pdf`

Beispiel: `8f7a-…uuid…/pflege/berufsurkunde.pdf`

## 5 · Was die App noch nicht macht (Phase-2-TODO)

Die UI-Story steht — was fehlt für funktionalen Auth-Flow:

- [ ] `lib/auth/client.ts` — `@supabase/supabase-js` mit `signInWithOAuth`/`signUp`/`signOut`
- [ ] `app/auth/callback/route.ts` — OAuth-Code-Exchange-Handler (Server-Action)
- [ ] `app/registrieren/start/page.tsx` — Provider-Login-Trigger (heute zeigt nur die UI)
- [ ] `app/anmelden/page.tsx` — Login-Page (parallel zu /registrieren)
- [ ] **Datei-Upload** in `/registrieren/verifizieren` an Supabase Storage
- [ ] **Insert** in `verifications`-Tabelle mit Status `eingereicht`
- [ ] `/admin/verifikationen` — Pruefer-Page für Service-Role
- [ ] **Session-Aware-Cockpits** — bestehende Cockpits lesen `auth.uid()`
  statt `CURRENT_USER_ID`-Konstante (Demo-Persona-Switcher bleibt als
  Fallback)
- [ ] **Middleware** für geschützte Routen — wenn nicht eingeloggt + Profil
  unverifiziert, Redirect auf `/registrieren/verifizieren`

## 6 · Tabellen-Übersicht (zur Referenz)

| Tabelle | Zweck | RLS |
|---|---|---|
| `auth.users` | Supabase-eigene User-Tabelle | von Supabase verwaltet |
| `profiles` | App-spezifische User-Felder | self-read + self-update |
| `user_roles` | Multi-Role je User | self-read |
| `verifications` | Echtheits-Nachweise | self-read + self-insert (status=eingereicht) |

Service-Role-Key wird benötigt um:
- Verifications auf "verifiziert"/"abgelehnt" zu setzen (durch Pruefer)
- Cross-User-Reads (z.B. Care-Team-Listen für Pflegekräfte)

## 7 · Hostinger-Deploy-Hinweis

Hostinger injiziert beim DB-Connect:
- `SUPABASE_URL` (server-only, ohne NEXT_PUBLIC-Prefix)
- `SUPABASE_ANON_KEY`

Für Auth zusätzlich nötig (manuell in hPanel → Node.js → Environment Variables):
- `SUPABASE_SERVICE_ROLE_KEY` (für Server-Actions, die Admin-Ops machen)

Die UI-Story zeigt schon **welche Provider geplant sind** — sobald du
einen aktivierst und das Häkchen in `lib/auth/providers.ts` von
`vorhanden: "geplant"` auf `"live"` setzt, taucht der Provider in der
Verfügbar-Sektion der `/registrieren`-Seite auf.
