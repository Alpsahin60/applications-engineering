# Ampel

Verkehrsampel als Zustandsautomat. Eigenstaendiger Angular-Workspace, neutral zur
`wetter-app` im selben Repo.

## Voraussetzungen

- Node.js 20 LTS oder neuer
- npm 10 oder neuer
- Chrome / Chromium fuer die Headless-Tests

## Setup

```bash
cd ampel
npm install
```

## Starten

```bash
npm start
```

Die Anwendung laeuft danach unter <http://localhost:4200>.

## Tests

```bash
npm run test:ci
```

Karma fuehrt die Suiten einmalig in Chrome Headless aus (`--watch=false`).
`npm test` ist ein Alias fuer denselben Single-Run.

## Lint und Build

```bash
npm run lint
npm run build
```

## Architektur

Vier Bausteine, klar geschnitten:

| Datei                                              | Rolle                                                      |
|----------------------------------------------------|------------------------------------------------------------|
| `src/app/lampe/lampe.component.ts`                 | Wiederverwendbare, reine Lampe (Farbe, an, defekt)         |
| `src/app/ampel-maschine/ampel-maschine.ts`         | Reiner Zustandsautomat (Signals, kein DOM, voll testbar)   |
| `src/app/ampel-maschine/ampel-steuerung.ts`        | Modus- und Timer-Logik (manuell/auto/notfall), testbar     |
| `src/app/ampel-maschine/tick-planer.ts`            | Injizierbarer Wrapper um `setInterval`, im Test stubbar    |
| `src/app/ampel/ampel.component.ts`                 | Duenne UI, delegiert vollstaendig an `AmpelSteuerung`      |

Die `LampeComponent` rendert ausschliesslich die Visualisierung &mdash; keine
Schaltflaechen, keine eigene Logik ueber Defekt-Meldung hinaus. Die
`AmpelMaschine` kennt nur Zustaende, nicht den DOM. Die `AmpelSteuerung`
orchestriert Modi und Timer ueber den `TickPlaner`; Teardown laeuft per
`DestroyRef` aus der Component. Verhalten wird vollstaendig auf der
Logik-Schicht getestet, die Component selbst hat nur einen Smoketest.

## Zustandsmaschine

```
                     tick()              tick()              tick()
   +---------+   --->   +-------------+   --->   +---------+   --->   +-------------+   --->
   |   rot   |          | gruen-kommt |          |  gruen  |          |  rot-kommt  |
   +---------+   <---   +-------------+   <---   +---------+   <---   +-------------+   <---
                                                                                       tick()
```

| Zustand        | Rot | Gelb | Gruen |
|----------------|-----|------|-------|
| `rot`          |  X  |      |       |
| `gruen-kommt`  |  X  |  X   |       |
| `gruen`        |     |      |   X   |
| `rot-kommt`    |     |  X   |       |
| `aus`          |     |      |       |

Aus `aus` startet `tick()` wieder bei `rot`.

## Betriebsmodi

| Modus       | Verhalten                                                    | Vorrang |
|-------------|--------------------------------------------------------------|---------|
| Manuell     | `tick()` per Schaltflaeche, Defekte koennen zufaellig auftreten | 3       |
| Auto        | `tick()` jede Sekunde, defekte Lampen werden auto-repariert  | 2       |
| Notfall     | Gelb-Blinken (abwechselnd `rot-kommt` und `aus`)             | 1       |

Notfall hat Vorrang vor Auto, Auto vor manuell. Beim Verlassen eines Modus
faellt die Ampel sauber auf den naechstniedrigeren Modus zurueck.

## Defekt-Handling

Im manuellen Modus laesst sich ueber `Defekt simulieren` eine bisher intakte
Lampe deterministisch in den Defekt-Zustand versetzen. Die Ampel zeigt dann
eine deutliche Meldung und einen `Lampen reparieren`-Knopf. Im Automodus
werden Defekte mit jedem Takt automatisch behoben.
