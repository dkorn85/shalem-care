# Pay-Layer — Setup &amp; Usage

## Konzept

Mehrparteien-Zahlflüsse über Stripe Connect. Drei Akteure:

1. **Pflegekraft** als **Connect-Account** (Stripe Express, vereinfachtes Onboarding, Auszahlung auf Bankkonto)
2. **Träger oder Klient** als **Customer** (Zahler)
3. **Plattform-Genossenschaft** zieht Cut über `application_fee_amount`

Beim Bezahlen einer Schicht erstellt die Plattform einen `PaymentIntent` mit `transfer_data.destination = acct_xxx` (Pflegekraft) und `application_fee_amount = X` (Cut). Stripe regelt die Aufteilung automatisch.

## Modi

| Modus | Wann | Voraussetzung |
|-------|------|---------------|
| `mock` | Lokales Dev, Demo, Pitch | nichts |
| `live` | Pilot, Production | `STRIPE_SECRET_KEY` gesetzt |

Mock-Modus simuliert Stripe-Calls mit deterministischen IDs (`acct_xxx`, `cus_xxx`, `pi_xxx`). Du siehst die ganze UI-Wirkung ohne echtes Stripe-Konto. Sobald `STRIPE_SECRET_KEY` gesetzt ist, gehen die Calls an die echte Stripe-API (Test-Mode wenn `sk_test_xxx`).

## Setup für Live-Modus

```bash
# 1. Stripe Account anlegen (https://stripe.com)
#    - Test-Mode-Keys finden unter: Developers → API keys
#    - Connect aktivieren: Settings → Connect → Configuration

# 2. .env anpassen:
STRIPE_SECRET_KEY=sk_test_xxx              # Test-Key zum Start
STRIPE_PUBLISHABLE_KEY=pk_test_xxx          # für Frontend (später)
STRIPE_WEBHOOK_SECRET=whsec_xxx             # nach Webhook-Setup
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # für Onboarding-Return-URLs

# 3. Webhook konfigurieren
#    Stripe Dashboard → Developers → Webhooks → Add endpoint
#    URL: http://<dein-host>/api/stripe-webhook
#    Events: payment_intent.succeeded, payment_intent.payment_failed, account.updated
#    Signing secret kopieren in STRIPE_WEBHOOK_SECRET

# 4. Stripe-SDK installieren
cd apps/web
npm install stripe
```

## Usage in der App

1. **Träger onboarden**: `/admin/zahlungen` → Button "Träger onboarden". Erstellt Stripe-Customer für Pulmologie 3B.
2. **Pflegekraft onboarden**: pro Person Button "Onboarden". Im Live-Modus öffnet sich Stripe-Hosted-Onboarding (Bank, ID-Verify); im Mock-Modus wird sofort als "active" gesetzt.
3. **Demo-Zahlung**: pro aktive Pflegekraft Button "Demo-Zahlung 210 €". Erstellt PaymentIntent mit 4 % Plattform-Cut.
4. **Status-Prüfung**: Button "Status prüfen" lädt aktuelle Stripe-Account-Daten neu (für Live-Modus relevant, weil Onboarding asynchron ist).

## Berechnung Plattform-Cut

```
amountCents = 21000  // 210,00 €
platformFeeBps = 400  // 4 %
platformFeeCents = round(amountCents * platformFeeBps / 10000)  // = 840 = 8,40 €
payoutCents = amountCents - platformFeeCents  // = 20160 = 201,60 €
```

In Stripe-Begriffen:
- `application_fee_amount: 840`  (geht an Plattform)
- `transfer_data.destination: acct_xxx`  (rest geht an Pflegekraft)

## Refund

`refundShiftPayment({ paymentId, reason })` ruft `stripe.refunds.create({ payment_intent })`. Stripe nimmt den Cut anteilig zurück (sowohl Pflegekraft als auch Plattform geben proportional zurück).

## Audit-Trail

Die Plattform speichert in der `payments`-Map:
- shiftId
- payerId, practitionerId
- Brutto / Cut / Netto in Cent
- Stripe-PaymentIntent-ID (für Reconciliation)
- Status-Übergänge per Webhook

In Phase 2 soll das in eine eigene FHIR-Resource (`Invoice` + `PaymentReconciliation`) ausgelagert werden, damit es im selben FHIR-Server liegt wie die Schichten und Pflegekraft-Daten.

## Rechtliche Hinweise

**Wichtig:** Stripe DE/EU operiert unter Stripe Payments Europe Ltd. (Irland). Für Mehrparteien-Auszahlungen mit Geschäftspartnern in Deutschland brauchst du eine PSD2-konforme Konstruktion. Stripe Connect ist dafür ausgelegt — aber:

- Pflegekräfte als Connect-Account müssen sich Stripe-seitig identifizieren (KYC-Flow).
- Die Plattform-Genossenschaft braucht eine **Lizenzierung als Zahlungsdienstleister** oder einen **Banking-Partner** für regulatorische Sicherheit. Für Phase 1 reicht Stripe Connect Express + Genossenschaft als Stripe-Customer für die Cut-Einbehaltung. Für Phase 2 ist ein Gespräch mit Solaris SE oder Mangopay (alternative EU-Anbieter) sinnvoll.
- Die **Mangopay-Alternative** ist EU-nativ, BaFin-lizenziert, und für Marktplatz-Konstruktionen ausgelegt. Bei DSGVO-Strenge ein besseres Match. Stripe ist aber praktischer für PoC-Speed.

## Nächste Schritte (Phase 2)

- [ ] Stripe-SDK echt einbauen (`npm install stripe`)
- [ ] Frontend für Pflegekraft: eigene Stripe-Express-Dashboard-Einbindung
- [ ] Webhook-Verifikation getestet
- [ ] Persistenz der Pay-Daten in Medplum (Invoice / PaymentReconciliation FHIR-Resources)
- [ ] Steuer-Reporting: Monats-PDF generieren mit Brutto / Cut / Netto / geschätzte Steuer-Rückstellung
- [ ] Connect Express → Connect Custom Migration (mehr Kontrolle über Onboarding-UX)
- [ ] Mangopay-Alternative-Pfad für regulatorisch sensible Setups
