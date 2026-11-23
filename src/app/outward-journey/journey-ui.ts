import { Injectable, signal } from '@angular/core';
import { BodyId, PlanetId } from './data/planets';

export type JourneyVariant = 'freies-erkunden' | 'hauptreise';
export type ShareKind = 'kronkorken' | 'muenze' | 'alter';

/** UI state of one journey that several parts share. Provided per journey component. */
@Injectable()
export class JourneyUi {
  readonly variant = signal<JourneyVariant>('freies-erkunden');
  readonly factsOpen = signal(false);
  readonly creditsOpen = signal(false);
  /** The planet, Moon or Sun open in the close-up view. */
  readonly planet = signal<BodyId | null>(null);
  /** "Planeten in die Lücke" at Erde und Mond. */
  readonly planetsInGap = signal(false);
  /** The share dialog and which card it shows first. */
  readonly share = signal<{ kinds: readonly ShareKind[]; planet?: PlanetId } | null>(null);
  /** Brief highlight of the Earth marker (selecting the Earth in the solar system). */
  readonly earthFlash = signal(0);
  /** Degrees the turning Earth of the first stage stands at, so the other drawings of the Earth match it. */
  readonly earthTurn = signal(0);

  isExplore(): boolean {
    return this.variant() === 'freies-erkunden';
  }

  closeOverlays(): void {
    this.factsOpen.set(false);
    this.creditsOpen.set(false);
  }
}
