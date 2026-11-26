import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutMode } from './layout-mode';

/**
 * The gear that leads to „Einstellungen“ (night mode, vibration). The app shell shows it on every page except the
 * home screen (which has its own, see `home-page.css`) and the settings themselves, at exactly the home screen's
 * position for the current layout, so it never moves between screens.
 */
@Component({
  selector: 'app-settings-link',
  imports: [RouterLink],
  host: { '[attr.data-layout]': 'layout.layout()' },
  template: `
    <a routerLink="/einstellungen" aria-label="Einstellungen" class="settings">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>
      </svg>
    </a>
  `,
  styles: `
    /* Same place as the home screen's gear (home-page.css): phone 14px / 30 of 390 units, tablet 30/30, desktop 40/36. */
    :host { position: absolute; z-index: 6; right: 14px; top: calc(100vw * 30 / 390); }
    :host([data-layout='tablet']) { right: 30px; top: 30px; }
    :host([data-layout='desktop']) { right: 40px; top: 36px; }
    .settings {
      width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
      color: var(--color-ink-muted); background: color-mix(in srgb, var(--color-night-950) 35%, transparent);
    }
    .settings:hover { color: var(--color-ink); }
  `,
})
export class SettingsLink {
  protected readonly layout = inject(LayoutMode);
}
