import { Injectable } from '@angular/core';

export type TickStopp = () => void;

@Injectable({ providedIn: 'root' })
export class TickPlaner {
  starteIntervall(callback: () => void, ms: number): TickStopp {
    const handle = setInterval(callback, ms);
    return () => clearInterval(handle);
  }
}
