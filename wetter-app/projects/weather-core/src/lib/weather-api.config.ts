import { InjectionToken } from '@angular/core';

// Konfiguration der Endpunkt-/Key-Werte wird per InjectionToken eingespielt,
// damit jede App ihre eigene environment-Datei verwenden kann und der
// Service ohne Singleton-Konstante testbar bleibt.

export interface WeatherApiConfig {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly defaultQuery: string;
}

export const WEATHER_API_CONFIG = new InjectionToken<WeatherApiConfig>(
  'WEATHER_API_CONFIG',
);
