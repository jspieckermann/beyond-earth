import { Service, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';

const STORAGE_KEY = 'be.moments';

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** How many personal moments ("Meine Sterne") the user has saved. Persisted on the device. */
@Service()
export class SavedMoments {
  private readonly store = inject(LocalStore);
  private readonly countState = signal(this.store.readJson(STORAGE_KEY, isCount, 0));

  readonly count = this.countState.asReadonly();

  setCount(count: number): void {
    const next = isCount(count) ? count : 0;
    this.countState.set(next);
    this.store.writeJson(STORAGE_KEY, next);
  }
}
