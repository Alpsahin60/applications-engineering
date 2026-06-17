import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { WEATHER_API_CONFIG } from 'weather-core';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch()),
    provideIonicAngular({ mode: 'ios' }),
    {
      provide: WEATHER_API_CONFIG,
      useValue: environment.weather,
    },
  ],
};
