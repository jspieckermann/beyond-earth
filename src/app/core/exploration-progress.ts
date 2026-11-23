import { Service, computed, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';
import { ModuleId, isModuleId } from './models';

/** Explored modules under the concept's letters (A–F). */
const STORAGE_KEY = 'be.explored.v2';
/** Explored modules under the letters of the first version, with the Sandkorn-Welt as B. */
const LEGACY_KEY = 'be.explored';
/** Old letter → new letter; the old B, "Die Sandkorn-Welt", no longer exists and is dropped. */
const LEGACY_LETTERS: Readonly<Record<string, ModuleId>> = { A: 'A', C: 'B', D: 'C', E: 'D', F: 'E', G: 'F' };

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

  /** Reads the current store; on the first visit after the renumbering, carries the old letters over once. */
  private load(): ReadonlySet<ModuleId> {
    if (this.store.read(STORAGE_KEY) !== null) {
      return new Set(this.store.readJson(STORAGE_KEY, isList, []).filter(isModuleId));
    }
    if (this.store.read(LEGACY_KEY) === null) {
      return new Set();
    }
    const migrated = new Set(
      this.store
        .readJson(LEGACY_KEY, isList, [])
        .filter((v): v is string => typeof v === 'string' && v in LEGACY_LETTERS)
        .map((v) => LEGACY_LETTERS[v]),
    );
    this.store.writeJson(STORAGE_KEY, [...migrated]);
    this.store.remove(LEGACY_KEY);
    return migrated;
  }
}
