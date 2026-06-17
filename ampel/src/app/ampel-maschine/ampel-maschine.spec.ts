import {
  AmpelMaschine,
  PHASEN_ZYKLUS,
  Phase,
  naechstePhase,
  sollLeuchten,
} from './ampel-maschine';

describe('naechstePhase', () => {
  it('schaltet den Normalzyklus 1 -> 2 -> 3 -> 4 -> 1', () => {
    expect(naechstePhase('rot')).toBe('gruen-kommt');
    expect(naechstePhase('gruen-kommt')).toBe('gruen');
    expect(naechstePhase('gruen')).toBe('rot-kommt');
    expect(naechstePhase('rot-kommt')).toBe('rot');
  });

  it('startet aus dem Aus-Zustand wieder bei Rot', () => {
    expect(naechstePhase('aus')).toBe('rot');
  });
});

describe('sollLeuchten (CH-Schema)', () => {
  const erwartet: Record<Phase, [boolean, boolean, boolean]> = {
    rot: [true, false, false],
    'gruen-kommt': [true, true, false],
    gruen: [false, false, true],
    'rot-kommt': [false, true, false],
    aus: [false, false, false],
  };

  for (const phase of Object.keys(erwartet) as Phase[]) {
    it(`liefert das richtige Lampenbild fuer "${phase}"`, () => {
      const [rot, gelb, gruen] = erwartet[phase];
      expect(sollLeuchten(phase, 'rot')).toBe(rot);
      expect(sollLeuchten(phase, 'gelb')).toBe(gelb);
      expect(sollLeuchten(phase, 'gruen')).toBe(gruen);
    });
  }
});

describe('AmpelMaschine', () => {
  let maschine: AmpelMaschine;

  beforeEach(() => {
    maschine = new AmpelMaschine();
  });

  it('startet im Zustand "rot"', () => {
    expect(maschine.phase()).toBe('rot');
  });

  it('tick() durchlaeuft den vollen Zyklus 1->2->3->4->1', () => {
    const reihenfolge: Phase[] = [];
    for (let i = 0; i < PHASEN_ZYKLUS.length + 1; i++) {
      reihenfolge.push(maschine.phase());
      maschine.tick();
    }
    expect(reihenfolge).toEqual(['rot', 'gruen-kommt', 'gruen', 'rot-kommt', 'rot']);
  });

  it('tick() startet aus "aus" wieder bei "rot"', () => {
    maschine.setzePhase('aus');
    maschine.tick();
    expect(maschine.phase()).toBe('rot');
  });

  it('liefert ueber lampen() konsistente Visualisierung', () => {
    maschine.setzePhase('gruen-kommt');
    const an = new Map(maschine.lampen().map((l) => [l.farbe, l.an]));
    expect(an.get('rot')).toBeTrue();
    expect(an.get('gelb')).toBeTrue();
    expect(an.get('gruen')).toBeFalse();
  });

  it('meldet Defekte und reagiert auf reparieren()', () => {
    expect(maschine.hatDefekt()).toBeFalse();
    maschine.meldeDefekt('gelb');
    expect(maschine.hatDefekt()).toBeTrue();
    expect(maschine.defekteLampen().has('gelb')).toBeTrue();
    maschine.reparieren();
    expect(maschine.hatDefekt()).toBeFalse();
    expect(maschine.defekteLampen().size).toBe(0);
  });

  it('lampen() markiert defekte Lampen', () => {
    maschine.meldeDefekt('rot');
    const rot = maschine.lampen().find((l) => l.farbe === 'rot');
    expect(rot?.defekt).toBeTrue();
  });

  it('defektZufaellig mit Wahrscheinlichkeit 1 markiert alle Lampen defekt', () => {
    maschine.defektZufaellig(1, () => 0);
    expect(maschine.defekteLampen().size).toBe(3);
  });

  it('defektZufaellig mit Wahrscheinlichkeit 0 laesst alles intakt', () => {
    maschine.defektZufaellig(0);
    expect(maschine.defekteLampen().size).toBe(0);
  });

  it('notfallBlinkSchritt alterniert zwischen "rot-kommt" und "aus"', () => {
    maschine.notfallBlinkSchritt();
    expect(maschine.phase()).toBe('rot-kommt');
    maschine.notfallBlinkSchritt();
    expect(maschine.phase()).toBe('aus');
    maschine.notfallBlinkSchritt();
    expect(maschine.phase()).toBe('rot-kommt');
  });

  it('notfallBeenden setzt eine Startphase und bricht das Blinken ab', () => {
    maschine.notfallBlinkSchritt();
    maschine.notfallBlinkSchritt();
    maschine.notfallBeenden('rot');
    expect(maschine.phase()).toBe('rot');
    maschine.notfallBlinkSchritt();
    expect(maschine.phase()).toBe('rot-kommt');
  });

  it('defektEineLampe wirft genau eine intakte Lampe in den Defekt', () => {
    const farbe = maschine.defektEineLampe(() => 0);
    expect(farbe).toBe('rot');
    expect(maschine.defekteLampen().size).toBe(1);
    expect(maschine.defekteLampen().has('rot')).toBeTrue();
  });

  it('defektEineLampe ueberspringt bereits defekte Lampen', () => {
    maschine.meldeDefekt('rot');
    const farbe = maschine.defektEineLampe(() => 0);
    expect(farbe).toBe('gelb');
    expect(maschine.defekteLampen().size).toBe(2);
  });

  it('defektEineLampe gibt null zurueck, wenn alle Lampen defekt sind', () => {
    maschine.meldeDefekt('rot');
    maschine.meldeDefekt('gelb');
    maschine.meldeDefekt('gruen');
    expect(maschine.defektEineLampe(() => 0)).toBeNull();
    expect(maschine.defekteLampen().size).toBe(3);
  });
});
