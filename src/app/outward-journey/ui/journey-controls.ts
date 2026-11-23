import { Component, inject, signal } from '@angular/core';
import { JourneySettings } from '../../core/journey-settings';

/** A small settings panel; the journey has no sound, so it only holds the vibration on snapping. */
@Component({
  selector: 'app-journey-controls',
  host: { '(keydown.escape)': 'open.set(false)' },
  template: `
    <button type="button" class="icon" aria-label="Weitere Einstellungen" [attr.aria-expanded]="open()" aria-controls="journey-settings" (click)="open.set(!open())">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
    </button>
    @if (open()) {
      <div id="journey-settings" class="panel" role="group" aria-label="Weitere Einstellungen">
        <label><input type="checkbox" [checked]="settings.vibration()" (change)="settings.toggle('vibration')" /> Vibration beim Einrasten</label>
      </div>
    }
  `,
  styles: `
    :host { position: relative; display: flex; gap: 4px; }
    .icon { width: 44px; height: 44px; border-radius: 999px; border: 0; background: rgb(2 3 10 / 0.35); color: var(--color-ink-soft); display: grid; place-items: center; cursor: pointer; }
    .panel { position: absolute; right: 0; top: 50px; z-index: 4; display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: 16px; background: rgb(10 14 30 / 0.94); border: 1px solid rgb(236 232 221 / 0.1); white-space: nowrap; }
    label { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 14px; color: var(--color-ink); cursor: pointer; }
    input { width: 18px; height: 18px; accent-color: var(--color-starlight); }
  `,
})
export class JourneyControls {
  protected readonly settings = inject(JourneySettings);
  protected readonly open = signal(false);
}
