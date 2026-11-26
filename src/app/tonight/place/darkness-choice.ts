import { Component, ElementRef, inject, input, model, signal } from '@angular/core';
import { DarknessLevel } from '../../core/models';
import { DARKNESS_NAMES, DARKNESS_SENTENCES } from '../engine/summary';

const LEVELS: readonly DarknessLevel[] = [1, 2, 3, 4, 5];

/**
 * „Wie dunkel ist es dort?“: a select-only combobox. Closed, it shows the chosen level with dots, name and sentence;
 * open, a list of all five levels in the same form. Keyboard: arrows, Home, End, Enter or Space, Escape.
 */
@Component({
  selector: 'app-darkness-choice',
  host: { '(focusout)': 'close()' },
  template: `
    <span class="label" id="darkness-label">Wie dunkel ist es dort?</span>
    <div class="wrap">
      <button
        type="button"
        id="darkness-button"
        class="level current"
        role="combobox"
        aria-haspopup="listbox"
        aria-labelledby="darkness-label darkness-button"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? 'darkness-list' : null"
        [attr.aria-activedescendant]="open() ? 'darkness-' + active() : null"
        (click)="toggle($event)"
        (keydown)="key($event)"
      >
        @if (value(); as v) {
          <span class="dots" aria-hidden="true">
            @for (i of levels; track i) {
              <span class="dot" [class.on]="i <= v"></span>
            }
          </span>
          <span class="name">{{ names[v] }}</span>
          <span class="sentence">{{ sentences[v] }}</span>
        } @else {
          <span class="name empty">Stufe wählen</span>
        }
        <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      @if (open()) {
        <ul id="darkness-list" class="popup" role="listbox" aria-labelledby="darkness-label">
          @for (level of levels; track level) {
            <li
              role="option"
              class="level"
              [id]="'darkness-' + level"
              [class.active]="byKeyboard() && active() === level"
              [attr.aria-selected]="value() === level"
              (mousedown)="choose($event, level)"
            >
              <span class="dots" aria-hidden="true">
                @for (i of levels; track i) {
                  <span class="dot" [class.on]="i <= level"></span>
                }
              </span>
              <span class="name">{{ names[level] }}</span>
              <span class="sentence">{{ sentences[level] }}</span>
              @if (value() === level) {
                <svg class="tick" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
              }
            </li>
          }
        </ul>
      }
    </div>
    @if (hint()) {
      <p class="hint">{{ hint() }}</p>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 8px; }
    .label { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-ink-muted); }
    .wrap { position: relative; }
    .level {
      width: 100%; box-sizing: border-box; display: grid; grid-template-columns: auto 1fr auto; gap: 2px 12px; align-items: center;
      min-height: 44px; padding: 10px 14px; color: var(--color-ink); font: inherit; text-align: left; cursor: pointer;
    }
    .current { border-radius: 14px; border: 1px solid var(--color-accent-line); background: var(--color-accent-wash); }
    .current:focus-visible { outline: 2px solid var(--color-starlight); outline-offset: 2px; }
    .chevron { grid-column: 3; grid-row: 1 / span 2; color: var(--color-ink-soft); }
    .current[aria-expanded='true'] .chevron { transform: rotate(180deg); }
    .popup {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 5; list-style: none; margin: 0; padding: 6px;
      border-radius: 16px; border: 1px solid var(--color-line-strong); background: var(--color-night-800);
      box-shadow: 0 12px 32px rgb(0 0 0 / 0.5);
    }
    .popup .level + .level { border-top: 1px solid var(--color-line); }
    .popup .level.active { outline: 2px solid var(--color-starlight); outline-offset: -2px; border-radius: 10px; }
    .popup .level[aria-selected='true'] .name, .popup .level:hover .name { color: var(--color-starlight); }
    .tick { grid-column: 3; grid-row: 1 / span 2; color: var(--color-starlight); }
    .name { font-size: 15px; font-weight: 600; color: var(--color-ink); }
    .name.empty { grid-column: 1 / span 2; font-weight: 500; color: var(--color-ink-soft); }
    .sentence { grid-column: 2; font-size: 13px; color: var(--color-ink-muted); }
    /* On the tinted button the muted colour would fall short of 4.5:1 in night mode. */
    .current .sentence { color: var(--color-ink-soft); }
    .dots { display: flex; gap: 3px; }
    .dot { width: 8px; height: 8px; box-sizing: border-box; border-radius: 50%; border: 1px solid var(--color-ink-dim); }
    .dot.on { background: var(--color-starlight); border-color: var(--color-starlight); }
    .hint { margin: 0; font-size: 13px; color: var(--color-ink-muted); }
    @media (prefers-reduced-motion: no-preference) { .chevron { transition: transform 0.2s; } }
  `,
})
export class DarknessChoice {
  readonly value = model<DarknessLevel | null>(null);
  /** A line below the choice, e.g. why the level is suggested. */
  readonly hint = input<string | null>(null);

  protected readonly levels = LEVELS;
  protected readonly names = DARKNESS_NAMES;
  protected readonly sentences = DARKNESS_SENTENCES;

  protected readonly open = signal(false);
  protected readonly active = signal<DarknessLevel>(1);
  /** The active option is outlined only while the keyboard moves it. */
  protected readonly byKeyboard = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** A click toggles the list; a click from the keyboard (`detail` 0) also outlines the active option. */
  protected toggle(event: MouseEvent): void {
    this.byKeyboard.set(event.detail === 0);
    this.setOpen(!this.open());
  }

  protected key(event: KeyboardEvent): void {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'];
    if (!keys.includes(event.key) || (event.key === 'Escape' && !this.open())) {
      return;
    }
    event.preventDefault();
    this.byKeyboard.set(true);
    if (!this.open()) {
      if (event.key !== 'Escape') {
        this.setOpen(true);
      }
      return;
    }
    const step = (d: number) => this.active.update((a) => Math.min(5, Math.max(1, a + d)) as DarknessLevel);
    switch (event.key) {
      case 'ArrowDown':
        step(1);
        break;
      case 'ArrowUp':
        step(-1);
        break;
      case 'Home':
        this.active.set(1);
        break;
      case 'End':
        this.active.set(5);
        break;
      case 'Escape':
        this.setOpen(false);
        break;
      default:
        this.pick(this.active());
    }
  }

  /** A pointer on an option: pick it without taking focus from the button. */
  protected choose(event: MouseEvent, level: DarknessLevel): void {
    event.preventDefault();
    this.pick(level);
  }

  protected close(): void {
    this.open.set(false);
  }

  private pick(level: DarknessLevel): void {
    this.value.set(level);
    this.setOpen(false);
    this.host.nativeElement.querySelector<HTMLElement>('#darkness-button')?.focus();
  }

  private setOpen(open: boolean): void {
    this.active.set(this.value() ?? 1);
    this.open.set(open);
  }
}
