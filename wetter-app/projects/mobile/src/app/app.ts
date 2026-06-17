import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { WeatherPage } from './weather/weather.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, WeatherPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
