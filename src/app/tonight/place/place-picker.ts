import { Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DarknessLevel, StoredPlace } from '../../core/models';
import { ListedPlace, darkSkySuggestions, deviceName, listedPlace, searchPlaces, suggestedDarkness } from '../data/places';
import { GEOLOCATE, deviceTimeZone, roundPosition } from './geolocation';

/** Suggestions appear from this many typed letters on. */
export const MIN_QUERY = 2;

/** A chosen place with the darkness suggested for it. */
export interface PickedPlace {
  readonly place: StoredPlace;
  readonly suggestion: DarknessLevel;
}

interface Suggestion {
  readonly place: StoredPlace;
  readonly listed: ListedPlace | null;
  readonly region: string;
}

const PRIVACY = 'Der Ort bleibt nur auf diesem Gerät, auf ein paar Kilometer gerundet.';

const fromListed = (p: ListedPlace): Suggestion => ({
  place: { name: p.name, region: p.region, lat: p.lat, lon: p.lon, tz: p.tz, source: 'list' },
  listed: p,
  region: p.dark ? `Sternenpark · ${p.region}` : p.region,
});

const fromStored = (p: StoredPlace): Suggestion => {
  const listed = listedPlace(p.name, p.lat, p.lon);
  return listed ? fromListed(listed) : { place: p, listed: null, region: p.source === 'device' ? 'Gerundeter Standort' : (p.region ?? '') };
};

const samePlace = (a: StoredPlace | null, b: StoredPlace) => !!a && a.name === b.name && a.lat === b.lat && a.lon === b.lon;

/**
 * „Stadt oder Ort suchen“: one field that shows the chosen place and searches the shipped list as a combobox with a
 * popup list, plus „Meinen Standort verwenden“ (the device location, asked only on request). Reports the chosen place
 * with a suggested darkness; the page stores it.
 */
@Component({
  selector: 'app-place-picker',
  host: { '(focusout)': 'leave($event)' },
  template: `
    <label class="label" for="place-search">Stadt oder Ort suchen</label>
    <div class="wrap">
      <div class="field" [class.chosen]="!!selected() && query() === null">
        <svg class="pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
        </svg>
        <input
          #field
          id="place-search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-describedby="place-note"
          [attr.aria-controls]="open() && suggestions().length ? 'place-list' : null"
          autocomplete="off"
          enterkeyhint="search"
          placeholder="z. B. Hamburg, Rhön"
          [attr.aria-expanded]="open()"
          [attr.aria-activedescendant]="open() && active() >= 0 ? 'place-option-' + active() : null"
          [value]="shown()"
          (focus)="start()"
          (mouseup)="keepSelection($event)"
          (input)="typed(value($event))"
          (keydown)="key($event)"
        />
        @if (shown()) {
          <button type="button" class="clear" aria-label="Eingabe löschen" (mousedown)="$event.preventDefault()" (click)="clear()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        }
      </div>
      @if (open() && (suggestions().length || searching())) {
        <div class="popup">
          @if (!searching()) {
            <p class="head">Vorschläge</p>
          }
          <ul id="place-list" role="listbox" aria-label="Orte">
          @for (s of suggestions(); track s.place.name + s.place.lat; let i = $index) {
            <li
              role="option"
              class="option"
              [id]="'place-option-' + i"
              [class.active]="i === active()"
              [attr.aria-selected]="isSelected(s)"
              (mousedown)="choose($event, s)"
            >
              <span class="text">
                <span class="name">{{ s.place.name }}</span>
                <span class="region">{{ s.region }}</span>
              </span>
              @if (isSelected(s)) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
              }
            </li>
          }
          </ul>
          @if (!suggestions().length) {
            <p class="empty">Kein Ort gefunden. Versuch es mit dem nächsten grösseren Ort.</p>
          }
        </div>
      }
    </div>
    <p class="sr-only" role="status">{{ status() }}</p>
    <div class="foot">
      <p id="place-note" class="place-note">{{ note() }}</p>
      <button type="button" class="locate" [disabled]="locating()" (click)="locate()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        {{ locating() ? 'Standort wird gesucht …' : 'Meinen Standort verwenden' }}
      </button>
    </div>
    @if (refused()) {
      <p class="refused" role="status">Dein Standort ist gerade nicht verfügbar. Such deinen Ort einfach oben.</p>
    }
    @if (skippable()) {
      <button type="button" class="link" (click)="skipped.emit()">Überspringen</button>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 8px; }
    .label { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-ink-muted); }
    .wrap { position: relative; }
    .field {
      display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; min-height: 52px;
      padding: 0 4px 0 14px; border-radius: 14px; border: 1px solid var(--color-line-strong);
      background: var(--color-night-800); color: var(--color-starlight);
    }
    .field.chosen { border-color: var(--color-accent-line); background: var(--color-accent-wash); }
    .field:focus-within { outline: 2px solid var(--color-starlight); outline-offset: 2px; }
    input {
      min-width: 0; height: 48px; padding: 0; border: 0; background: none; color: var(--color-ink-bright);
      font: inherit; font-size: 17px; font-weight: 600; outline: none;
    }
    input::placeholder { font-weight: 400; color: var(--color-ink-dim); }
    .clear {
      width: 44px; height: 44px; display: grid; place-items: center; border: 0; border-radius: 50%;
      background: none; color: var(--color-ink-soft); cursor: pointer;
    }
    .popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 5; padding: 6px;
      border-radius: 16px; border: 1px solid var(--color-line-strong); background: var(--color-night-800);
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
    }
    ul { list-style: none; margin: 0; padding: 0; }
    .head, .empty { margin: 0; padding: 8px 12px 4px; font-size: 13px; color: var(--color-ink-muted); }
    .option {
      display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px;
      padding: 8px 12px; color: var(--color-starlight); cursor: pointer;
    }
    .option + .option { border-top: 1px solid var(--color-line); }
    .option.active { outline: 2px solid var(--color-starlight); outline-offset: -2px; border-radius: 10px; }
    .option:hover .name { color: var(--color-starlight); }
    .option[aria-selected='true'] .name { color: var(--color-starlight); }
    .text { display: flex; flex-direction: column; }
    .name { font-size: 15px; font-weight: 600; color: var(--color-ink); }
    .region { font-size: 12px; color: var(--color-ink-muted); }
    .foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
    .place-note { margin: 0; font-size: 13px; color: var(--color-ink-muted); }
    .locate {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px;
      border-radius: 22px; border: 1px solid var(--color-accent-line); background: transparent; color: var(--color-starlight);
      font: inherit; font-size: 13px; cursor: pointer;
    }
    .locate:disabled { cursor: default; color: var(--color-ink-muted); }
    .refused { margin: 0; font-size: 14px; color: var(--color-ink-soft); }
    .link {
      align-self: flex-start; min-height: 44px; padding: 0; border: 0; background: none; color: var(--color-starlight);
      font: inherit; font-size: 14px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
    }
    .sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
})
export class PlacePicker {
  /** The stored place, shown in the field. */
  readonly selected = input<StoredPlace | null>(null);
  /** Offer „Überspringen“ (guided journey). */
  readonly skippable = input(false);
  readonly picked = output<PickedPlace>();
  readonly skipped = output<void>();

  private readonly geolocate = inject(GEOLOCATE);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  /** The text being typed; `null` while the field just shows the chosen place. */
  protected readonly query = signal<string | null>(null);
  protected readonly open = signal(false);
  protected readonly active = signal(-1);
  protected readonly locating = signal(false);
  protected readonly refused = signal(false);
  private justFocused = false;

  protected readonly shown = computed(() => this.query() ?? this.selected()?.name ?? '');

  /** The search text: empty while the field still holds the chosen place's name. */
  private readonly search = computed(() => {
    const q = (this.query() ?? '').trim();
    return q === this.selected()?.name ? '' : q;
  });
  protected readonly searching = computed(() => this.search().length >= MIN_QUERY);

  protected readonly suggestions = computed<Suggestion[]>(() => {
    const q = this.search();
    if (q.length >= MIN_QUERY) {
      return searchPlaces(q).map(fromListed);
    }
    if (q.length > 0) {
      return [];
    }
    const selected = this.selected();
    const first = selected ? [fromStored(selected)] : [];
    return [...first, ...darkSkySuggestions().map(fromListed).filter((s) => !samePlace(selected, s.place))];
  });

  protected readonly status = computed(() => {
    if (!this.open() || !this.searching()) {
      return '';
    }
    const n = this.suggestions().length;
    return n === 0 ? 'Kein Ort gefunden.' : n === 1 ? 'Ein Vorschlag' : `${n} Vorschläge`;
  });

  protected readonly note = computed(() => {
    const p = this.selected();
    if (!p) {
      return PRIVACY;
    }
    return p.source === 'device' ? 'Gerundeter Standort, bleibt nur auf diesem Gerät.' : fromStored(p).region;
  });

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected isSelected(s: Suggestion): boolean {
    return samePlace(this.selected(), s.place);
  }

  /**
   * Focus on the field: offer the suggestions with the current name selected, ready to be typed over. The browser
   * places the caret after the focus handlers, so the selection is made a moment later.
   */
  protected start(): void {
    this.query.set(this.selected()?.name ?? '');
    this.open.set(true);
    this.active.set(-1);
    this.justFocused = true;
    setTimeout(() => this.field()?.nativeElement.select());
  }

  /** The mouseup of the click that focused the field would collapse the selection again. */
  protected keepSelection(event: MouseEvent): void {
    if (this.justFocused) {
      event.preventDefault();
    }
    this.justFocused = false;
  }

  protected typed(text: string): void {
    this.justFocused = false;
    this.query.set(text);
    this.open.set(true);
    this.active.set(-1);
  }

  /** Focus first (which starts with the current name), then empty the field. */
  protected clear(): void {
    this.field()?.nativeElement.focus();
    this.typed('');
  }

  protected key(event: KeyboardEvent): void {
    const n = this.suggestions().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open.set(true);
      this.active.update((i) => Math.min(n - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter' && this.open() && n) {
      event.preventDefault();
      this.pick(this.suggestions()[Math.max(0, this.active())]);
    } else if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close();
    }
  }

  /** A pointer on an option: pick it without taking focus from the field. */
  protected choose(event: MouseEvent, s: Suggestion): void {
    event.preventDefault();
    this.pick(s);
  }

  protected leave(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.close();
    }
  }

  protected async locate(): Promise<void> {
    this.close();
    this.refused.set(false);
    this.locating.set(true);
    try {
      const p = roundPosition(await this.geolocate());
      this.picked.emit({ place: { name: deviceName(p.lat, p.lon), lat: p.lat, lon: p.lon, tz: deviceTimeZone(), source: 'device' }, suggestion: suggestedDarkness(null) });
    } catch {
      this.refused.set(true);
    } finally {
      this.locating.set(false);
    }
  }

  /** The field keeps focus after a choice; its new name is selected so that typing again replaces it. */
  private pick(s: Suggestion): void {
    this.close();
    this.refused.set(false);
    this.picked.emit({ place: s.place, suggestion: suggestedDarkness(s.listed) });
    const field = this.field()?.nativeElement;
    if (field && field.ownerDocument.activeElement === field) {
      setTimeout(() => field.select());
    }
  }

  private close(): void {
    this.query.set(null);
    this.open.set(false);
    this.active.set(-1);
  }
}
