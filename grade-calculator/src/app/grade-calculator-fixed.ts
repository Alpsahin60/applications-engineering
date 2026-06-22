import { Injectable } from '@angular/core';

/**
 * Korrigierte Variante des Library-Service `GradeCalculator`.
 *
 * Berechnet Noten nach der schweizerischen Notenskala (1-6, 6 = Bestnote),
 * gerundet auf 1/10. Die Formel ist identisch zum Library-Service; korrigiert
 * sind ausschliesslich die beiden absichtlich eingebauten Fehler (A und B).
 */
@Injectable({ providedIn: 'root' })
export class GradeCalculatorFixed {
  /**
   * Berechnet eine Note nach der schweizerischen Notenskala.
   *
   * @param pointsReached Erreichte Anzahl Punkte (>= 0)
   * @param pointsMaximum Maximale Anzahl Punkte (> 0)
   * @returns Note gerundet auf 1/10 (1.0 - 6.0)
   * @throws Error bei ungueltigen Eingaben
   */
  calcGradeByPoints(pointsReached: number, pointsMaximum: number): number {
    // Behebt Fehler A: Pruefung `<= 0` statt `< 0` verhindert die Division
    // durch 0 (pointsMaximum = 0 lieferte zuvor NaN statt eines Errors).
    if (pointsMaximum <= 0) {
      throw new Error('pointsMaximum muss > 0 sein');
    }
    // Unveraendert korrekt: negative erreichte Punkte sind unzulaessig.
    if (pointsReached < 0) {
      throw new Error('pointsReached darf nicht negativ sein');
    }
    // Behebt Fehler B: zuvor auskommentiert; ohne diese Pruefung waren Noten
    // groesser als 6 moeglich (z. B. 120/100 -> 7.0).
    if (pointsReached > pointsMaximum) {
      throw new Error('pointsReached darf pointsMaximum nicht übersteigen');
    }

    return Math.round(((pointsReached / pointsMaximum) * 5 + 1) * 10) / 10;
  }
}
