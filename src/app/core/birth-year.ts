import { Service, inject, signal } from '@angular/core';
import { CLOCK } from './clock';
import { LocalStore } from './local-store';

const STORAGE_KEY = 'be.birthYear';

/**
 * The user's birth year, optional and only on this device. Used for the age on other planets
 * (Modul A) and the birth star (Modul D).
 */
@Service()
export class BirthYear {
  private readonly store = inject(LocalStore);
  private readonly clock = inject(CLOCK);
  private readonly state = signal<number | null>(
    this.store.readJson(STORAGE_KEY, (v): v is number | null => v === null || this.isValid(v), null),
  );

  readonly year = this.state.asReadonly();

  /** A whole year from 1900 up to and including the current year. */
  isValid(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1900 && value <= this.clock().getFullYear();
  }

  set(year: number): void {
    if (!this.isValid(year)) {
      return;
    }
    this.state.set(year);
    this.store.writeJson(STORAGE_KEY, year);
  }

  clear(): void {
    this.state.set(null);
    this.store.writeJson(STORAGE_KEY, null);
  }
}
