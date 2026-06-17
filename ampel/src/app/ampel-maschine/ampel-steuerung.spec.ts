import { AmpelMaschine } from './ampel-maschine';
import {
  AUTO_INTERVALL_MS,
  AmpelSteuerung,
  NOTFALL_INTERVALL_MS,
} from './ampel-steuerung';
import { TickPlaner, TickStopp } from './tick-planer';

interface IntervallEintrag {
  readonly callback: () => void;
  readonly ms: number;
  aktiv: boolean;
}

class FakeTickPlaner extends TickPlaner {
  readonly eintraege: IntervallEintrag[] = [];

  override starteIntervall(callback: () => void, ms: number): TickStopp {
    const eintrag: IntervallEintrag = { callback, ms, aktiv: true };
    this.eintraege.push(eintrag);
    return () => {
      eintrag.aktiv = false;
    };
  }

  aktive(): IntervallEintrag[] {
    return this.eintraege.filter((e) => e.aktiv);
  }
}

describe('AmpelSteuerung', () => {
  let maschine: AmpelMaschine;
  let planer: FakeTickPlaner;
  let steuerung: AmpelSteuerung;

  beforeEach(() => {
    maschine = new AmpelMaschine();
    planer = new FakeTickPlaner();
    steuerung = new AmpelSteuerung(maschine, planer);
  });

  function einzigesAktivesIntervall(): IntervallEintrag {
    const aktive = planer.aktive();
    expect(aktive.length).toBe(1);
    return aktive[0];
  }

  it('startet im manuellen Modus ohne aktives Intervall', () => {
    expect(steuerung.aktiverModus()).toBe('manuell');
    expect(steuerung.zeigeManuelleSteuerung()).toBeTrue();
    expect(planer.aktive().length).toBe(0);
  });

  it('schaltet im manuellen Modus per tickManuell() den Zyklus weiter', () => {
    expect(maschine.phase()).toBe('rot');
    steuerung.tickManuell();
    expect(maschine.phase()).toBe('gruen-kommt');
    steuerung.tickManuell();
    expect(maschine.phase()).toBe('gruen');
    steuerung.tickManuell();
    expect(maschine.phase()).toBe('rot-kommt');
    steuerung.tickManuell();
    expect(maschine.phase()).toBe('rot');
  });

  it('ignoriert tickManuell() im Automodus und im Notfallmodus', () => {
    steuerung.automodusUmschalten();
    const phaseImAuto = maschine.phase();
    steuerung.tickManuell();
    expect(maschine.phase()).toBe(phaseImAuto);

    steuerung.automodusUmschalten();
    steuerung.notfallmodusUmschalten();
    const phaseImNotfall = maschine.phase();
    steuerung.tickManuell();
    expect(maschine.phase()).toBe(phaseImNotfall);
  });

  it('schaltet die Ampel im manuellen Modus aus', () => {
    steuerung.ausschalten();
    expect(maschine.phase()).toBe('aus');
  });

  it('startet im Automodus genau ein 1-Sekunden-Intervall, das tick() ausfuehrt', () => {
    steuerung.automodusUmschalten();

    const eintrag = einzigesAktivesIntervall();
    expect(eintrag.ms).toBe(AUTO_INTERVALL_MS);
    expect(maschine.phase()).toBe('rot');

    eintrag.callback();
    expect(maschine.phase()).toBe('gruen-kommt');
    eintrag.callback();
    expect(maschine.phase()).toBe('gruen');
  });

  it('repariert beim Aktivieren des Automodus alle defekten Lampen', () => {
    maschine.meldeDefekt('rot');
    maschine.meldeDefekt('gelb');
    expect(maschine.hatDefekt()).toBeTrue();

    steuerung.automodusUmschalten();
    expect(maschine.hatDefekt()).toBeFalse();
  });

  it('repariert auch waehrend des Automodus bei jedem Takt', () => {
    steuerung.automodusUmschalten();
    maschine.meldeDefekt('gruen');
    expect(maschine.hatDefekt()).toBeTrue();

    einzigesAktivesIntervall().callback();
    expect(maschine.hatDefekt()).toBeFalse();
  });

  it('stoppt das Automodus-Intervall beim Deaktivieren', () => {
    steuerung.automodusUmschalten();
    expect(planer.aktive().length).toBe(1);

    steuerung.automodusUmschalten();
    expect(steuerung.aktiverModus()).toBe('manuell');
    expect(planer.aktive().length).toBe(0);
  });

  it('startet im Notfallmodus ein kurzes Blink-Intervall (< Automodus)', () => {
    steuerung.notfallmodusUmschalten();

    const eintrag = einzigesAktivesIntervall();
    expect(eintrag.ms).toBe(NOTFALL_INTERVALL_MS);
    expect(NOTFALL_INTERVALL_MS).toBeLessThan(AUTO_INTERVALL_MS);
  });

  it('blinkt im Notfallmodus zwischen "rot-kommt" und "aus"', () => {
    steuerung.notfallmodusUmschalten();
    expect(maschine.phase()).toBe('rot-kommt');

    const eintrag = einzigesAktivesIntervall();
    eintrag.callback();
    expect(maschine.phase()).toBe('aus');
    eintrag.callback();
    expect(maschine.phase()).toBe('rot-kommt');
  });

  it('gibt dem Notfallmodus Vorrang vor dem Automodus', () => {
    steuerung.automodusUmschalten();
    expect(einzigesAktivesIntervall().ms).toBe(AUTO_INTERVALL_MS);

    steuerung.notfallmodusUmschalten();
    const eintrag = einzigesAktivesIntervall();
    expect(eintrag.ms).toBe(NOTFALL_INTERVALL_MS);
    expect(steuerung.aktiverModus()).toBe('notfall');
    expect(maschine.phase()).toBe('rot-kommt');
  });

  it('kehrt nach dem Beenden des Notfallmodus in den Automodus zurueck', () => {
    steuerung.automodusUmschalten();
    steuerung.notfallmodusUmschalten();
    expect(steuerung.aktiverModus()).toBe('notfall');

    steuerung.notfallmodusUmschalten();
    expect(steuerung.aktiverModus()).toBe('auto');

    const eintrag = einzigesAktivesIntervall();
    expect(eintrag.ms).toBe(AUTO_INTERVALL_MS);
    expect(maschine.phase()).toBe('rot');
  });

  it('kehrt nach dem Beenden des Notfallmodus in den manuellen Modus zurueck, wenn Auto aus war', () => {
    steuerung.notfallmodusUmschalten();
    expect(steuerung.aktiverModus()).toBe('notfall');

    steuerung.notfallmodusUmschalten();
    expect(steuerung.aktiverModus()).toBe('manuell');
    expect(planer.aktive().length).toBe(0);
    expect(maschine.phase()).toBe('rot');
  });

  it('blendet manuelle Steuerung im Auto- und Notfallmodus aus', () => {
    expect(steuerung.zeigeManuelleSteuerung()).toBeTrue();

    steuerung.automodusUmschalten();
    expect(steuerung.zeigeManuelleSteuerung()).toBeFalse();

    steuerung.notfallmodusUmschalten();
    expect(steuerung.zeigeManuelleSteuerung()).toBeFalse();
  });

  it('defektSimulieren erzeugt im manuellen Modus genau einen neuen Defekt', () => {
    steuerung.defektSimulieren();
    expect(maschine.defekteLampen().size).toBe(1);
  });

  it('defektSimulieren wirkt nicht im Automodus', () => {
    steuerung.automodusUmschalten();
    steuerung.defektSimulieren();
    expect(maschine.defekteLampen().size).toBe(0);
  });

  it('reparieren behebt alle Defekte sofort', () => {
    maschine.meldeDefekt('rot');
    maschine.meldeDefekt('gelb');
    steuerung.reparieren();
    expect(maschine.hatDefekt()).toBeFalse();
  });

  it('entsorgen stoppt alle aktiven Intervalle (Teardown)', () => {
    steuerung.automodusUmschalten();
    expect(planer.aktive().length).toBe(1);

    steuerung.entsorgen();
    expect(planer.aktive().length).toBe(0);
  });

  it('haelt nie mehr als ein Intervall gleichzeitig', () => {
    steuerung.automodusUmschalten();
    steuerung.notfallmodusUmschalten();
    steuerung.automodusUmschalten();
    steuerung.notfallmodusUmschalten();
    steuerung.automodusUmschalten();

    expect(planer.aktive().length).toBeLessThanOrEqual(1);
  });
});
