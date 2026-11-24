import { Service, computed, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';
import { ModuleId, isModuleId } from './models';

/** Explored modules under the current letters (A–F, with C "Das galaktische Jahr"). */
const STORAGE_KEY = 'be.explored.v3';
/** Explored modules under the letters before "Das galaktische Jahr" became C (C Zeitmaschine, D Sterne zählen, E galaktisches Jahr). */
const PREVIOUS_KEY = 'be.explored.v2';
/** Explored modules under the letters of the first version, with the Sandkorn-Welt as B. */
const LEGACY_KEY = 'be.explored';
/** Previous letter → current letter. */
const PREVIOUS_LETTERS: Readonly<Record<string, ModuleId>> = { A: 'A', B: 'B', C: 'D', D: 'E', E: 'C', F: 'F' };
/** First-version letter → current letter; the old B, "Die Sandkorn-Welt", no longer exists and is dropped. */
const LEGACY_LETTERS: Readonly<Record<string, ModuleId>> = { A: 'A', C: 'B', D: 'D', E: 'E', F: 'C', G: 'F' };

const isList = (value: unknown): value is unknown[] => Array.isArray(value);

/** Which modules the user has explored in depth. Persisted on the device. */
@Service()
export class ExplorationProgress {
  private readonly store = inject(LocalStore);
  private readonly explored = signal<ReadonlySet<ModuleId>>(this.load());

  readonly exploredIds = computed(() => this.explored());

  isExplored(id: ModuleId): boolean {
    return this.explored().has(id);
  }

  markExplored(id: ModuleId): void {
    this.explored.update((current) => new Set([...current, id]));
    this.store.writeJson(STORAGE_KEY, [...this.explored()]);
  }

  /** Reads the current store; on the first visit after a renumbering, carries an older store over once. */
  private load(): ReadonlySet<ModuleId> {
    if (this.store.read(STORAGE_KEY) !== null) {
      return new Set(this.store.readJson(STORAGE_KEY, isList, []).filter(isModuleId));
    }
    for (const [key, letters] of [
      [PREVIOUS_KEY, PREVIOUS_LETTERS],
      [LEGACY_KEY, LEGACY_LETTERS],
    ] as const) {
      if (this.store.read(key) !== null) {
        return this.migrate(key, letters);
      }
    }
    return new Set();
  }

  private migrate(key: string, letters: Readonly<Record<string, ModuleId>>): ReadonlySet<ModuleId> {
    const migrated = new Set(
      this.store
        .readJson(key, isList, [])
        .filter((v): v is string => typeof v === 'string' && v in letters)
        .map((v) => letters[v]),
    );
    this.store.writeJson(STORAGE_KEY, [...migrated]);
    this.store.remove(key);
    return migrated;
  }
}
