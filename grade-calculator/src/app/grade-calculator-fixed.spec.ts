/**
 * Test-Suite gegen die korrigierte Implementierung `GradeCalculatorFixed`.
 *
 * Es ist dieselbe Suite wie in `grade-calculator-test.spec.ts` (gegen den
 * Library-Service), erweitert um parametrisierte Tabellen-Tests, Property-Based-
 * Tests (fast-check) und eine Randwertanalyse. Hier sind ALLE Tests gruen -
 * insbesondere die beiden Faelle, die beim Library-Service rot sind (Fehler A
 * und B), werfen jetzt korrekt einen Error.
 *
 * Alle Tests folgen dem AAA-Pattern (Arrange / Act / Assert).
 */
import { TestBed } from '@angular/core/testing';
import fc from 'fast-check';
import { GradeCalculatorFixed } from './grade-calculator-fixed';

describe('GradeCalculatorFixed', () => {
  let gradeCalc: GradeCalculatorFixed;

  beforeEach(() => {
    // Arrange (gemeinsam): Service ueber das DI-System beziehen
    TestBed.configureTestingModule({});
    gradeCalc = TestBed.inject(GradeCalculatorFixed);
  });

  describe('Smoke', () => {
    it('should be created', () => {
      expect(gradeCalc).toBeTruthy();
    });
  });

  describe('Korrekte Berechnung', () => {
    it('should return 1.0 for 0 of 100 points', () => {
      expect(gradeCalc.calcGradeByPoints(0, 100)).toBe(1.0);
    });

    it('should return 6.0 for 100 of 100 points', () => {
      expect(gradeCalc.calcGradeByPoints(100, 100)).toBe(6.0);
    });

    it('should return 3.5 for 50 of 100 points', () => {
      expect(gradeCalc.calcGradeByPoints(50, 100)).toBe(3.5);
    });

    it('should return 5.0 for 80 of 100 points', () => {
      expect(gradeCalc.calcGradeByPoints(80, 100)).toBe(5.0);
    });

    it('should return 2.3 for 25 of 100 points (rounding 2.25 -> 2.3)', () => {
      expect(gradeCalc.calcGradeByPoints(25, 100)).toBe(2.3);
    });

    it('should return 2.7 for 33 of 100 points (rounding 2.65 -> 2.7)', () => {
      expect(gradeCalc.calcGradeByPoints(33, 100)).toBe(2.7);
    });
  });

  describe('Parametrisierte Tabellen-Tests', () => {
    // [pointsReached, pointsMaximum, erwarteteNote]
    const cases: readonly [number, number, number][] = [
      [0, 100, 1.0],
      [100, 100, 6.0],
      [50, 100, 3.5],
      [80, 100, 5.0],
      [25, 100, 2.3],
      [33, 100, 2.7],
      [60, 100, 4.0],
      [40, 100, 3.0],
      [10, 20, 3.5], // gleiche Quote wie 50/100
    ];

    it.each(cases)('should return %s/%s -> Note %s', (reached, max, expected) => {
      // Act
      const note = gradeCalc.calcGradeByPoints(reached, max);
      // Assert
      expect(note).toBe(expected);
    });
  });

  describe('Fehlerbehandlung (funktioniert)', () => {
    it('should throw for negative pointsReached', () => {
      expect(() => gradeCalc.calcGradeByPoints(-5, 100)).toThrow();
    });

    it('should throw for negative pointsMaximum', () => {
      expect(() => gradeCalc.calcGradeByPoints(50, -100)).toThrow();
    });
  });

  describe('Behobene Fehler (beim Library-Service rot, hier gruen)', () => {
    it('Fehler A behoben: should throw when pointsMaximum is 0', () => {
      // Soll & Ist: Error wegen Division durch 0 (Guard `pointsMaximum <= 0`)
      expect(() => gradeCalc.calcGradeByPoints(0, 0)).toThrow();
    });

    it('Fehler B behoben: should throw when pointsReached exceeds pointsMaximum', () => {
      // Soll & Ist: Error, weil mehr Punkte als das Maximum unzulaessig sind
      expect(() => gradeCalc.calcGradeByPoints(120, 100)).toThrow();
    });
  });

  describe('Randwertanalyse', () => {
    it('untere Grenze: 0 Punkte -> 1.0', () => {
      expect(gradeCalc.calcGradeByPoints(0, 100)).toBe(1.0);
    });

    it('obere Grenze: reached == max -> 6.0', () => {
      expect(gradeCalc.calcGradeByPoints(100, 100)).toBe(6.0);
    });

    it('knapp ueber dem Maximum: 101/100 -> Error', () => {
      expect(() => gradeCalc.calcGradeByPoints(101, 100)).toThrow();
    });

    it('negativer Wert: -1 Punkt -> Error', () => {
      expect(() => gradeCalc.calcGradeByPoints(-1, 100)).toThrow();
    });

    it('maximum == 0 -> Error (keine Division durch 0)', () => {
      expect(() => gradeCalc.calcGradeByPoints(0, 0)).toThrow();
    });

    it('gebrochene Punkte: 45.5/100 -> 3.3', () => {
      // (0.455 * 5 + 1) = 3.275 -> Math.round(32.75) = 33 -> 3.3
      expect(gradeCalc.calcGradeByPoints(45.5, 100)).toBe(3.3);
    });

    it('sehr grosse Zahlen: 1_000_000/2_000_000 -> 3.5', () => {
      expect(gradeCalc.calcGradeByPoints(1_000_000, 2_000_000)).toBe(3.5);
    });
  });

  describe('Property-Based-Tests (fast-check)', () => {
    it('gueltige Eingaben (0 <= reached <= max, max > 0) liefern stets 1 <= Note <= 6', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100_000 }),
          fc.double({ min: 0, max: 1, noNaN: true }),
          (max, ratio) => {
            // Arrange: reached liegt garantiert in [0, max]
            const reached = Math.floor(ratio * max);
            // Act
            const note = gradeCalc.calcGradeByPoints(reached, max);
            // Assert
            return note >= 1 && note <= 6;
          },
        ),
      );
    });

    it('Monotonie: mehr Punkte bei gleichem max ergeben keine kleinere Note', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100_000 }),
          fc.integer({ min: 0, max: 100_000 }),
          fc.integer({ min: 0, max: 100_000 }),
          (max, a, b) => {
            // Arrange: erst in [0, max] abbilden, DANN sortieren - sonst zer-
            // stoert das Modulo die Ordnung der beiden Punktezahlen.
            const r1 = a % (max + 1);
            const r2 = b % (max + 1);
            const lower = Math.min(r1, r2);
            const higher = Math.max(r1, r2);
            // Act
            const noteLower = gradeCalc.calcGradeByPoints(lower, max);
            const noteHigher = gradeCalc.calcGradeByPoints(higher, max);
            // Assert
            return noteHigher >= noteLower;
          },
        ),
      );
    });

    it('Ergebnis ist stets auf 1/10 gerundet (Note * 10 ganzzahlig)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100_000 }),
          fc.double({ min: 0, max: 1, noNaN: true }),
          (max, ratio) => {
            // Arrange
            const reached = Math.floor(ratio * max);
            // Act
            const note = gradeCalc.calcGradeByPoints(reached, max);
            // Assert: note * 10 muss (bis auf Float-Toleranz) ganzzahlig sein
            const scaled = note * 10;
            return Math.abs(scaled - Math.round(scaled)) < 1e-9;
          },
        ),
      );
    });
  });
});
