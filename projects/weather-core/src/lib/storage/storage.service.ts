import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Duenne Kapsel um localStorage. Vorteile: testbar (kein window-Zugriff in
// Komponenten/Services), SSR-sicher, einheitliche Fehlerbehandlung wenn der
// Speicher voll oder gesperrt ist (z.B. Private Mode).

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private get available(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      const probe = '__storage_probe__';
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  read(key: string): string | null {
    if (!this.available) {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  write(key: string, value: string): void {
    if (!this.available) {
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quotenfehler oder gesperrter Speicher werden bewusst geschluckt;
      // die Persistenz ist Komfort, kein harter Vertrag.
    }
  }

  remove(key: string): void {
    if (!this.available) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // siehe write()
    }
  }
}
