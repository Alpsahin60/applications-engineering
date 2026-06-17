import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AmpelComponent } from './ampel.component';
import { TickPlaner, TickStopp } from '../ampel-maschine/tick-planer';

@Injectable()
class StummerTickPlaner extends TickPlaner {
  override starteIntervall(): TickStopp {
    return () => undefined;
  }
}

describe('AmpelComponent (Smoketest)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AmpelComponent],
      providers: [{ provide: TickPlaner, useClass: StummerTickPlaner }],
    });
  });

  it('rendert die initiale Phase "Rot" im manuellen Betrieb', () => {
    const fixture = TestBed.createComponent(AmpelComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement.textContent ?? '') as string;
    expect(text).toContain('Rot');
    expect(text).toContain('Manueller Betrieb');

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const beschriftungen = buttons.map((b) =>
      (b.nativeElement.textContent ?? '').trim(),
    );
    expect(beschriftungen).toContain('Naechste Phase');
  });
});
