import { Service, computed, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';
import { ModuleId, isModuleId } from './models';

const STORAGE_KEY = 'be.explored';

const isList = (value: unknown): value is unknown[] => Array.isArray(value);

/** Which modules the user has explored in depth. Persisted on the device. */
@Service()
export class ExplorationProgress {
  private readonly store = inject(LocalStore);
  private readonly explored = signal<ReadonlySet<ModuleId>>(
    new Set(this.store.readJson(STORAGE_KEY, isList, []).filter(isModuleId)),
  );

  readonly exploredIds = computed(() => this.explored());

  isExplored(id: ModuleId): boolean {
    return this.explored().has(id);
  }

  markExplored(id: ModuleId): void {
    this.explored.update((current) => new Set([...current, id]));
    this.store.writeJson(STORAGE_KEY, [...this.explored()]);
  }
}
