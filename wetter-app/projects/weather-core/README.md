# weather-core

Geteilte Bibliothek mit Domain-Modell, `WeatherService` und
`LastLocationStore`. Wird von den Apps `web` und `mobile` konsumiert.

Aufbau:

- `models/` &ndash; rohes OpenWeather-Schema und das interne Domain-Modell
- `storage/` &ndash; SSR-sichere LocalStorage-Kapsel und der `LastLocationStore`
- `weather/` &ndash; `WeatherService` (HTTP, Mapping, Fehleruebersetzung)
- `weather-api.config.ts` &ndash; `WEATHER_API_CONFIG` InjectionToken

Build und Test laufen aus dem Workspace-Root:

```bash
ng build weather-core
ng test  weather-core --browsers=ChromeHeadless --watch=false
```
