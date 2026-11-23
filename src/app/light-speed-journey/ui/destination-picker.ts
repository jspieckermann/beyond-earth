import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { Destination, searchDestinations } from '../data/destinations';

/** Step "Ziel": every place of Modul A in a dialog, grouped by its stages and searchable by name. */
@Component({
  selector: 'app-destination-picker',
  template: `
    <dialog #dialog aria-labelledby="picker-title" (cancel)="$event.preventDefault(); closed.emit()">
      <div class="head">
        <h2 id="picker-title">Ziel wählen</h2>
        <button type="button" class="icon" aria-label="Schliessen" (click)="closed.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <label class="search">
        <span>Suchen</span>
        <input #search type="search" autocomplete="off" [value]="query()" (input)="query.set(value($event))" />
      </label>
      <p class="count" role="status">{{ countText() }}</p>
      <div class="groups">
        @for (g of groups(); track g.stage) {
          <section [attr.aria-labelledby]="'group-' + g.stage">
            <h3 [id]="'group-' + g.stage">{{ g.title }}</h3>
            <ul>
              @for (d of g.destinations; track d.id) {
                <li>
                  <button type="button" [attr.aria-current]="d.id === current() ? 'true' : null" (click)="chosen.emit(d)">
                    <span class="name">{{ d.name }}</span>
                    <span class="distance">{{ d.distanceLabel }}</span>
                  </button>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </dialog>
  `,
  styleUrl: './destination-picker.css',
})
export class DestinationPicker {
  /** Id of the current destination. */
  readonly current = input.required<string>();
  readonly chosen = output<Destination>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly search = viewChild.required<ElementRef<HTMLInputElement>>('search');
  protected readonly query = signal('');
  protected readonly groups = computed(() => searchDestinations(this.query()));
  protected readonly countText = computed(() => {
    const n = this.groups().reduce((sum, g) => sum + g.destinations.length, 0);
    return n === 0 ? 'Kein Ziel gefunden.' : n === 1 ? 'Ein Ziel' : `${n} Ziele`;
  });

  private readonly opener = (globalThis.document?.activeElement as HTMLElement | null) ?? null;

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      this.search().nativeElement.focus();
    });
    inject(DestroyRef).onDestroy(() => this.opener?.focus?.());
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
