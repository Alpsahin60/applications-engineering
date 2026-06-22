/**
 * Test-Suite gegen den Library-Service `GradeCalculator`
 * (@tschuegge/angular-coding-resources).
 *
 * Der Library-Service enthaelt ABSICHTLICH zwei Fehler, damit das Testen geuebt
 * werden kann. Diese Suite weist beide Fehler nach: die beiden Tests in
 * `describe('Aufgedeckte Fehler im Library-Service')` schlagen BEWUSST fehl
 * (RED). Genau dieser Fehlschlag ist der Beleg, dass die Tests die Maengel im
 * Service finden. Die korrigierte Variante wird in `grade-calculator-fixed.ts`
 * implementiert und in `grade-calculator-fixed.spec.ts` vollstaendig gruen
 * getestet.
 *
 * Schweizer Notenskala 1-6 (6 = Bestnote), gerundet auf 1/10:
 *   Note = Math.round(((pointsReached / pointsMaximum) * 5 + 1) * 10) / 10
 *
 * Alle Tests folgen dem AAA-Pattern (Arrange / Act / Assert).
 */
import { TestBed } from '@angular/core/testing';
import { GradeCalculator } from '@tschuegge/angular-coding-resources';

describe('GradeCalculator (Library-Service)', () => {
  let gradeCalc: GradeCalculator;

  beforeEach(() => {
    // Arrange (gemeinsam): Service ueber das DI-System beziehen
    TestBed.configureTestingModule({});
    gradeCalc = TestBed.inject(GradeCalculator);
  });

  describe('Smoke', () => {
    it('should be created', () => {
      // Assert: Service ist vorhanden
      expect(gradeCalc).toBeTruthy();
    });
  });

  describe('Korrekte Berechnung', () => {
    it('should return 1.0 for 0 of 100 points', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(0, 100);
      // Assert
      expect(note).toBe(1.0);
    });

    it('should return 6.0 for 100 of 100 points', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(100, 100);
      // Assert
      expect(note).toBe(6.0);
    });

    it('should return 3.5 for 50 of 100 points', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(50, 100);
      // Assert
      expect(note).toBe(3.5);
    });

    it('should return 5.0 for 80 of 100 points', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(80, 100);
      // Assert
      expect(note).toBe(5.0);
    });

    it('should return 2.3 for 25 of 100 points (rounding 2.25 -> 2.3)', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(25, 100);
      // Assert
      expect(note).toBe(2.3);
    });

    it('should return 2.7 for 33 of 100 points (rounding 2.65 -> 2.7)', () => {
      // Act
      const note = gradeCalc.calcGradeByPoints(33, 100);
      // Assert
      expect(note).toBe(2.7);
    });
  });

  describe('Fehlerbehandlung (funktioniert)', () => {
    it('should throw for negative pointsReached', () => {
      // Act + Assert: negative erreichte Punkte -> Error
      expect(() => gradeCalc.calcGradeByPoints(-5, 100)).toThrow();
    });

    it('should throw for negative pointsMaximum', () => {
      // Act + Assert: negatives Maximum -> Error
      expect(() => gradeCalc.calcGradeByPoints(50, -100)).toThrow();
    });
  });

  describe('Aufgedeckte Fehler im Library-Service', () => {
    // ====== DIESE ZWEI TESTS SCHLAGEN ABSICHTLICH FEHL (RED) ======

    it('Fehler A: should throw when pointsMaximum is 0 (statt Division durch 0)', () => {
      // Arrange/Act/Assert
      // Soll: Error (Division durch 0 muss abgefangen werden)
      // Ist:  Service prueft `pointsMaximum < 0` statt `<= 0`
      //       -> 0/0 = NaN wird zurueckgegeben, KEIN Error -> Test wird ROT.
      expect(() => gradeCalc.calcGradeByPoints(0, 0)).toThrow();
    });

    it('Fehler B: should throw when pointsReached exceeds pointsMaximum (statt Note 7.0)', () => {
      // Arrange/Act/Assert
      // Soll: Error (mehr Punkte als Maximum ist unzulaessig)
      // Ist:  Die Pruefung `pointsReached > pointsMaximum` ist auskommentiert
      //       -> 120/100 liefert die ungueltige Note 7.0, KEIN Error -> Test wird ROT.
      expect(() => gradeCalc.calcGradeByPoints(120, 100)).toThrow();
    });
  });
});
