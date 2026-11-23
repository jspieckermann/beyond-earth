import { InjectionToken, Service, inject } from '@angular/core';

/** The browser's storage, or null when it is unavailable (private mode, blocked site data, SSR). */
export const BROWSER_STORAGE = new InjectionToken<Storage | null>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  },
});

/**
 * Small, failure-tolerant key/value store on top of localStorage.
 * Every access is guarded; values are mirrored in memory so the app keeps
 * working for the current visit even when the browser refuses to store them.
 */
@Service()
export class LocalStore {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly memory = new Map<string, string>();

  read(key: string): string | null {
    const cached = this.memory.get(key);
    if (cached !== undefined) {
      return cached;
    }
    try {
      return this.storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  write(key: string, value: string): void {
    this.memory.set(key, value);
    try {
      this.storage?.setItem(key, value);
    } catch {
      // Storage full or blocked: the in-memory copy keeps this visit working.
    }
  }

  remove(key: string): void {
    this.memory.delete(key);
    try {
      this.storage?.removeItem(key);
    } catch {
      // Blocked storage: nothing to remove.
    }
  }

  readJson<T>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
    const raw = this.read(key);
    if (raw === null) {
      return fallback;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  writeJson(key: string, value: unknown): void {
    this.write(key, JSON.stringify(value));
  }
}
