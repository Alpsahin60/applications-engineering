import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LastLocationStore,
  WEATHER_API_CONFIG,
  Weather,
  WeatherError,
  WeatherService,
} from 'weather-core';

type Status = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'wb-weather',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);
  private readonly lastLocation = inject(LastLocationStore);
  private readonly config = inject(WEATHER_API_CONFIG);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly locationControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  });

  protected readonly status = signal<Status>('idle');
  protected readonly pendingQuery = signal<string>('');
  protected readonly weather = signal<Weather | null>(null);
  protected readonly error = signal<WeatherError | null>(null);

  ngOnInit(): void {
    const initial = this.lastLocation.load() ?? this.config.defaultQuery;
    this.locationControl.setValue(initial, { emitEvent: false });
    this.load(initial);
  }

  protected submit(): void {
    if (this.locationControl.invalid) {
      this.error.set({
        kind: 'invalid-input',
        message: 'Bitte einen Ort mit mindestens zwei Zeichen eingeben.',
      });
      this.status.set('error');
      return;
    }
    this.load(this.locationControl.value);
  }

  private load(query: string): void {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return;
    }

    this.pendingQuery.set(trimmed);
    this.error.set(null);
    this.status.set('loading');

    this.weatherService
      .getWeatherByQuery(trimmed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (weather) => {
          this.lastLocation.save(trimmed);
          this.weather.set(weather);
          this.status.set('success');
        },
        error: (error: WeatherError) => {
          this.error.set(error);
          this.status.set('error');
        },
      });
  }
}
