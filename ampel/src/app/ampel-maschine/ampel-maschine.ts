import { Injectable, Signal, computed, signal } from '@angular/core';
import { LAMPEN_FARBEN, LampenFarbe } from '../lampe/lampe.types';

export type Phase = 'rot' | 'gruen-kommt' | 'gruen' | 'rot-kommt' | 'aus';

export const PHASEN_ZYKLUS: readonly Exclude<Phase, 'aus'>[] = [
  'rot',
  'gruen-kommt',
  'gruen',
  'rot-kommt',
] as const;

export const PHASEN_BEZEICHNUNG: Readonly<Record<Phase, string>> = {
  rot: 'Rot',
  'gruen-kommt': 'Gruen kommt',
  gruen: 'Gruen',
  'rot-kommt': 'Rot kommt',
  aus: 'Ampel aus',
};

const PHASEN_LAMPEN: Readonly<Record<Phase, Readonly<Record<LampenFarbe, boolean>>>> = {
  rot: { rot: true, gelb: false, gruen: false },
  'gruen-kommt': { rot: true, gelb: true, gruen: false },
  gruen: { rot: false, gelb: false, gruen: true },
  'rot-kommt': { rot: false, gelb: true, gruen: false },
  aus: { rot: false, gelb: false, gruen: false },
};

export function naechstePhase(phase: Phase): Phase {
  if (phase === 'aus') {
    return PHASEN_ZYKLUS[0];
  }
  const index = PHASEN_ZYKLUS.indexOf(phase);
  return PHASEN_ZYKLUS[(index + 1) % PHASEN_ZYKLUS.length];
}

export function sollLeuchten(phase: Phase, farbe: LampenFarbe): boolean {
  return PHASEN_LAMPEN[phase][farbe];
}

export interface LampenAnsicht {
  readonly farbe: LampenFarbe;
  readonly an: boolean;
  readonly defekt: boolean;
}

@Injectable()
export class AmpelMaschine {
  private readonly phaseSig = signal<Phase>('rot');
  private readonly defekteSig = signal<ReadonlySet<LampenFarbe>>(new Set());
  private readonly notfallBlinkAnSig = signal<boolean>(false);

  readonly phase: Signal<Phase> = this.phaseSig.asReadonly();
  readonly defekteLampen: Signal<ReadonlySet<LampenFarbe>> = this.defekteSig.asReadonly();
  readonly hatDefekt: Signal<boolean> = computed(() => this.defekteSig().size > 0);

  readonly anzeigePhase: Signal<Phase> = computed(() => this.phaseSig());

  readonly lampen: Signal<readonly LampenAnsicht[]> = computed(() => {
    const phase = this.phaseSig();
    const defekte = this.defekteSig();
    return LAMPEN_FARBEN.map((farbe) => ({
      farbe,
      an: sollLeuchten(phase, farbe),
      defekt: defekte.has(farbe),
    }));
  });

  tick(): void {
    this.phaseSig.update((aktuell) => naechstePhase(aktuell));
  }

  setzePhase(phase: Phase): void {
    this.phaseSig.set(phase);
  }

  notfallBlinkSchritt(): void {
    const naechsterZustand = !this.notfallBlinkAnSig();
    this.notfallBlinkAnSig.set(naechsterZustand);
    this.phaseSig.set(naechsterZustand ? 'rot-kommt' : 'aus');
  }

  notfallBeenden(start: Phase = 'rot'): void {
    this.notfallBlinkAnSig.set(false);
    this.phaseSig.set(start);
  }

  meldeDefekt(farbe: LampenFarbe): void {
    if (this.defekteSig().has(farbe)) {
      return;
    }
    const naechste = new Set(this.defekteSig());
    naechste.add(farbe);
    this.defekteSig.set(naechste);
  }

  defektZufaellig(wahrscheinlichkeit: number, zufall: () => number = Math.random): void {
    if (wahrscheinlichkeit <= 0) {
      return;
    }
    const grenze = Math.min(1, wahrscheinlichkeit);
    const aktuelleDefekte = this.defekteSig();
    const neueDefekte = new Set(aktuelleDefekte);
    let veraendert = false;
    for (const farbe of LAMPEN_FARBEN) {
      if (neueDefekte.has(farbe)) {
        continue;
      }
      if (zufall() < grenze) {
        neueDefekte.add(farbe);
        veraendert = true;
      }
    }
    if (veraendert) {
      this.defekteSig.set(neueDefekte);
    }
  }

  defektEineLampe(zufall: () => number = Math.random): LampenFarbe | null {
    const aktuelleDefekte = this.defekteSig();
    const intakte = LAMPEN_FARBEN.filter((farbe) => !aktuelleDefekte.has(farbe));
    if (intakte.length === 0) {
      return null;
    }
    const index = Math.min(intakte.length - 1, Math.floor(zufall() * intakte.length));
    const farbe = intakte[index];
    this.meldeDefekt(farbe);
    return farbe;
  }

  reparieren(): void {
    if (this.defekteSig().size === 0) {
      return;
    }
    this.defekteSig.set(new Set());
  }
}
