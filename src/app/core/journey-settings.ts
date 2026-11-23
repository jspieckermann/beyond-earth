import { Service, computed, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';

const STORAGE_KEY = 'be.journey';

export interface JourneyPreferences {
  readonly vibration: boolean;
}

const DEFAULTS: JourneyPreferences = { vibration: true };

const isStored = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** Keeps the known choices; entries of earlier versions (sound, narration voice) are ignored. */
function known(stored: Record<string, unknown>): Partial<JourneyPreferences> {
  return typeof stored['vibration'] === 'boolean' ? { vibration: stored['vibration'] } : {};
}

/** The vibration choice for the journeys. Persisted on the device. */
@Service()
export class JourneySettings {
  private readonly store = inject(LocalStore);
  private readonly state = signal<JourneyPreferences>({
    ...DEFAULTS,
    ...known(this.store.readJson(STORAGE_KEY, isStored, {})),
  });

  readonly vibration = computed(() => this.state().vibration);

  set(key: keyof JourneyPreferences, value: boolean): void {
    this.state.update((current) => ({ ...current, [key]: value }));
    this.store.writeJson(STORAGE_KEY, this.state());
  }

  toggle(key: keyof JourneyPreferences): void {
    this.set(key, !this.state()[key]);
  }
}
