import { Service, inject } from '@angular/core';
import { JourneySettings } from '../core/journey-settings';

/** Length of the pulse when the view snaps into a stage. */
export const PULSE_MS = 12;

/** One short pulse when the view snaps into a stage, and no other vibration. */
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
