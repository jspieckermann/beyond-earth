import { Service, signal } from '@angular/core';
import { TonightInfo } from './models';

/**
 * Tonight's sky at the user's chosen place.
 *
 * Stub: real visibility, darkness and moon calculations come in a later change.
 * Until then no place is known, so the home screen shows the honest
 * "Wo stehst du heute Nacht?" state instead of invented astronomy.
 * The browser is never asked for the device location here.
 */
@Service()
export class TonightService {
  private readonly infoState = signal<TonightInfo | null>(null);

  /** `null` means: no place chosen yet. */
  readonly info = this.infoState.asReadonly();

  update(info: TonightInfo | null): void {
    this.infoState.set(info);
  }
}
