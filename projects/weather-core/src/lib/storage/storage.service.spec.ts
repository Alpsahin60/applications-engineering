import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function configure(platform: 'browser' | 'server'): StorageService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }],
    });
    return TestBed.inject(StorageService);
  }

  it('schreibt und liest Werte im Browser', () => {
    const svc = configure('browser');
    svc.write('foo', 'bar');
    expect(svc.read('foo')).toBe('bar');
  });

  it('entfernt Werte', () => {
    const svc = configure('browser');
    svc.write('foo', 'bar');
    svc.remove('foo');
    expect(svc.read('foo')).toBeNull();
  });

  it('liefert null fuer fehlende Keys', () => {
    const svc = configure('browser');
    expect(svc.read('unknown')).toBeNull();
  });

  it('macht ausserhalb des Browsers nichts', () => {
    const svc = configure('server');
    svc.write('foo', 'bar');
    expect(svc.read('foo')).toBeNull();
  });

  it('schluckt Quotenfehler beim Schreiben', () => {
    const svc = configure('browser');
    const original = window.localStorage.setItem;
    spyOn(window.localStorage, 'setItem').and.callFake((key: string) => {
      if (key === '__storage_probe__') {
        return;
      }
      throw new DOMException('QuotaExceededError');
    });
    expect(() => svc.write('foo', 'bar')).not.toThrow();
    (window.localStorage.setItem as unknown) = original;
  });
});
