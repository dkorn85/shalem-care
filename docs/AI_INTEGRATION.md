# KI-Integration für die Pflegedokumentation

> Phase 1: Server-side Aufrufe, kein Streaming. Phase 2: Streaming via Server-Sent Events.

## Was die KI macht

**`structureObservation()`** — verwandelt eine rohe Pflegekraft-Beobachtung ("Frau Reinhardt heute 14:30 Uhr aus Sessel ohne Hilfe aufgestanden, 30m bis Speisesaal") in einen strukturierten, MDK-prüffesten Eintrag mit:

- Inhalts-Strukturierung (Zeit, Aktivität, Werte, Reaktion)
- SIS-Themenfeld-Klassifizierung (eines von 6)
- Risiko-Marker-Erkennung (Sturz, Dekubitus, Mangelernährung, Aspiration, Schmerz, Verwirrtheit, Depression, Exsikkose, ...)
- Abweichungs-Erkennung (Berichteblatt-Pflicht ja/nein)
- Maßnahmen-Vorschläge nach DNQP-Expertenstandards

**`suggestMeasures()`** — zu einem bestehenden Doku-Eintrag konkrete, MDK-prüfungsfähige Maßnahmen vorschlagen.

Beide arbeiten auf einem abstrakten `AIProvider`-Interface. Die Logik kennt SIS, ICF, Hilfeplan-Standards und die jeweiligen Berufs-Kontexte.

## Provider — wer macht den Job

### Empfehlung 1: DeepSeek (kostengünstig, für Demo + Entwicklung)

**Vorteile**
- Sehr günstig: ~0,27 USD pro 1 Mio Input-Tokens, ~1,10 USD pro 1 Mio Output-Tokens
- Mit Cache-Hit-Discount fällt der Input-Preis auf ~0,07 USD
- OpenAI-kompatible API — Drop-in für alles was OpenAI-Format spricht
- Sehr gute Performance bei Deutsch und strukturierten Outputs (JSON-Mode)
- Ein typischer Doku-Vorschlag (1500 input + 800 output Tokens) kostet ca. **0,1 Cent**

**Nachteile (DSGVO-relevant!)**
- Standard-Endpoint hostet außerhalb der EU/in China
- **Nicht geeignet für echte Patientendaten ohne Datenverarbeitungsvertrag (Art. 28 DSGVO) und Drittland-Garantien (Art. 46)**
- Für Demo, Pilot mit pseudonymisierten Daten oder reine Entwicklung okay
- Für Produktion mit Klarnamen → siehe DSGVO-Alternativen unten

**Setup**
```bash
# .env
DEEPSEEK_API_KEY=sk-...
SHALEM_AI_PROVIDER=deepseek          # optional, default ist auto
SHALEM_AI_MODEL=deepseek-chat        # optional
```

API-Key bekommst du auf https://platform.deepseek.com/ — Registrierung mit E-Mail, Guthaben aufladen via Stripe oder Crypto.

### Empfehlung 2: Mistral Large via EU-Endpoint (DSGVO-konform für Produktion)

**Vorteile**
- Französischer Anbieter, EU-DSGVO-konform
- Endpoint in Paris/Frankfurt
- Sehr gute Performance bei deutscher Doku
- AVV (Auftragsverarbeitungsvertrag) verfügbar

**Nachteile**
- Teurer: ~3 USD/1M Input, ~9 USD/1M Output für Mistral Large
- Cheap-Variant Mistral Small: ~0,5 USD/1M Input, ~1,5 USD/1M Output

**Setup-Pfad**
- Provider-Implementation analog zu `lib/ai/deepseek.ts` als `lib/ai/mistral.ts` ergänzen
- Endpoint: `https://api.mistral.ai/v1/chat/completions`
- Models: `mistral-large-latest`, `mistral-small-latest`

### Empfehlung 3: Anthropic Claude Haiku 4.5 (Premium, hervorragend für Strukturierung)

**Vorteile**
- Beste Qualität bei strukturierter Doku, sehr verlässlich bei JSON-Mode
- AWS Bedrock Frankfurt verfügbar (DSGVO)
- AVV via AWS

**Nachteile**
- Deutlich teurer: ~1 USD/1M Input, ~5 USD/1M Output
- Pro Doku-Vorschlag etwa 0,4–0,6 Cent

### Empfehlung 4: Selbst gehostet — Llama 3.3 70B oder Qwen 2.5 72B

**Vorteile**
- Volle Datensouveränität — Daten verlassen den Server nie
- Einmalige Hardware-Investition statt laufender Kosten
- Open-Source, kein Vendor-Lock-in

**Nachteile**
- Hardware: ~24 GB VRAM minimum (1× A6000 oder 2× 3090) für quantisiertes 70B
- Laufende Strom-/Wartungskosten
- Performance leicht unter den Cloud-Modellen

**Setup-Pfad**
- vLLM mit OpenAI-kompatibler API
- Provider zeigt auf den lokalen Endpoint statt DeepSeek
- `SHALEM_AI_PROVIDER=local` plus eigene Provider-Implementation

### Empfehlung 5: Aleph Alpha Luminous (deutscher Anbieter)

**Vorteile**
- Komplett in Deutschland gehostet
- Spezialisiert auf europäische Sprachen
- AVV plus zusätzliche Compliance-Zusagen

**Nachteile**
- Teurer als die internationalen Anbieter
- Kleineres Modell-Ökosystem

## Wieviel kostet das in der Praxis

Annahme: eine Pflegekraft macht im Schnitt 8 Doku-Einträge pro Schicht, davon 50 % KI-unterstützt. Das sind 4 KI-Calls pro Schicht. Eine Einrichtung mit 30 Pflegekräften, 22 Arbeitstage:

| Anbieter | Pro Call | Pro Schicht (4) | Pro Mitarbeiter/Monat | Pro Einrichtung/Monat (30 PK) |
|---|---|---|---|---|
| DeepSeek | 0,1 ct | 0,4 ct | 9 ct | **2,64 €** |
| Mistral Small | 0,4 ct | 1,6 ct | 35 ct | **10,56 €** |
| Mistral Large | 1,8 ct | 7,2 ct | 1,58 € | **47,52 €** |
| Claude Haiku | 0,5 ct | 2,0 ct | 44 ct | **13,20 €** |
| Self-hosted | 0 € | 0 € | 0 € | **Hardware ~3.000 €** einmalig + Strom |

Selbst der teuerste API-Anbieter bleibt unter dem, was eine einzige Stunde manuelle Doku-Reinschrift kosten würde.

## DSGVO — was du nicht ignorieren darfst

Pflegedaten sind **besondere Kategorien personenbezogener Daten** nach Art. 9 DSGVO. Bei jedem KI-Call gehen Inhalte zum Provider, daher:

1. **AVV abschließen** mit dem KI-Anbieter (Auftragsverarbeitung Art. 28). Anbieter ohne AVV sind tabu.
2. **EU-Hosting bevorzugen** oder Drittland-Garantien (Standardvertragsklauseln + TIA).
3. **Zweckbindung dokumentieren** — KI nur für Doku-Strukturierung, nicht für Re-Identifikation oder andere Zwecke.
4. **Pseudonymisierung wo möglich** — der Klient-Name kann durch ein Token ersetzt werden vor dem KI-Call. Phase 2 implementiert das automatisch.
5. **Audit-Log** — jeder KI-Call wird protokolliert (Provider, Model, Tokens, Inhalt). Shalem Care speichert `aiSuggestionRaw` und `aiProvider` zu jedem KI-unterstützten Eintrag.
6. **Mitglieder-Zustimmung** — Klienten und Pflegekräfte werden über die KI-Nutzung informiert (siehe `/datenschutz`).
7. **Recht auf menschliche Entscheidung** Art. 22 DSGVO — die KI **schlägt vor**, der Mensch **entscheidet**. Das ist bei Shalem Care von Anfang an so gebaut: KI-Output ist editierbar, Signatur erfolgt durch die Pflegekraft.

## Mock-Provider — die App läuft auch ohne API-Key

Wenn `DEEPSEEK_API_KEY` nicht gesetzt ist, nutzt die App automatisch den `MockProvider`. Der gibt deterministisch eingebettete Demo-Antworten — gut genug für UI-Demo und Entwicklung, aber natürlich keine echte Strukturierung.

## Was im Code passiert — Architektur

```
[ Pflegekraft schreibt rohe Beobachtung ]
              ↓
   AiDokuAssistant (Client Component)
              ↓
  aiStructureObservation (Server Action)
              ↓
   structureObservation (lib/ai/doku-ai.ts)
              ↓
       getAIProvider()  →  DeepSeek | Mistral | Mock
              ↓
        AIProvider.generate()
              ↓
   ↳ Response: { text, json, tokens, cost }
              ↓
       Validierung gegen SIS-Schema
              ↓
[ Pflegekraft sieht & editiert Vorschlag ]
              ↓
        saveDokuEntry  →  Doku-Store + Audit-Log
              ↓
[ MDK-prüffest, signiert, 10 Jahre aufbewahrt ]
```

Provider-Implementations sind alle gegen `AIProvider`-Interface. Ein neuer Anbieter hinzuzufügen sind ~50 Zeilen Code.

## Switch des Providers

```bash
# Default (Mock wenn kein Key)
unset DEEPSEEK_API_KEY

# DeepSeek
export DEEPSEEK_API_KEY=sk-...

# Künftig: Mistral
export MISTRAL_API_KEY=...
export SHALEM_AI_PROVIDER=mistral

# Künftig: Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
export SHALEM_AI_PROVIDER=anthropic

# Self-hosted (zeigt auf lokalen vLLM)
export SHALEM_AI_PROVIDER=local
export SHALEM_AI_ENDPOINT=http://localhost:8000/v1
```

## Was als Nächstes zu bauen ist (Phase 2)

1. **Streaming** via Server-Sent Events — Pflegekraft sieht Antwort in Echtzeit erscheinen
2. **PII-Redaktion** automatisch vor jedem KI-Call (Klient-Name → `<KLIENT_1>`, Adressen weg)
3. **Provider-Failover** — wenn DeepSeek antwortet nicht, automatisch zu Backup-Provider
4. **Rate-Limiting** pro Mitarbeiter — Schutz gegen Kostenexplosion
5. **FHIR-Persistierung** — Doku-Einträge als FHIR `Composition` mit verlinkten `Observation`-Resources
6. **MDK-Export** — automatischer Export einer ganzen Klient-Doku als PDF mit Signaturen, Zeitstempel, Audit-Trail
7. **Sprache-zu-Text** — direkt diktieren via Web Speech API, dann KI-Strukturierung
8. **ICF-Code-Lookup** für Heilerziehung mit autocomplete

## Empfehlung für Pilot-Start

**Kombi: Mistral Small (EU) für reguläre Doku + DeepSeek für Mock/Demo-Umgebung.**

Mistral Small reicht für die Strukturierung mehr als aus, kostet ~10 € im Monat für eine 30-Personen-Einrichtung, und ist DSGVO-mäßig sauber mit AVV. DeepSeek bleibt für Entwicklungsumgebung — dort fließen ja eh nur Demo-Daten.

Wenn der Pilot läuft und die Daten-Volumen klar sind, lohnt sich der Switch auf Self-hosted Llama oder Qwen — ab einer bestimmten Größe ist das günstiger als jede API.
