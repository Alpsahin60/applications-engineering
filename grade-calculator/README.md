# grade-calculator

Test-Suite, die zwei absichtlich eingebaute Fehler des Library-Service
`GradeCalculator` (aus `@tschuegge/angular-coding-resources`) nachweist, und
eine korrigierte Implementierung `GradeCalculatorFixed`, gegen die dieselbe
Suite vollstaendig gruen laeuft.

## Zweck und Vorgehen

Berechnet wird eine Note nach der **schweizerischen Notenskala** (1-6, 6 ist die
Bestnote), gerundet auf 1/10:

```
Note = Math.round(((pointsReached / pointsMaximum) * 5 + 1) * 10) / 10
```

Vorgehen nach dem **AAA-Pattern**: Jeder Test ist in *Arrange* (Testdaten und
Service bereitstellen), *Act* (`calcGradeByPoints` aufrufen) und *Assert*
(Ergebnis bzw. erwarteten Error pruefen) gegliedert. Zuerst wird der fehlerhafte
Library-Service getestet (RED fuer Fehler A/B), danach die korrigierte Variante
(alles GREEN).

## Die zwei Fehler des Library-Service

| Fehler | Aufdeckender Test | Soll | Ist (Library) | Fix |
|--------|-------------------|------|---------------|-----|
| **A** – `pointsMaximum < 0` statt `<= 0` → Division durch 0 | `grade-calculator-test.spec.ts` → *Fehler A: should throw when pointsMaximum is 0* | `calcGradeByPoints(0, 0)` wirft `Error` | liefert `NaN`, kein Error | `grade-calculator-fixed.ts:23` (`if (pointsMaximum <= 0)`) |
| **B** – Pruefung `pointsReached > pointsMaximum` auskommentiert → Note > 6 | `grade-calculator-test.spec.ts` → *Fehler B: should throw when pointsReached exceeds pointsMaximum* | `calcGradeByPoints(120, 100)` wirft `Error` | liefert `7.0`, kein Error | `grade-calculator-fixed.ts:32` (`if (pointsReached > pointsMaximum)`) |

Diese beiden Tests in `grade-calculator-test.spec.ts` schlagen **bewusst fehl**.
Genau dieser Fehlschlag belegt, dass die Tests die Maengel des Library-Service
finden. Die uebrigen Tests (Smoke, korrekte Berechnung, funktionierende
Fehlerbehandlung) sind auch gegen den Library-Service gruen.

## Profi-Zusatz

- **Parametrisierte Tabellen-Tests** (`it.each`) fuer die Berechnungsfaelle.
- **Property-Based-Tests** mit [fast-check](https://github.com/dubzzz/fast-check)
  gegen `GradeCalculatorFixed`:
  - gueltige Eingaben (`0 <= reached <= max`, `max > 0`) ergeben stets `1 <= Note <= 6`
  - Monotonie: mehr Punkte bei gleichem Maximum ergeben keine kleinere Note
  - Ergebnis stets auf 1/10 gerundet (`Note * 10` ganzzahlig)

  Den Library-Service wuerde insbesondere die erste Invariante sichtbar
  verletzen: bei Fehler B liefert `120/100` die Note `7.0` und damit `Note > 6`.
- **Randwertanalyse**: 0 Punkte, `reached == max`, knapp ueber dem Maximum,
  negativer Wert, `max == 0`, gebrochene Punkte und sehr grosse Zahlen.

## Befehle

```bash
npm install

# Demo: zeigt rot UND gruen - die 2 absichtlich roten Tests (Fehler A/B)
# belegen den Fehlernachweis, der Rest ist gruen.
npm run test:demo

# CI: nur die gruene Suite gegen GradeCalculatorFixed (alles gruen).
npm run test:ci

# Coverage fuer die korrigierte Implementierung (Ziel: 100 %).
npm run test:coverage

# Linting
npm run lint
```

Die Tests laufen ueber den Vitest-Builder von Angular (`@angular/build:unit-test`)
headless in einer jsdom-Umgebung - ein Browser wird nicht benoetigt.

## Hinweis

Die zwei roten Tests in `grade-calculator-test.spec.ts` sind **beabsichtigt** und
belegen, dass die Tests die Fehler des Library-Service finden. Die oeffentliche
CI-Pipeline (`.github/workflows/ci.yml`) fuehrt mit `npm run test:ci` nur die
gruene Suite aus und bleibt deshalb gruen.

## Struktur

| Datei | Zweck |
|-------|-------|
| `src/app/grade-calculator-test.spec.ts` | Suite gegen den **Library-Service** - mit 2 absichtlich roten Tests (Fehlernachweis A/B) |
| `src/app/grade-calculator-fixed.ts` | Korrigierte Implementierung `GradeCalculatorFixed` |
| `src/app/grade-calculator-fixed.spec.ts` | Vollstaendige **gruene** Suite inkl. Tabellen-, Property-Based- und Randwert-Tests |
