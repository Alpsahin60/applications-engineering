import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
} from '@angular/core';
import { LampeComponent } from '../lampe/lampe.component';
import { AmpelMaschine, PHASEN_BEZEICHNUNG } from '../ampel-maschine/ampel-maschine';
import { AmpelSteuerung } from '../ampel-maschine/ampel-steuerung';
import { TickPlaner } from '../ampel-maschine/tick-planer';

const MODUS_TEXT: Readonly<Record<'manuell' | 'auto' | 'notfall', string>> = {
  manuell: 'Manueller Betrieb',
  auto: 'Automodus aktiv',
  notfall: 'Notfallmodus aktiv',
};

@Component({
  selector: 'am-ampel',
  standalone: true,
  imports: [LampeComponent],
  templateUrl: './ampel.component.html',
  styleUrl: './ampel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AmpelMaschine],
})
export class AmpelComponent {
  private readonly maschine = inject(AmpelMaschine);
  private readonly tickPlaner = inject(TickPlaner);
  private readonly steuerung = new AmpelSteuerung(this.maschine, this.tickPlaner);

  protected readonly lampen = this.maschine.lampen;
  protected readonly phase = this.maschine.phase;
  protected readonly hatDefekt = this.maschine.hatDefekt;

  protected readonly automodus = this.steuerung.automodus;
  protected readonly notfallmodus = this.steuerung.notfallmodus;
  protected readonly aktiverModus = this.steuerung.aktiverModus;
  protected readonly zeigeManuelleSteuerung = this.steuerung.zeigeManuelleSteuerung;

  protected readonly phaseText = computed(() => PHASEN_BEZEICHNUNG[this.phase()]);
  protected readonly modusText = computed(() => MODUS_TEXT[this.aktiverModus()]);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.steuerung.entsorgen());
  }

  protected onTick(): void {
    this.steuerung.tickManuell();
  }

  protected onReparieren(): void {
    this.steuerung.reparieren();
  }

  protected onAusschalten(): void {
    this.steuerung.ausschalten();
  }

  protected onDefektSimulieren(): void {
    this.steuerung.defektSimulieren();
  }

  protected onAutomodusToggle(): void {
    this.steuerung.automodusUmschalten();
  }

  protected onNotfallmodusToggle(): void {
    this.steuerung.notfallmodusUmschalten();
  }
}
