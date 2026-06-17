import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LampenFarbe, lampeAriaBeschriftung, lampeLeuchtet } from './lampe.types';

@Component({
  selector: 'am-lampe',
  standalone: true,
  templateUrl: './lampe.component.html',
  styleUrl: './lampe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-farbe]': 'farbe()',
    '[attr.data-an]': 'leuchtet()',
    '[attr.data-defekt]': 'defekt()',
    role: 'img',
    '[attr.aria-label]': 'ariaBeschriftung()',
  },
})
export class LampeComponent {
  readonly farbe = input.required<LampenFarbe>();
  readonly an = input<boolean>(false);
  readonly defekt = input<boolean>(false);

  readonly defektGemeldet = output<LampenFarbe>();

  protected readonly leuchtet = computed(() => lampeLeuchtet(this.an(), this.defekt()));

  protected readonly ariaBeschriftung = computed(() =>
    lampeAriaBeschriftung(this.farbe(), this.an(), this.defekt()),
  );

  meldeDefekt(): void {
    this.defektGemeldet.emit(this.farbe());
  }
}
