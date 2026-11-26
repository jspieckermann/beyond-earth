import { Component, ElementRef, afterNextRender, inject, output, viewChild } from '@angular/core';
import { CREDITS, CREDIT_KIND_LABEL } from '../data/credits';
import { JourneyUi } from '../journey-ui';

/** "Bildnachweise": every picture and data set of the module with source and licence. */
@Component({
  selector: 'app-credits-dialog',
  host: { '(keydown.escape)': 'close()' },
  template: `
    <dialog #dialog aria-labelledby="credits-title" (close)="close()" (cancel)="close()">
      <div class="head">
        <h2 id="credits-title">Bildnachweise</h2>
        <button type="button" aria-label="Bildnachweise schliessen" (click)="close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <ul>
        @for (c of credits; track c.title) {
          <li>
            <strong>{{ c.title }}</strong>
            <span>{{ c.kind }} · {{ c.source }} · {{ c.licence }}</span>
            <span class="url">{{ c.url }}</span>
          </li>
        }
      </ul>
    </dialog>
  `,
  styles: `
    dialog { width: min(34rem, calc(100vw - 32px)); max-height: 80vh; padding: 16px 20px; border-radius: 20px; border: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); background: var(--color-night-800); color: var(--color-ink); }
    dialog::backdrop { background: color-mix(in srgb, var(--color-night-950) 70%, transparent); }
    .head { display: flex; justify-content: space-between; align-items: center; }
    h2 { margin: 0; font-family: var(--font-serif); font-size: 26px; color: var(--color-ink-bright); }
    button { width: 44px; height: 44px; border: 0; border-radius: 999px; background: transparent; color: var(--color-ink-soft); display: grid; place-items: center; cursor: pointer; }
    ul { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }
    li { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: var(--color-ink-soft); }
    strong { color: var(--color-ink-bright); font-weight: 600; }
    .url { color: var(--color-ink-dim); word-break: break-all; font-size: 12px; }
  `,
})
export class CreditsDialog {
  private readonly ui = inject(JourneyUi);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly closed = output<void>();

  protected readonly credits = Object.values(CREDITS).map((c) => ({ ...c, kind: CREDIT_KIND_LABEL[c.kind] }));

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function' && !dialog.open) {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    });
  }

  close(): void {
    if (!this.ui.creditsOpen()) {
      return;
    }
    this.ui.creditsOpen.set(false);
    this.closed.emit();
  }
}
