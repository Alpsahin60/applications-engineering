import { TestBed } from '@angular/core/testing';
import { LastLocationStore } from './last-location.store';
import { StorageService } from './storage.service';

describe('LastLocationStore', () => {
  let store: LastLocationStore;
  let storage: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storage = jasmine.createSpyObj<StorageService>('StorageService', [
      'read',
      'write',
      'remove',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }],
    });
    store = TestBed.inject(LastLocationStore);
  });

  it('speichert getrimmte Werte', () => {
    store.save('  Buchs SG  ');
    expect(storage.write).toHaveBeenCalledWith(
      'weather-buchs.last-location',
      'Buchs SG',
    );
  });

  it('entfernt den Eintrag bei leerem String', () => {
    store.save('   ');
    expect(storage.remove).toHaveBeenCalled();
    expect(storage.write).not.toHaveBeenCalled();
  });

  it('liest den Wert getrimmt zurueck', () => {
    storage.read.and.returnValue('  Zuerich  ');
    expect(store.load()).toBe('Zuerich');
  });

  it('gibt null zurueck, wenn nichts gespeichert ist', () => {
    storage.read.and.returnValue(null);
    expect(store.load()).toBeNull();
  });

  it('gibt null zurueck, wenn nur Whitespace gespeichert ist', () => {
    storage.read.and.returnValue('   ');
    expect(store.load()).toBeNull();
  });

  it('clear() entfernt den Eintrag', () => {
    store.clear();
    expect(storage.remove).toHaveBeenCalledWith('weather-buchs.last-location');
  });
});
