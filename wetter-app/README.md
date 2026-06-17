# weather-buchs

Wetter-Anzeige fuer Buchs SG (und beliebige weitere Orte) auf Basis der
OpenWeather-API. Das Repository enthaelt ein Angular-Workspace mit drei
Projekten:

- `weather-core` &ndash; geteilte Bibliothek mit Domain-Modell, `WeatherService`
  und `LastLocationStore` (LocalStorage-Kapsel).
- `web` &ndash; klassische Angular-Web-App (Desktop &amp; Mobile-Web).
- `mobile` &ndash; Ionic-Variante derselben App; nutzt die identische Logik-Schicht
  aus `weather-core`.

## Voraussetzungen

- Node.js &ge; 22.15
- npm &ge; 10
- Google Chrome (lokal installiert) fuer die Unit-Tests

## Installation

```bash
npm install
```

## API-Schluessel einrichten

Die echten `environment.ts`-Dateien werden nicht versioniert. Im Repo liegt je
App eine Vorlage `environment.example.ts`. Vor dem ersten Build einmalig
kopieren und den eigenen OpenWeather-Key eintragen:

```bash
cp projects/web/src/environments/environment.example.ts \
   projects/web/src/environments/environment.ts
cp projects/web/src/environments/environment.example.ts \
   projects/web/src/environments/environment.development.ts

cp projects/mobile/src/environments/environment.example.ts \
   projects/mobile/src/environments/environment.ts
cp projects/mobile/src/environments/environment.example.ts \
   projects/mobile/src/environments/environment.development.ts
```

Anschliessend in den vier kopierten Dateien `YOUR_OPENWEATHER_API_KEY` durch
den eigenen Schluessel von [openweathermap.org](https://openweathermap.org)
ersetzen. Der Schluessel wird zur Laufzeit ueber den Injection-Token
`WEATHER_API_CONFIG` aus `weather-core` bereitgestellt, sodass der
`WeatherService` selbst keinen Modul-Globalen Zustand benoetigt und in Tests
beliebig austauschbar bleibt.

## Entwicklungsserver

```bash
npm start            # Web-Variante  -> http://localhost:4200
npm run start:mobile # Ionic-Variante -> http://localhost:4200
```

## Builds

```bash
npm run build        # Library + Web + Mobile (Production)
npm run build:web
npm run build:mobile
npm run build:lib
```

## Tests

Headless Chrome, ohne Watch-Mode:

```bash
npm test             # alle Projekte hintereinander
npm run test:lib
npm run test:web
npm run test:mobile
```

Unter Windows sollte die Umgebungsvariable `CHROME_BIN` auf die installierte
`chrome.exe` zeigen, falls Karma den Browser nicht automatisch findet.

## Lint

```bash
npm run lint
```

## Architektur

```
projects/
  weather-core/   Bibliothek (Models, Service, Storage, Config-Token)
  web/            Angular-Web-App, konsumiert weather-core
  mobile/         Ionic-Angular-App, konsumiert weather-core
```

- `WeatherService` ruft `GET /data/2.5/weather` mit `units=metric` (°C) und
  `lang=de` (deutsche Beschreibung) auf und mappt die Antwort auf das interne
  Modell `Weather`. Das Wetter-Icon wird aus dem Code in
  `https://openweathermap.org/img/wn/{icon}@2x.png` aufgeloest.
- HTTP-Fehler werden in eine kleine Domain-Variante `WeatherError`
  uebersetzt; die UI rendert ausschliesslich deutsche Texte.
- Der Default-Ort ist `Buchs,CH`. OpenWeather liefert dafuer konsistent
  Buchs&nbsp;SG (lat &asymp; 47.167, lon &asymp; 9.478) zurueck.
- `LastLocationStore` persistiert die zuletzt gewaehlte Eingabe im
  LocalStorage und stellt sie beim naechsten Start wieder her.
- Die UI ist Signals-basiert und nutzt das neue Control-Flow (`@if`/`@else`),
  Standalone-Components und `inject()`.
