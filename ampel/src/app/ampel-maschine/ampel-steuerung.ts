import { Signal, computed, signal } from '@angular/core';
import { AmpelMaschine } from './ampel-maschine';
import { TickPlaner, TickStopp } from './tick-planer';

export const AUTO_INTERVALL_MS = 1000;
export const NOTFALL_INTERVALL_MS = 600;

export type AmpelModus = 'manuell' | 'auto' | 'notfall';

export class AmpelSteuerung {
  private readonly automodusSig = signal<boolean>(false);
  private readonly notfallmodusSig = signal<boolean>(false);
  private aktiverStopp: TickStopp | null = null;

  readonly automodus: Signal<boolean> = this.automodusSig.asReadonly();
  readonly notfallmodus: Signal<boolean> = this.notfallmodusSig.asReadonly();

  readonly aktiverModus: Signal<AmpelModus> = computed(() => {
    if (this.notfallmodusSig()) {
      return 'notfall';
    }
    if (this.automodusSig()) {
      return 'auto';
    }
    return 'manuell';
  });

  readonly zeigeManuelleSteuerung: Signal<boolean> = computed(
    () => this.aktiverModus() === 'manuell',
  );

  constructor(
    private readonly maschine: AmpelMaschine,
    private readonly planer: TickPlaner,
  ) {}

  tickManuell(): void {
    if (this.aktiverModus() !== 'manuell') {
      return;
    }
    this.maschine.tick();
  }

  ausschalten(): void {
    if (this.aktiverModus() !== 'manuell') {
      return;
    }
    this.maschine.setzePhase('aus');
  }

  reparieren(): void {
    this.maschine.reparieren();
  }

  defektSimulieren(): void {
    if (this.aktiverModus() !== 'manuell') {
      return;
    }
    this.maschine.defektEineLampe();
  }

  automodusUmschalten(): void {
    this.automodusSig.update((wert) => !wert);
    this.intervallSynchronisieren();
  }

  notfallmodusUmschalten(): void {
    const naechster = !this.notfallmodusSig();
    this.notfallmodusSig.set(naechster);
    if (!naechster) {
      this.maschine.notfallBeenden('rot');
    }
    this.intervallSynchronisieren();
  }

  entsorgen(): void {
    this.aktivenStoppen();
  }

  private intervallSynchronisieren(): void {
    this.aktivenStoppen();
    const modus = this.aktiverModus();

    if (modus === 'notfall') {
      this.maschine.notfallBlinkSchritt();
      this.aktiverStopp = this.planer.starteIntervall(
        () => this.maschine.notfallBlinkSchritt(),
        NOTFALL_INTERVALL_MS,
      );
      return;
    }

    if (modus === 'auto') {
      this.maschine.reparieren();
      this.aktiverStopp = this.planer.starteIntervall(() => {
        this.maschine.tick();
        this.maschine.reparieren();
      }, AUTO_INTERVALL_MS);
    }
  }

  private aktivenStoppen(): void {
    if (this.aktiverStopp) {
      this.aktiverStopp();
      this.aktiverStopp = null;
    }
  }
}
