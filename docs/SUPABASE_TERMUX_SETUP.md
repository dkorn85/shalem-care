# Supabase-Migrations vom Tablet via Termux

Schritt-für-Schritt, wenn du die SQL-Migrations vom Smartphone/Tablet
direkt gegen die Supabase-DB ausführen willst.

---

## 1 · Termux installieren

Falls noch nicht da: **F-Droid** (nicht Play Store!) →
[Termux](https://f-droid.org/en/packages/com.termux/) — die Play-Store-Version
ist veraltet und broken.

Dazu wenn du SSH zwischen Tablet ↔ Server brauchst:
**Termux:Widget** (Schnellzugriff über Home-Bildschirm).

---

## 2 · Pakete installieren

```bash
pkg update
pkg install postgresql git nano
```

`postgresql` bringt den `psql`-Client mit (~25 MB) — nicht den Server.
`git` brauchst du, um das Repo zu pullen. `nano` als kleiner Editor
(oder `vim` wenn du das magst).

---

## 3 · Repo holen

```bash
cd ~
git clone https://github.com/dkorn85/shalem-care.git
cd shalem-care
```

Bei Updates später:

```bash
cd ~/shalem-care
git pull
```

---

## 4 · Connection-String holen

Im Browser (auf Tablet egal welcher):

1. <https://app.supabase.com> → Projekt **gpchwlqeqejxvynewjns** wählen
2. Linke Seitenleiste → **Project Settings** (Zahnrad ganz unten)
3. **Database** → Sektion **Connection string**
4. Tab **Transaction** wählen (Port 6543, das ist der Pooler — verträgt
   sich am besten mit Tablet-Connections die manchmal kurz droppen)
5. **Connection string** kopieren — sieht so aus:
   ```
   postgresql://postgres.gpchwlqeqejxvynewjns:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. `[YOUR-PASSWORD]` durch dein DB-Passwort ersetzen — falls vergessen:
   im selben Bereich „Reset database password" klicken (vorsichtig,
   bricht alle anderen DB-Verbindungen)

---

## 5 · ENV-Datei sicher anlegen

In Termux:

```bash
nano ~/.shalem-care.env
```

Inhalt:

```bash
export SHALEM_PG_URL="postgresql://postgres.gpchwlqeqejxvynewjns:DEIN-PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

Speichern: `Strg+O`, `Enter`, `Strg+X`.

Danach Rechte einschränken (nur du darfst die Datei lesen):

```bash
chmod 600 ~/.shalem-care.env
```

Beim Termux-Start automatisch laden:

```bash
echo 'source ~/.shalem-care.env' >> ~/.bashrc
source ~/.bashrc
```

---

## 6 · Verbindung testen

```bash
cd ~/shalem-care
./scripts/migrate.sh --status
```

Wenn das funktioniert, siehst du eine Liste der existierenden Tabellen
im `public`-Schema + die Liste der Migration-Files im Repo.

---

## 7 · Migrationen ausführen

### Eine bestimmte Migration

```bash
./scripts/migrate.sh 0001
```

Das Script findet `supabase/migrations/0001_klient_wunsch.sql`, führt
es in einer Transaktion aus, bricht sauber ab wenn ein einzelner
Befehl scheitert (`ON_ERROR_STOP=1`).

### Alle Migrationen am Stück

```bash
./scripts/migrate.sh
```

Zeigt erst die Liste, fragt nach Bestätigung (`j` zum Fortfahren).

### Status prüfen

```bash
./scripts/migrate.sh --status
```

Zeigt welche Tabellen schon im `public`-Schema sind + ob RLS aktiv.

---

## 8 · Häufige Fehler

### `connection to server failed: SCRAM authentication failed`

→ DB-Passwort falsch. Im Dashboard nochmal kopieren oder zurücksetzen.

### `permission denied for schema public`

→ Du bist nicht als `postgres`-User verbunden. Connection-String
nochmal aus dem Dashboard ziehen — das Format mit
`postgres.<projekt-ref>` ist wichtig.

### `relation "vollmacht" does not exist`

→ Migration 0004 läuft, aber 0001-0003 noch nicht. Reihenfolge halten:

```bash
./scripts/migrate.sh 0001
./scripts/migrate.sh 0002
./scripts/migrate.sh 0003
./scripts/migrate.sh 0004
# usw.
```

Oder einfach `./scripts/migrate.sh` ohne Argument für alle in Reihenfolge.

### `policy already exists`

→ Sollte nicht passieren, weil alle Migrations `drop policy if exists`
voranstellen. Falls doch: einfach nochmal laufen lassen, idempotent.

---

## 9 · Tablet-Tipps

**Bluetooth-Tastatur** macht Termux schmerzfrei nutzbar — sonst tippst
du dir ein psql-Command auf der Bildschirm-Tastatur den Wolf.

**Termux:Widget** als Home-Screen-Shortcut: ein Tap und du landest
direkt in einem Termux-Tab mit `cd ~/shalem-care` schon ausgeführt.
Konfig in `~/.shortcuts/` ablegen.

**Multitasking**: Browser oben (Dashboard), Termux unten (psql) —
auf den meisten Tablets als Split-Screen verfügbar.

---

## 10 · Weiter ohne psql?

Wenn du `psql` partout nicht installieren willst, ist die
**Dashboard-Variante** (SQL-Editor → New query → Inhalt einfügen → Run)
weiterhin der einfache Weg. `./scripts/migrate.sh` ist nur die
Bequemlichkeits-Variante für die, die viel auf der Kommandozeile leben.
