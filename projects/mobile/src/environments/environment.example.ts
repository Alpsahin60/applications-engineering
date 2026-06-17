// Vorlage. Zum Bauen der App diese Datei nach environment.ts und
// environment.development.ts kopieren und apiKey mit dem eigenen
// OpenWeather-Schluessel ersetzen.

export const environment = {
  production: true,
  weather: {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    apiKey: 'YOUR_OPENWEATHER_API_KEY',
    defaultQuery: 'Buchs,CH',
  },
};
