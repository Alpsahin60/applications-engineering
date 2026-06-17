import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WEATHER_API_CONFIG } from '../weather-api.config';
import { OpenWeatherResponse } from '../models/openweather-response';
import { Weather } from '../models/weather';
import { WeatherError } from '../models/weather-error';

// Zentraler Wetter-Service. Verantwortlich fuer:
//   - HTTP-Aufruf gegen OpenWeather
//   - Mapping auf das Domain-Modell
//   - Uebersetzung von HTTP-Fehlern in deutsche Nutzermeldungen
// Hinweis zur Ortswahl "Buchs": Es gibt mehrere Gemeinden dieses Namens in
// der Schweiz. OpenWeather liefert fuer q="Buchs,CH" konsistent Buchs SG
// (lat ~47.167, lon ~9.478). Wir verlassen uns auf diesen Treffer und
// validieren ihn lediglich indirekt ueber das Anzeige-Feld "name".

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(WEATHER_API_CONFIG);

  getWeatherByQuery(query: string): Observable<Weather> {
    const trimmed = query?.trim() ?? '';
    if (trimmed.length === 0) {
      return throwError(
        (): WeatherError => ({
          kind: 'invalid-input',
          message: 'Bitte einen Ort eingeben.',
        }),
      );
    }

    const params = new HttpParams()
      .set('q', trimmed)
      .set('appid', this.config.apiKey)
      .set('units', 'metric')
      .set('lang', 'de');

    return this.http
      .get<OpenWeatherResponse>(this.config.baseUrl, { params })
      .pipe(
        map((response) => this.toDomain(response)),
        catchError((error: HttpErrorResponse) =>
          throwError(() => this.toWeatherError(error)),
        ),
      );
  }

  private toDomain(response: OpenWeatherResponse): Weather {
    const condition = response.weather?.[0];
    if (!condition) {
      throw {
        kind: 'unknown',
        message: 'Antwort des Wetterdienstes ist unvollstaendig.',
      } satisfies WeatherError;
    }

    return {
      location: response.name,
      country: response.sys?.country ?? '',
      temperatureCelsius: Math.round(response.main.temp * 10) / 10,
      feelsLikeCelsius: Math.round(response.main.feels_like * 10) / 10,
      description: this.capitalize(condition.description),
      iconCode: condition.icon,
      iconUrl: `https://openweathermap.org/img/wn/${condition.icon}@2x.png`,
      humidityPercent: response.main.humidity,
      windSpeedMps: response.wind?.speed ?? 0,
      observedAt: new Date(response.dt * 1000),
    };
  }

  private toWeatherError(error: HttpErrorResponse): WeatherError {
    switch (error.status) {
      case 0:
        return {
          kind: 'network',
          message:
            'Verbindung zum Wetterdienst fehlgeschlagen. Bitte Netzwerkverbindung pruefen.',
        };
      case 401:
        return {
          kind: 'unauthorized',
          message:
            'Zugriff auf den Wetterdienst verweigert. API-Schluessel pruefen.',
        };
      case 404:
        return {
          kind: 'not-found',
          message: 'Der gesuchte Ort wurde nicht gefunden.',
        };
      case 429:
        return {
          kind: 'rate-limited',
          message: 'Zu viele Anfragen. Bitte einen Moment warten.',
        };
      default:
        return {
          kind: 'unknown',
          message: 'Wetterdaten konnten nicht geladen werden.',
        };
    }
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }
    return value.charAt(0).toLocaleUpperCase('de-CH') + value.slice(1);
  }
}
