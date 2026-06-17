import {
  LAMPEN_BEZEICHNUNG,
  LAMPEN_FARBEN,
  LampenFarbe,
  lampeAriaBeschriftung,
  lampeLeuchtet,
} from './lampe.types';

describe('lampeLeuchtet', () => {
  it('leuchtet nur, wenn die Lampe an und nicht defekt ist', () => {
    expect(lampeLeuchtet(true, false)).toBeTrue();
  });

  it('leuchtet nicht, wenn die Lampe aus ist', () => {
    expect(lampeLeuchtet(false, false)).toBeFalse();
  });

  it('leuchtet nicht, wenn die Lampe defekt ist', () => {
    expect(lampeLeuchtet(true, true)).toBeFalse();
    expect(lampeLeuchtet(false, true)).toBeFalse();
  });
});

describe('lampeAriaBeschriftung', () => {
  it('meldet "an" und "aus" pro Farbe', () => {
    for (const farbe of LAMPEN_FARBEN) {
      const name = LAMPEN_BEZEICHNUNG[farbe];
      expect(lampeAriaBeschriftung(farbe, true, false)).toBe(`Lampe ${name}: an`);
      expect(lampeAriaBeschriftung(farbe, false, false)).toBe(`Lampe ${name}: aus`);
    }
  });

  it('meldet bei Defekt immer "defekt", unabhaengig vom an/aus-Zustand', () => {
    const farbe: LampenFarbe = 'gelb';
    const name = LAMPEN_BEZEICHNUNG[farbe];
    expect(lampeAriaBeschriftung(farbe, true, true)).toBe(`Lampe ${name}: defekt`);
    expect(lampeAriaBeschriftung(farbe, false, true)).toBe(`Lampe ${name}: defekt`);
  });
});
