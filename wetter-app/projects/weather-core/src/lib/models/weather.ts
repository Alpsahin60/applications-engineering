// Internes Domain-Modell. Die UI arbeitet ausschliesslich mit diesem Typ,
// nie direkt mit der API-Antwort.

export interface Weather {
  readonly location: string;
  readonly country: string;
  readonly temperatureCelsius: number;
  readonly feelsLikeCelsius: number;
  readonly description: string;
  readonly iconCode: string;
  readonly iconUrl: string;
  readonly humidityPercent: number;
  readonly windSpeedMps: number;
  readonly observedAt: Date;
}
