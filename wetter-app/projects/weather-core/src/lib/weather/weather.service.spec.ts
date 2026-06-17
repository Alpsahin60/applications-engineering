import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WeatherService } from './weather.service';
import { WEATHER_API_CONFIG } from '../weather-api.config';
import { OpenWeatherResponse } from '../models/openweather-response';
import { WeatherError } from '../models/weather-error';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const apiKey = 'test-key';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: WEATHER_API_CONFIG,
          useValue: { baseUrl, apiKey, defaultQuery: 'Buchs,CH' },
        },
      ],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function sampleResponse(): OpenWeatherResponse {
    return {
      name: 'Buchs SG',
      dt: 1781691795,
      weather: [
        { id: 804, main: 'Clouds', description: 'bedeckt', icon: '04d' },
      ],
      main: { temp: 28.81, feels_like: 27.83, humidity: 32 },
      wind: { speed: 0.45, deg: 33 },
      sys: { country: 'CH' },
      cod: 200,
    };
  }

  it('mappt die API-Antwort auf das Domain-Modell', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: (weather) => {
        expect(weather.location).toBe('Buchs SG');
        expect(weather.country).toBe('CH');
        expect(weather.temperatureCelsius).toBe(28.8);
        expect(weather.feelsLikeCelsius).toBe(27.8);
        expect(weather.description).toBe('Bedeckt');
        expect(weather.iconCode).toBe('04d');
        expect(weather.iconUrl).toBe(
          'https://openweathermap.org/img/wn/04d@2x.png',
        );
        expect(weather.humidityPercent).toBe(32);
        expect(weather.windSpeedMps).toBe(0.45);
        expect(weather.observedAt instanceof Date).toBeTrue();
        done();
      },
      error: () => done.fail('darf nicht fehlschlagen'),
    });

    const req = httpMock.expectOne((request) => request.url === baseUrl);
    expect(req.request.params.get('q')).toBe('Buchs,CH');
    expect(req.request.params.get('appid')).toBe(apiKey);
    expect(req.request.params.get('units')).toBe('metric');
    expect(req.request.params.get('lang')).toBe('de');
    req.flush(sampleResponse());
  });

  it('lehnt leere Eingaben ohne HTTP-Aufruf ab', (done) => {
    service.getWeatherByQuery('   ').subscribe({
      next: () => done.fail('darf nicht durchkommen'),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('invalid-input');
        done();
      },
    });
    httpMock.expectNone(baseUrl);
  });

  it('uebersetzt 404 in not-found mit deutscher Meldung', (done) => {
    service.getWeatherByQuery('Atlantis').subscribe({
      next: () => done.fail(),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('not-found');
        expect(err.message).toContain('nicht gefunden');
        done();
      },
    });
    httpMock
      .expectOne((r) => r.url === baseUrl)
      .flush({ message: 'city not found' }, { status: 404, statusText: 'NF' });
  });

  it('uebersetzt 401 in unauthorized', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: () => done.fail(),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('unauthorized');
        done();
      },
    });
    httpMock
      .expectOne((r) => r.url === baseUrl)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('uebersetzt 429 in rate-limited', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: () => done.fail(),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('rate-limited');
        done();
      },
    });
    httpMock
      .expectOne((r) => r.url === baseUrl)
      .flush({}, { status: 429, statusText: 'Too Many Requests' });
  });

  it('uebersetzt status 0 in network', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: () => done.fail(),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('network');
        done();
      },
    });
    httpMock
      .expectOne((r) => r.url === baseUrl)
      .error(new ProgressEvent('offline'), { status: 0, statusText: '' });
  });

  it('uebersetzt unbekannte HTTP-Fehler in "unknown"', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: () => done.fail(),
      error: (err: WeatherError) => {
        expect(err.kind).toBe('unknown');
        done();
      },
    });
    httpMock
      .expectOne((r) => r.url === baseUrl)
      .flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('schreibt das erste Wort der Beschreibung gross', (done) => {
    service.getWeatherByQuery('Buchs,CH').subscribe({
      next: (w) => {
        expect(w.description).toBe('Leicht bewoelkt');
        done();
      },
      error: () => done.fail(),
    });
    const response = sampleResponse();
    const customised: OpenWeatherResponse = {
      ...response,
      weather: [{ id: 802, main: 'Clouds', description: 'leicht bewoelkt', icon: '03d' }],
    };
    httpMock.expectOne((r) => r.url === baseUrl).flush(customised);
  });
});
