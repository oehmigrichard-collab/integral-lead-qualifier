# Integral Services — Lead-Qualifizierungsflow V1
### Software-Ready Sales Script mit Einwandbehandlung
**Stand:** 01.04.2026 | **Quelle:** Tax Sales Playbook V2, ICP, Pricing-Logik V2

---

## FLOW-ARCHITEKTUR — ÜBERSICHT

```
PHASE 1: Warm-Up & Trigger Discovery
    ↓
PHASE 2: Hard Exclusion Gate (Rechtsform + Geschäftsmodell)
    ↓ PASS / ❌ DISQUALIFY
PHASE 3: Steuerliche Komplexität Gate
    ↓ PASS / ❌ DISQUALIFY
PHASE 4: Situationsanalyse (Vorberater / Neugründung)
    ↓
PHASE 5: Service Needs & Sizing
    ↓
PHASE 6: Pricing Preview & Value Framing
    ↓
PHASE 7: Next Steps & Close
```

---

## COMPLIANCE-LAYER (gilt für ALLE Phasen)

### Pflicht-Disclaimer (muss 1x pro Gespräch platziert werden, spätestens Phase 6)

> „Steuerliche Leistungen wie Buchhaltung, Jahresabschlüsse und Steuererklärungen werden ausschließlich durch die **Integral Tax GmbH Wirtschaftsprüfungsgesellschaft** erbracht. Wir — Integral Services — stellen die technische Plattform bereit und verbinden dich mit lizenzierten Steuerberatern."

### Verbotene Formulierungen (Global Blacklist)

| ❌ Nie sagen | ✅ Stattdessen |
|---|---|
| „Wir beraten dich steuerlich" | „Über unsere Plattform hast du Zugang zu steuerlichen Dienstleistungen" |
| „Wir erstellen deinen Jahresabschluss" | „Der Jahresabschluss wird durch die Integral Tax GmbH WPG erstellt" |
| „Wir sind dein Steuerteam" | „Dein Steuerberater ist über die Plattform erreichbar" |
| „Wir sind günstiger als klassische Kanzleien" | „Wir kombinieren moderne Technologie mit qualifizierter Beratung" |
| „Traditionelle Steuerberater sind veraltet" | „Unser Fokus liegt auf Qualität, Transparenz und digitaler Effizienz" |
| „Du bist bei uns steuerlich in guten Händen" | „Die Integral Tax GmbH WPG betreut dich steuerlich auf unserer Plattform" |
| „Billigere Alternative zur Kanzlei" | „All-in-One: Plattform + lizenzierter Steuerberater, digital und effizient" |

### Rollenverteilung (muss klar sein)

| Rolle | Leistung |
|---|---|
| **Integral Services GmbH** | Plattform + Operations + Zugang zum Berater |
| **Integral Tax GmbH WPG** | Steuerberatung, Buchhaltung, Jahresabschluss, Steuererklärung |

---

## PHASE 1: WARM-UP & TRIGGER DISCOVERY

**Ziel:** Rapport aufbauen, Trigger Event identifizieren, Persona-Segment einordnen.

**Dauer:** 3–5 Minuten

### Gesprächseröffnung

> „Schön, dass wir uns sprechen! Bevor ich dir zeige, wie Integral funktioniert, würde ich gerne kurz verstehen, wo du gerade stehst und was dich zu uns geführt hat. So kann ich dir gezielt zeigen, was für dich relevant ist."

### Kernfragen Phase 1

| # | Frage | HubSpot Property | Typ |
|---|---|---|---|
| 1.1 | „Was hat dich dazu gebracht, nach einer Lösung wie Integral zu schauen?" | `trigger_event` | Single-Select |
| 1.2 | „Erzähl mir kurz: Was macht ihr genau?" | *Persona-Einordnung* | Freitext |
| 1.3 | „In welcher Phase befindet ihr euch gerade — frisch gegründet, im Wachstum, oder schon etabliert?" | *Persona-Segment* | Freitext |

### Trigger-Event Mapping → HubSpot

| Antwort Lead | HubSpot-Wert `trigger_event` |
|---|---|
| Neugründung, gerade erst gegründet, starten gerade | `Company Foundation` |
| Steuerberater wechseln, unzufrieden mit aktuellem Berater | `Tax Advisor Change` |
| Umstrukturierung, Holding aufbauen | `Company Restructuring` |
| Spezielle Steuerfragen, komplexe Situation | `Specific Tax Need` |
| Alles aus einer Hand, eine Lösung für alles | `Full Service/ All-in-One` |

### Persona-Einordnung (intern, nicht kommunizieren)

| Signal | Persona-Segment | Passende USPs für Pitch |
|---|---|---|
| Erstgründer, wenig Finanzwissen, will „einfach starten" | **First-Time Founder** | All-in-One, digitale Plattform, persönliche Beratung |
| <10 MA, managt Finanzen selbst, Tools-Chaos | **Kleine Unternehmen — Founder/MD** | Persönliche Beratung, Compliance leicht gemacht, integrierte Plattform |
| 10+ MA, CFO/Buchhalter, will Prozesse professionalisieren | **Größere Unternehmen** | Skalierbare Lösung, Compliance, individuelle Steuerberatung |

### Einwandbehandlung Phase 1

| Einwand | Antwort |
|---|---|
| „Ich will erst mal nur die Preise wissen." | „Verstehe ich total. Damit ich dir ein passendes Angebot machen kann, brauche ich kurz ein paar Infos zu euch — dann bekommst du eine transparente Übersicht mit allen Kosten. Das dauert nur 5 Minuten." |
| „Ich habe eigentlich keine Zeit für ein langes Gespräch." | „Kein Problem, wir halten es kurz. Ich stelle dir ein paar gezielte Fragen, damit ich dir danach direkt ein konkretes Angebot schicken kann." |
| „Warum sollte ich von meinem Steuerberater wechseln?" | „Das ist eine gute Frage. Viele unserer Mandanten kamen zu uns, weil sie sich eine vollständig digitale Lösung gewünscht haben — alles auf einer Plattform, mit schnellem Support. Lass uns kurz schauen, ob das für euch Sinn ergibt." |

---

## PHASE 2: HARD EXCLUSION GATE — Rechtsform & Geschäftsmodell

**Ziel:** Harte Ausschlusskriterien prüfen. Bei Treffer: freundlich disqualifizieren.

**Dauer:** 3–4 Minuten

### Kernfragen Phase 2

| # | Frage | HubSpot Property | Ausschluss-Logik |
|---|---|---|---|
| 2.1 | „Welche Rechtsform hat euer Unternehmen — GmbH, UG, oder etwas anderes?" | `legal_entity_type` | ❌ Alles außer GmbH, UG, GmbH i.G., UG i.G. |
| 2.2 | „Seid ihr bereits im Handelsregister eingetragen?" | `commercial_register_number` | ⚠️ Wenn Nein + kein Gesellschaftsvertrag → `Not founded UG/GmbH` → Deal bleibt in QL |
| 2.3 | „Ist euer Geschäft rein digital, oder habt ihr auch ein physisches Ladengeschäft oder Kassensystem?" | `business-exclusions` | ❌ POS → `pos` |
| 2.4 | „Gibt es bei euch Bargeldtransaktionen?" | `business-exclusions` | ❌ Bargeld → Hard Exclude |
| 2.5 | „Nutzt ihr E-Commerce-Plattformen wie Shopify, Amazon oder Etsy für die Rechnungsstellung?" | `business-exclusions` | ❌ E-Commerce → Hard Exclude |
| 2.6 | „Arbeitet ihr mit Factoring — also Forderungsabtretung?" | `business-exclusions` | ❌ Factoring → Hard Exclude |

### Decision Logic Phase 2

```
IF rechtsform NOT IN [GmbH, UG, GmbH i.G., UG i.G.]:
    → DISQUALIFY (Reason: "wrong_entity_type")
    → business-exclusions = "wrong_entity_type"

IF bargeld == true:
    → DISQUALIFY (Reason: "cash_business")

IF pos == true:
    → DISQUALIFY (Reason: "pos")

IF ecommerce == true:
    → DISQUALIFY (Reason: "ecommerce")

IF factoring == true:
    → DISQUALIFY (Reason: "factoring")

IF hr_eingetragen == false AND gesellschaftsvertrag == false:
    → FLAG: "Not founded UG/GmbH"
    → Deal bleibt in Qualified Lead, KEIN automatisches Angebot
    → legal_entity_type = "Not founded UG/ GmbH"

IF hr_eingetragen == false AND gesellschaftsvertrag == true:
    → legal_entity_type = "GmbH i.G." / "UG i.G."
    → CONTINUE

IF hr_eingetragen == true:
    → legal_entity_type = "GmbH" / "UG"
    → CONTINUE
```

### Compliant Disqualification Script

> „Danke für deine Offenheit. Aktuell haben wir uns auf rein digitale Kapitalgesellschaften spezialisiert — [Rechtsform/Bargeld/E-Commerce] können wir momentan leider nicht optimal abbilden. Ich will ehrlich mit dir sein, statt dir etwas zu versprechen, was nicht zu 100% funktioniert. Wenn sich das bei euch in Zukunft ändert, melde dich gerne jederzeit wieder."

### Einwandbehandlung Phase 2

| Einwand | Antwort |
|---|---|
| „Wir haben nur ganz wenig Bargeld." | „Das verstehe ich — leider ist das für uns ein hartes Kriterium, weil es die buchhalterische Komplexität massiv erhöht. Sobald euer Geschäft komplett digital läuft, passt ihr perfekt zu uns." |
| „Wir planen die GmbH erst zu gründen." | „Super, dann bist du zum perfekten Zeitpunkt hier. Sobald der Notartermin steht und der Gesellschaftsvertrag geschlossen ist, können wir direkt loslegen — inklusive steuerlicher Erfassung und Eröffnungsbilanz." |
| „Wir sind eine GbR, wollen aber umwandeln." | „Gut zu wissen. Gesellschaftsumwandlungen begleiten wir aktuell nicht direkt — aber sobald die GmbH steht, sind wir sofort für euch da. Soll ich dir einen Reminder setzen?" |

---

## PHASE 3: STEUERLICHE KOMPLEXITÄT GATE

**Ziel:** Steuerliche Sonderfälle identifizieren, die ein Ausschlusskriterium darstellen.

**Dauer:** 2–3 Minuten

### Kernfragen Phase 3

| # | Frage | Ausschluss | HubSpot |
|---|---|---|---|
| 3.1 | „Handelt es sich bei eurem Hauptgeschäftszweck um den Handel mit Aktien oder Wertpapieren?" | ❌ Aktienhandel | `business-exclusions` = `stocks` |
| 3.2 | „Seid ihr im Baugewerbe tätig oder habt ihr Baulohn?" | ❌ Bausteuer | `business-exclusions` = `construction` |
| 3.3 | „Gibt es bei euch Verbrauchsteuern — zum Beispiel Alkohol-, Tabak- oder Energiesteuer?" | ❌ Verbrauchsteuern | `business-exclusions` = `excise_duties` |
| 3.4 | „Existiert neben der Kapitalgesellschaft ein Einzelunternehmen mit umsatzsteuerlicher Organschaft?" | ❌ USt-Organschaft | `business-exclusions` = `vat_group` |
| 3.5 | „Hat der alleinige Geschäftsführer seinen Wohnsitz im Ausland?" | ❌ Auslandsbezug | Flag |

### Verpackung (Sales-freundlich)

> „Super, die Basics passen. Jetzt noch ein paar kurze Fragen zu eurer steuerlichen Situation — damit ich sicherstellen kann, dass wir alles sauber abbilden können."

### Decision Logic Phase 3

```
IF aktienhandel == true:
    → DISQUALIFY (Reason: "stocks")
IF baugewerbe == true:
    → DISQUALIFY (Reason: "construction")
IF verbrauchsteuer == true:
    → DISQUALIFY (Reason: "excise_duties")
IF ust_organschaft == true:
    → DISQUALIFY (Reason: "vat_group")
IF gf_ausland == true:
    → DISQUALIFY (Reason: "foreign_md_residence")

IF alle == false:
    → business-exclusions = "None"
    → CONTINUE to Phase 4
```

### Einwandbehandlung Phase 3

| Einwand | Antwort |
|---|---|
| „Warum fragt ihr so viel?" | „Gute Frage — mir ist wichtig, dass wir von Anfang an transparent sind. Diese Punkte helfen uns, dir ein Angebot zu machen, das wirklich passt. Bei klassischen Kanzleien merkst du solche Einschränkungen oft erst nach dem Vertragsabschluss." |
| „Wir handeln nur nebenbei mit Aktien in der Holding." | „Wenn der Aktienhandel der Hauptgeschäftszweck der Holding ist, wird es steuerlich sehr komplex. Ist es wirklich der Hauptzweck, oder eher eine Nebensache? Falls es nur Beteiligungen sind, können wir das in der Regel abbilden." |

---

## PHASE 4: SITUATIONSANALYSE — Vorberater / Neugründung

**Ziel:** Aktuelle steuerliche Situation klären, Accounting Start bestimmen, JA-Jahre festlegen.

**Dauer:** 3–5 Minuten

### Kernfragen Phase 4

| # | Frage | HubSpot Property | Logik |
|---|---|---|---|
| 4.1 | „Habt ihr aktuell einen Steuerberater?" | `tax_takeover_hs` | Weiche: Vorberater vs. Neugründung |
| 4.2a | *Falls Vorberater:* „Ab wann soll die Buchhaltung bei uns starten? Gibt es eine letzte BWA oder einen Kündigungszeitpunkt?" | `accounting_start_month` | Möglichst präzise |
| 4.2b | *Falls Neugründung:* „Wurde die steuerliche Erfassung bereits erledigt — also Steuernummer und USt-ID beantragt?" | `tax_takeover_hs` | Tax Registration by Client/Integral |
| 4.3 | „Für welche Jahre werden Jahresabschlüsse benötigt?" | `annual_statement_years_needed` | Multi-Select: 2025, 2026 |
| 4.4 | „Wer hat bisher die Buchhaltung gemacht — ein Steuerberater, oder habt ihr das selbst erledigt?" | *Exclusion Check* | ❌ Selbstbucher → Disqualify |

### Decision Logic Phase 4

```
IF vorberater == true:
    → tax_takeover_hs = "Tax Advisor Takeover by Integral"
    → Frage 4.2a stellen (Accounting Start)

IF vorberater == false (Neugründung):
    IF steuerliche_erfassung_erledigt == true:
        → tax_takeover_hs = "Tax Registration by Client"
    ELSE:
        → tax_takeover_hs = "Tax Registration by Integral"
        → Produkt "Steuerliche Einrichtung" (550€) hinzufügen
    → accounting_start_month = Datum Gesellschaftsvertrag (aus HR/CD-Bericht)

IF selbstbucher == true AND vorberater == false:
    → DISQUALIFY (Reason: "self_booked")
    → Ausnahme: GetMika

IF ja_jahre CONTAINS [2023, 2024]:
    → DISQUALIFY oder FLAG (Reason: "backlog_years")
    → „Die Aufarbeitung vergangener Jahre ist extrem aufwendig. In Ausnahmefällen
       können wir das prüfen, aber wir können nicht für verpasste Fristen haften."

IF nur_jahresabschluss == true AND buchhaltung_intern == true:
    → DISQUALIFY (Reason: "ja_only_no_accounting")
    → „Wir müssen die Buchhaltung führen, um Qualität zu gewährleisten."

IF unternehmen_in_liquidation == true:
    → DISQUALIFY (Reason: "liquidation")
```

### Compliant Formulierungen Phase 4

| Situation | Formulierung |
|---|---|
| Neugründung mit steuerlicher Erfassung | „Die steuerliche Erfassung wird durch die Integral Tax GmbH WPG erledigt — das umfasst die Anmeldung beim Finanzamt, Steuernummer und Eröffnungsbilanz." |
| Vorberater-Wechsel | „Wir organisieren die Übernahme der Unterlagen vom bisherigen Berater. Die Integral Tax GmbH WPG übernimmt dann die laufende Betreuung." |

### Einwandbehandlung Phase 4

| Einwand | Antwort |
|---|---|
| „Wir brauchen auch den JA für 2024." | „Das kann ich verstehen. Die Aufarbeitung vergangener Jahre ist allerdings sehr aufwendig und birgt Risiken — vor allem bei verpassten Fristen. In Ausnahmefällen können wir das prüfen, aber ich will dir gegenüber ehrlich sein: Unser Sweet Spot ist die laufende Betreuung ab jetzt." |
| „Wir haben die Buchhaltung bisher selbst gemacht." | „Danke für die Ehrlichkeit. Damit wir die Qualität und Standardisierung gewährleisten können, müssen wir die Buchhaltung bei uns führen. Falls ihr bisher Tools wie Lexoffice zur Belegsammlung nutzt — das passt perfekt und lässt sich integrieren." |
| „Wir wollen nur den Jahresabschluss, Buchhaltung machen wir intern." | „Verstehe ich. Allerdings können wir die Qualität nur garantieren, wenn wir auch die laufende Buchhaltung führen. Das ist kein Upselling — es ist fachlich notwendig, damit der Jahresabschluss auf einer sauberen Basis steht." |

---

## PHASE 5: SERVICE NEEDS & SIZING

**Ziel:** Leistungsumfang und Unternehmensgröße für Pricing bestimmen.

**Dauer:** 3–4 Minuten

### Kernfragen Phase 5

| # | Frage | HubSpot Property | Werte |
|---|---|---|---|
| 5.1 | „Handelt es sich um eine operative Gesellschaft, eine Holding, oder beides?" | `company_type` | `OpCo` / `Holding` / `Both` |
| 5.2 | „Wie hoch ist euer erwarteter Jahresumsatz in den nächsten 12 Monaten — grobe Größenordnung reicht?" | `expected_annual_revenue` + `jahresumsatz_exakt` | Ranges + exakter Wert |
| 5.3 | „Habt ihr Mitarbeitende, für die ihr Lohnabrechnungen braucht?" | `service_needs` | Accounting+Tax / Accounting+Payroll+Tax / Payroll |
| 5.4 | *Falls Payroll:* „Wie viele Mitarbeitende habt ihr aktuell?" | `number_of_employees` | Zahl |
| 5.5 | *Falls Payroll:* „Ab wann braucht ihr die Lohnbuchhaltung?" | `payroll_start_month` | Monat |
| 5.6 | „In welcher Sprache soll der Vertrag sein — Deutsch oder Englisch?" | `contract_language` | `German` / `English` |

### Decision Logic Phase 5

```
IF company_type == "Both":
    → FLAG: Zwei separate Deals erstellen!
    → OpCo-Deal + Holding-Deal

IF company_type == "Holding":
    → Flat Rate: 74€/Monat (FiBu + JA all-inclusive) + 55€ Plattform
    → KEINE umsatzbasierte Skalierung

Revenue Mapping → expected_annual_revenue:
    0€ (Holding)         → "0€ - Holding"
    < 100.000€           → "< 100k €"
    100.000 – 300.000€   → "100k - 300k €"
    300.000 – 750.000€   → "300k - 750k €"
    750.000 – 1.500.000€ → "750k - 1,5 M €"
    1.500.000 – 5.000.000€ → "1,5M - 5M €"
    > 5.000.000€         → "5M € +"

IF number_of_employees >= 5:
    → FLAG: Payroll-Staffelpreise mit Team abstimmen
    → KEIN automatisches Lohn-Line-Item
    → Task erstellen
```

### Einwandbehandlung Phase 5

| Einwand | Antwort |
|---|---|
| „Warum muss Payroll auch über euch laufen?" | „Gute Frage. Die Finanz- und Lohnbuchhaltung bei einem Anbieter zu haben ist wie beim klassischen Steuerberater — alles greift ineinander. Die Lohnabrechnung läuft über cleverlohn, ein Lohnbuchhaltungsservice den wir in die Integral-Plattform integriert haben. Klare Prozesse, automatischer Sync aller Dokumente." |
| „Unser Umsatz schwankt stark, ich kann das schwer schätzen." | „Kein Problem — eine grobe Schätzung reicht völlig. Das Erstangebot basiert darauf, und wenn sich der Umsatz signifikant ändert, passen wir das an." |
| „Wir haben OpCo und Holding, geht das zusammen?" | „Ja, absolut. Wir betreuen beides — wir erstellen dir für jede Gesellschaft ein eigenes Angebot, damit du transparent siehst, was jeweils anfällt." |

---

## PHASE 6: PRICING PREVIEW & VALUE FRAMING

**Ziel:** Preistransparenz schaffen, Value framen, NICHT über Preis verkaufen.

**Dauer:** 3–5 Minuten

### Pricing-Logik (Formel)

```javascript
// Einheitlicher Prozentsatz: 1,86%
// Gesamtpaket/Jahr = max(5.780, Jahresumsatz * 0,0186)

function calculatePricing(jahresumsatz) {
    const BASE_FIBU = 185;     // €/Monat
    const BASE_JA = 2900;      // €/Jahr
    const BASE_PLATTFORM = 55; // €/Monat
    const PLATTFORM_CAP = 99;  // Max €/Monat
    const BASE_TOTAL = (BASE_FIBU * 12) + BASE_JA + (BASE_PLATTFORM * 12); // 5.780

    const totalPackage = Math.max(BASE_TOTAL, jahresumsatz * 0.0186);
    const factor = totalPackage / BASE_TOTAL;

    return {
        fibu_monat: Math.round(BASE_FIBU * factor),
        jahresabschluss: Math.round(BASE_JA * factor),
        plattform_monat: Math.min(Math.round(BASE_PLATTFORM * factor), PLATTFORM_CAP),
        gesamt_jahr: totalPackage
    };
}
```

### Preisübersicht (Rechenbeispiele für Sales Rep)

| Szenario | Umsatz | FiBu/Monat | JA/Jahr | Plattform/Monat | Gesamt/Jahr |
|---|---|---|---|---|---|
| Startup/Gründung | ≤300k | 185€ | 2.900€ | 55€ | **5.780€** |
| Mittelstand | 500k | 298€ | 4.666€ | 89€ | **9.310€** |
| Wachstum | 1,2M | 714€ | 11.199€ | 99€ (Cap) | **20.955€** |

### Einmalige Gebühren (immer gleich)

| Position | Preis | Wann |
|---|---|---|
| Einrichtungsgebühr | 250€ | Einmalig bei Onboarding |
| Steuerliche Einrichtung | 550€ | Nur bei Neugründung ohne Vorberater |

### Holding — Flat Rate

| Position | Preis |
|---|---|
| Holding Pauschale (FiBu + JA all-inclusive) | 74€/Monat |
| Plattformgebühr | 55€/Monat |
| **Gesamt** | **129€/Monat + 800€ einmalig** |

### Payroll-Preise (cleverlohn)

| MA-Anzahl | Preis/Payslip/Monat |
|---|---|
| < 5 MA | 25€ |
| 5–15 MA | 16–20€ (branchenabhängig, individuell) |
| 16–40 MA | 15,50–17€ |
| 41–99 MA | 15–16,50€ |
| ≥ 100 MA | 12,50–13,50€ |
| + Einrichtung Unternehmen | 30€ einmalig |
| + Einrichtung pro MA | 15€ einmalig |

### Value Framing Script (Compliant!)

> „Lass mich dir kurz zeigen, wie sich das zusammensetzt. Über die Integral-Plattform bekommst du einen All-in-One-Service: Die technische Plattform von uns, und alle regulierten Leistungen — Buchhaltung, Jahresabschluss, Steuererklärungen — werden durch die Integral Tax GmbH Wirtschaftsprüfungsgesellschaft erbracht."

> „Das Besondere: Alles läuft digital auf einer Plattform, du hast einen persönlichen Ansprechpartner, und wir kümmern uns proaktiv um Fristen und Compliance. Kein Papierkram, keine verpassten Deadlines."

### Einwandbehandlung Phase 6

| Einwand | Antwort |
|---|---|
| „Das ist mir zu teuer." | „Ich verstehe, dass der Preis ein wichtiger Faktor ist. Lass mich kurz einordnen, was du dafür bekommst: laufende Finanzbuchhaltung, Jahresabschluss, Unternehmenssteuern, persönlichen Ansprechpartner, digitale Plattform — alles aus einer Hand. Wenn du das bei einer klassischen Kanzlei einzeln beauftragst, kommst du in der Regel auf einen ähnlichen oder höheren Betrag, ohne die digitale Integration." |
| „Gibt es Rabatte?" | „Wir arbeiten mit transparenten, fairen Preisen. In bestimmten Fällen — zum Beispiel bei einer Kombination aus OpCo und Holding — können wir individuelle Konditionen besprechen. Was genau hast du dir vorgestellt?" |
| „Kann ich eine feste Pauschale bekommen?" | „Genau das bieten wir an. Dein Angebot enthält eine klare monatliche Pauschale für die Buchhaltung und die Plattform, plus einen festen Jahresbetrag für den Jahresabschluss. Keine versteckten Kosten, keine Überraschungen." |
| „Welche Zusatzkosten können entstehen?" | „Sehr gute Frage. Die Standardleistungen sind komplett abgedeckt. Zusatzkosten können nur bei Sonderfällen entstehen — zum Beispiel bei einer Betriebsprüfung oder individuellen Zusatzleistungen. Das besprechen wir vorher immer transparent." |
| „Ich habe ein günstigeres Angebot von einem anderen Berater." | „Das kann ich nachvollziehen. Wir differenzieren uns nicht über den Preis, sondern über Qualität, Transparenz und digitale Effizienz. Unsere Erfahrung zeigt: Bei günstigeren Angeboten fehlen oft Leistungen oder der Support-Level stimmt nicht. Am Ende zählt, was du wirklich bekommst." |

---

## PHASE 7: NEXT STEPS & CLOSE

**Ziel:** Klare nächste Schritte definieren, Verbindlichkeit schaffen.

**Dauer:** 2–3 Minuten

### Abschluss-Script

> „Perfekt. Ich fasse kurz zusammen, was wir besprochen haben: [Zusammenfassung der Services + Preis-Range]. Ich stelle dir jetzt ein konkretes Angebot zusammen, das du per E-Mail bekommst. Dort siehst du alle Leistungen und Preise transparent aufgelistet."

> „Die nächsten Schritte sind dann ganz einfach:"
> 1. „Angebot prüfen und digital unterschreiben"
> 2. „Onboarding auf der Plattform starten — Ausweis, Meldeadresse, Bankkonto"
> 3. „Los geht's!"

> „Bei Fragen melde dich jederzeit — ich bin für dich da."

### Einwandbehandlung Phase 7

| Einwand | Antwort |
|---|---|
| „Ich muss mir das noch überlegen." | „Absolut, nimm dir die Zeit die du brauchst. Ich schicke dir das Angebot zu, dann hast du alles schwarz auf weiß. Wann soll ich mich bei dir melden, um zu hören wie du dich entschieden hast?" |
| „Ich möchte das erst mit meinem Partner besprechen." | „Klar, das ist sinnvoll. Soll ich euch beiden das Angebot schicken? Oder macht es Sinn, dass wir uns zu dritt kurz austauschen?" |
| „Ich will erst noch andere Anbieter vergleichen." | „Das macht total Sinn. Achte beim Vergleich auf: Ist alles wirklich all-inclusive? Wie digital ist die Plattform? Wie schnell ist der Support? Und — ganz wichtig — wer erbringt die steuerlichen Leistungen tatsächlich? Bei uns ist das eine lizenzierte WPG." |

---

## VOLLSTÄNDIGE HUBSPOT-PROPERTY-MAP

Alle Properties die nach dem Call befüllt sein müssen:

| Property | Phase | Typ | Pflicht |
|---|---|---|---|
| `trigger_event` | 1 | Single-Select | ✅ |
| `legal_entity_type` | 2 | Single-Select | ✅ |
| `commercial_register_number` | 2 | Text | ✅ |
| `business-exclusions` | 2+3 | Multi-Select | ✅ |
| `tax_takeover_hs` | 4 | Single-Select | ✅ |
| `accounting_start_month` | 4 | Date | ✅ |
| `annual_statement_years_needed` | 4 | Multi-Select | ✅ |
| `company_type` | 5 | Single-Select | ✅ |
| `expected_annual_revenue` | 5 | Single-Select | ✅ |
| `jahresumsatz_exakt` | 5 | Number | ✅ |
| `service_needs` | 5 | Single-Select | ✅ |
| `number_of_employees` | 5 | Number | Wenn Payroll |
| `payroll_start_month` | 5 | Date | Wenn Payroll |
| `contract_language` | 5 | Single-Select | ✅ |
| `deal_source` | Auto | Single-Select | ✅ |
| `deal_owner` | Auto | Owner | ✅ |
| `deal_summary` | 7 | Long Text | ✅ |

---

## DISQUALIFICATION REASONS → HUBSPOT `lost_reasons`

| Interner Grund | `lost_reasons` Wert | Phase |
|---|---|---|
| Keine Antwort | `No response` | — |
| Anderer Steuerberater gewählt | `Different Tax Advisor` | 7 |
| Migration (Alt-Jahre zu komplex) | `Migration` | 4 |
| Eskalation an WPG | `Escalation` | 3/4 |
| Zu teuer / preisgetrieben | `Pricing` | 6 |
| Onboarding-Abbruch | `Onboarding` | 7 |

---

## SALES AGENT PERFORMANCE (Post-Call Tracking)

| Metrik | Property | Beschreibung |
|---|---|---|
| Talk Ratio | `talk_ratio_rep` | % Redezeit Sales Rep (Ziel: 40–50%) |
| Customer Sentiment | `customer_sentiment_sales_call` | Score 1–10 |
| Exclusion Criteria Check | `exclusion_criteria_check` | Alle Ausschlüsse abgefragt? Welche fehlen? |
| Compliance Check | `compliance_check` | Verstöße gegen Playbook? Kontext + Schwere |
| Objection Handling | `objection_handling` | Welche Einwände kamen? Kategorisierung |
| Performance Score | `sales_rep_performance_score` | Übergeordnet: 1–100 |

---

## ANHANG: ENTHALTENE LEISTUNGEN (für Referenz im Gespräch)

### Laufende Finanzbuchhaltung (durch Integral Tax GmbH WPG)
- Monatliche Buchführung
- Umsatzsteuervoranmeldung
- BWA & Summen-/Saldenliste

### Jahresabschluss & Unternehmenssteuern (durch Integral Tax GmbH WPG)
- Jahresabschluss (Bilanz + GuV)
- Körperschaftsteuererklärung
- Gewerbesteuererklärung
- Umsatzsteuerjahreserklärung

### Steuerliche Einrichtung (durch Integral Tax GmbH WPG)
- Fragebogen zur steuerlichen Erfassung
- Steuernummer + USt-ID Beantragung
- Eröffnungsbilanz

### Plattform (durch Integral Services GmbH)
- Digitale Plattform / Kollaborationseinheit
- Persönlicher Ansprechpartner
- Dokumenten-Management
- Automatisierte Fristen & Erinnerungen

### Lohnbuchhaltung (durch cleverlohn)
- Monatliche Lohn-/Gehaltsabrechnung
- Meldungen & Bescheinigungen (Beitragsnachweis, LStA, Jahresmeldungen)
- SEPA-Zahlungsdateien
- Digitaler Freigabeprozess
- Feste/r Payroll-Manager/in
- Digitale App für Mitarbeitende
