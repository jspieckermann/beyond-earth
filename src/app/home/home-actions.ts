import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** "Die Reise" and — once something is saved — "Meine Sterne". */
@Component({
  selector: 'app-home-actions',
  imports: [RouterLink],
  host: { '[class.two]': 'showMoments()', '[class.stacked]': 'stacked()' },
  template: `
    <a routerLink="/reise" class="action">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 5l12 7-12 7z"></path>
      </svg>
      Die Reise
    </a>
    @if (showMoments()) {
      <a routerLink="/meine-sterne" class="action">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1"></path>
        </svg>
        Meine Sterne
        <span class="badge">{{ momentsCount() }}<span class="sr-only"> gespeicherte Momente</span></span>
      </a>
    }
  `,
  styles: `
    :host { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 10px; }
    :host(.two) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    :host(.stacked) { grid-template-columns: minmax(0, 1fr); grid-auto-rows: minmax(56px, 1fr); gap: 12px; }
    :host(.stacked) .action { border-radius: 22px; font-size: 15px; }
    .action {
      min-height: 48px;
      border-radius: 24px;
      border: 1px solid rgb(255 255 255 / 0.16);
      background: rgb(255 255 255 / 0.04);
      color: var(--color-ink);
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      text-decoration: none;
    }
    .action:hover { border-color: rgb(243 217 164 / 0.45); }
    .badge {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      box-sizing: border-box;
      border-radius: 10px;
      background: rgb(243 217 164 / 0.16);
      color: var(--color-starlight);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class HomeActions {
  readonly momentsCount = input(0);
  /** Stack the actions vertically (tablet layout, next to the Heute-Nacht card). */
  readonly stacked = input(false);

  protected readonly showMoments = computed(() => this.momentsCount() > 0);
}
