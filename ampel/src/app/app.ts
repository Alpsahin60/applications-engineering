import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AmpelComponent } from './ampel/ampel.component';

@Component({
  selector: 'am-root',
  standalone: true,
  imports: [AmpelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
