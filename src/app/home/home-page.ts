import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CLOCK } from '../core/clock';
import { LayoutMode } from '../core/layout-mode';
import { ModuleId } from '../core/models';
import { SavedMoments } from '../core/saved-moments';
import { TonightService } from '../core/tonight';
import { HomeActions } from './home-actions';
import { ModuleConstellation } from './module-constellation';
import { SkyBackdrop } from './sky-backdrop';
import { TonightCard } from './tonight-card';

const DATE_FORMAT = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * The night-sky start page for returning users.
 * One template for all layouts (same reading and Tab order); CSS arranges it per layout:
 * phone (one column), tablet (sky across the full width, card and actions side by side)
 * and desktop (quiet left column, sky filling the rest).
 */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, SkyBackdrop, ModuleConstellation, TonightCard, HomeActions],
  host: {
    '[attr.data-layout]': 'layout()',
    '(click)': 'clearOnEmptySky($event)',
  },
  template: `
    <app-sky-backdrop [band]="layout() === 'phone'" />
    <main class="home">
      <div class="veil" aria-hidden="true"></div>
      <div class="intro">
        <h1 class="brand">Die Milchstrasse erleben</h1>
        <p class="date">{{ today() }}</p>
        <p class="greeting">{{ greeting }}</p>
        <p class="hint">Wähle einen Stern am Band, um einzutauchen.</p>
      </div>
      <a routerLink="/einstellungen" aria-label="Einstellungen" class="settings">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>
        </svg>
      </a>
      <div class="sky-region">
        <app-module-constellation [layout]="layout()" [(selected)]="selected" />
      </div>
      <app-tonight-card class="card" [info]="tonight.info()" />
      <app-home-actions class="actions" [stacked]="layout() === 'tablet'" [momentsCount]="moments.count()" />
    </main>
  `,
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly clock = inject(CLOCK);
  protected readonly layout = inject(LayoutMode).layout;
  protected readonly tonight = inject(TonightService);
  protected readonly moments = inject(SavedMoments);

  protected readonly selected = signal<ModuleId | null>(null);
  protected readonly greeting = '„Heute Nacht zieht das Band über dich hinweg.“';
  protected readonly today = computed(() => DATE_FORMAT.format(this.clock()));

  constructor() {
    // Tonight's calculation loads only after the home screen is on screen.
    afterNextRender(() => void this.tonight.refresh());
  }

  /** A click on the sky (anything that is not a control or the preview) closes the preview. */
  protected clearOnEmptySky(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest('a, button, app-module-preview')) {
      return;
    }
    this.selected.set(null);
  }
}
