import { Service, inject } from '@angular/core';
import { JourneySettings } from './journey-settings';

/** Length of the pulse. */
export const PULSE_MS = 12;

/** One short pulse when something settles (a stage of Modul A, a result of Modul B), and no other vibration. */
@Service()
export class Haptics {
  private readonly settings = inject(JourneySettings);

  pulse(): void {
    if (!this.settings.vibration()) {
      return;
    }
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav && typeof nav.vibrate === 'function') {
      nav.vibrate(PULSE_MS);
    }
  }
}
