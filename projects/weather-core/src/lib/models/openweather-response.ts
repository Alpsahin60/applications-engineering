// Rohes Antwort-Schema der OpenWeather "Current Weather"-API.
// Nur die Felder, die wir tatsaechlich konsumieren, sind verpflichtend
// modelliert; alles weitere bleibt absichtlich aussen vor, damit Aenderungen
// am API-Schema uns nicht ueberraschen.

export interface OpenWeatherCondition {
  readonly id: number;
  readonly main: string;
  readonly description: string;
  readonly icon: string;
}

export interface OpenWeatherMain {
  readonly temp: number;
  readonly feels_like: number;
  readonly humidity: number;
}

export interface OpenWeatherWind {
  readonly speed: number;
  readonly deg: number;
}

export interface OpenWeatherSys {
  readonly country: string;
}

export interface OpenWeatherResponse {
  readonly name: string;
  readonly dt: number;
  readonly weather: readonly OpenWeatherCondition[];
  readonly main: OpenWeatherMain;
  readonly wind: OpenWeatherWind;
  readonly sys: OpenWeatherSys;
  readonly cod: number;
}
