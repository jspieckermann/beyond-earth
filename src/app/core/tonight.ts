import { Service, computed, inject, signal } from '@angular/core';
import { CLOCK } from './clock';
import { LocalStore } from './local-store';
import { DarknessLevel, StoredPlace, TonightInfo, isDarknessLevel } from './models';

export const PLACE_KEY = 'be.tonight.place.v1';
export const DARKNESS_KEY = 'be.tonight.darkness.v1';
/** Missions of the first version; no longer used, removed when the place is forgotten. */
export const OLD_MISSIONS_KEY = 'be.tonight.missions.v1';

function isStoredPlace(value: unknown): value is StoredPlace {
  const p = value as Partial<StoredPlace> | null;
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof p.name === 'string' &&
    typeof p.lat === 'number' &&
    typeof p.lon === 'number' &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lon) <= 180 &&
    typeof p.tz === 'string' &&
    (p.source === 'list' || p.source === 'device')
  );
}

type Summary = Omit<TonightInfo, 'location' | 'darkness'>;

/**
 * Heute Nacht: the chosen place and how dark it is there, both stored on the device only.
 * Also computes the short summary for the home-screen card; its calculation is loaded with a dynamic import after
 * the home screen has rendered, so the astronomy library never weighs on the home chunk.
 * The browser is never asked for the device location here.
 */
@Service()
export class TonightService {
  private readonly store = inject(LocalStore);
  private readonly clock = inject(CLOCK);

  private readonly placeState = signal<StoredPlace | null>(this.store.readJson(PLACE_KEY, isStoredPlace, null));
  private readonly darknessState = signal<DarknessLevel | null>(this.readDarkness());
  private readonly summaryState = signal<{ readonly key: string; readonly value: Summary } | null>(null);

  /** `null` means: no place chosen yet. */
  readonly place = this.placeState.asReadonly();
  readonly darkness = this.darknessState.asReadonly();

  private readonly key = computed(() => {
    const p = this.placeState();
    const d = this.darknessState();
    return p && d ? `${p.lat},${p.lon},${p.tz},${d}` : null;
  });

  /** The card's content: `null` until a place and its darkness are known; „…“ while tonight is being calculated. */
  readonly info = computed<TonightInfo | null>(() => {
    const p = this.placeState();
    const d = this.darknessState();
    if (!p || !d) {
      return null;
    }
    const summary = this.summaryState();
    const value = summary && summary.key === this.key() ? summary.value : { headline: '…' };
    return { location: p.name, darkness: d, ...value };
  });

  choosePlace(place: StoredPlace): void {
    this.placeState.set(place);
    this.store.writeJson(PLACE_KEY, place);
  }

  setDarkness(level: DarknessLevel): void {
    this.darknessState.set(level);
    this.store.write(DARKNESS_KEY, String(level));
  }

  /** „Ort vergessen“: place and darkness leave the device (and the unused mission list of the first version). */
  forget(): void {
    this.placeState.set(null);
    this.darknessState.set(null);
    this.summaryState.set(null);
    this.store.remove(PLACE_KEY);
    this.store.remove(DARKNESS_KEY);
    this.store.remove(OLD_MISSIONS_KEY);
  }

  /** Calculates tonight's summary for the card. The calculation code is only loaded now. */
  async refresh(): Promise<void> {
    const p = this.placeState();
    const d = this.darknessState();
    const key = this.key();
    if (!p || !d || !key) {
      return;
    }
    const { summarize } = await import('../tonight/engine/summary');
    const s = summarize(p, d, this.clock());
    if (this.key() === key) {
      this.summaryState.set({ key, value: { headline: s.headline, darkFrom: s.darkFrom, moon: s.moon, milkyWayNext: s.milkyWayNext } });
    }
  }

  private readDarkness(): DarknessLevel | null {
    const level = Number(this.store.read(DARKNESS_KEY));
    return isDarknessLevel(level) ? level : null;
  }
}
