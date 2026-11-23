import { Component, computed, inject, output } from '@angular/core';
import { HANDOVER_LINE } from '../data/stages';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';

/** Back at the Earth after the universe: three ways on (or "Weiter" in the main journey). */
@Component({
  selector: 'app-journey-end',
  template: `
    @if (shown()) {
      <nav aria-label="Wie geht es weiter?">
        @if (explore()) {
          <button type="button" class="primary" (click)="zoom.restart()">Nochmal reisen</button>
          <button type="button" (click)="jump.emit()">Zu einer Stufe springen</button>
          <button type="button" (click)="share()">Bild teilen</button>
        } @else {
          <p class="handover">{{ handover }}</p>
          <button type="button" class="primary" (click)="continued.emit()">Weiter</button>
        }
      </nav>
    }
  `,
  styles: `
    :host { position: absolute; left: 22px; right: 160px; top: 116px; display: block; pointer-events: none; }
    :host-context([data-layout='desktop']), :host-context([data-layout='tablet']) { left: 56px; right: auto; top: 140px; }
    nav { display: flex; flex-wrap: wrap; gap: 8px; pointer-events: auto; animation: appear 0.8s ease 1s both; }
    button { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid rgb(236 232 221 / 0.3); background: rgb(2 3 10 / 0.5); color: var(--color-ink); font: 500 14px var(--font-sans); cursor: pointer; }
    button.primary { border-color: rgb(243 217 164 / 0.7); color: var(--color-starlight); }
    .handover { width: 100%; margin: 0 0 6px; font-family: var(--font-serif); font-style: italic; font-size: 22px; color: var(--color-ink-bright); }
    @keyframes appear { from { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { nav { animation: none; } }
  `,
})
export class JourneyEnd {
  protected readonly zoom = inject(ZoomState);
  private readonly ui = inject(JourneyUi);
  protected readonly handover = HANDOVER_LINE;

  readonly jump = output<void>();
  readonly continued = output<void>();

  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly shown = computed(() => this.zoom.home() && this.zoom.restingStage() === 0);

  protected share(): void {
    this.ui.share.set({ kinds: ['kronkorken', 'muenze'] });
  }
}
