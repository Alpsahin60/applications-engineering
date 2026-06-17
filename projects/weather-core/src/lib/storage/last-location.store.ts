import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

// Eigene Abstraktion fuer "zuletzt gewaehlter Ort". Damit bleiben Key und
// Persistenzformat an einer Stelle und die Komponenten kennen weder den
// StorageService noch den Storage-Key.

const STORAGE_KEY = 'weather-buchs.last-location';

@Injectable({ providedIn: 'root' })
export class LastLocationStore {
  private readonly storage = inject(StorageService);

  load(): string | null {
    const value = this.storage.read(STORAGE_KEY);
    if (value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  save(location: string): void {
    const trimmed = location.trim();
    if (trimmed.length === 0) {
      this.storage.remove(STORAGE_KEY);
      return;
    }
    this.storage.write(STORAGE_KEY, trimmed);
  }

  clear(): void {
    this.storage.remove(STORAGE_KEY);
  }
}
