import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { WEATHER_API_CONFIG } from 'weather-core';
import { App } from './app';

describe('App (mobile)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideIonicAngular(),
        {
          provide: WEATHER_API_CONFIG,
          useValue: {
            baseUrl: 'https://example.invalid/weather',
            apiKey: 'test',
            defaultQuery: 'Buchs,CH',
          },
        },
      ],
    }).compileComponents();
  });

  it('startet ohne Fehler', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
