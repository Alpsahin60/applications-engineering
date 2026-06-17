// Vom Service einheitlich aufbereitete Fehler, damit die UI keinen
// HttpErrorResponse interpretieren muss.

export type WeatherErrorKind =
  | 'not-found'
  | 'unauthorized'
  | 'rate-limited'
  | 'network'
  | 'invalid-input'
  | 'unknown';

export interface WeatherError {
  readonly kind: WeatherErrorKind;
  readonly message: string;
}
