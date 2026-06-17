export type LampenFarbe = 'rot' | 'gelb' | 'gruen';

export const LAMPEN_FARBEN: readonly LampenFarbe[] = ['rot', 'gelb', 'gruen'] as const;

export const LAMPEN_BEZEICHNUNG: Readonly<Record<LampenFarbe, string>> = {
  rot: 'Rot',
  gelb: 'Gelb',
  gruen: 'Gruen',
};

export function lampeLeuchtet(an: boolean, defekt: boolean): boolean {
  return an && !defekt;
}

export function lampeAriaBeschriftung(
  farbe: LampenFarbe,
  an: boolean,
  defekt: boolean,
): string {
  const name = LAMPEN_BEZEICHNUNG[farbe];
  if (defekt) {
    return `Lampe ${name}: defekt`;
  }
  return `Lampe ${name}: ${an ? 'an' : 'aus'}`;
}
