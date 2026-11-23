import { Component, ElementRef, afterNextRender, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CREDITS, CREDIT_KIND_LABEL, CreditId } from '../data/credits';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';

export interface FactSheetContent {
  readonly kicker: string;
  readonly facts: readonly string[];
  readonly credits: readonly CreditId[];
  readonly branches?: readonly { readonly label: string; readonly slug: string }[];
}

/**
 * "Wie genau weiss man das?": the facts of the current stage or planet on a translucent sheet
 * over the picture. Closes with its button, Escape, or as soon as the view moves.
 */
@Component({
  selector: 'app-fact-sheet',
  imports: [RouterLink],
  host: { '(keydown.escape)': 'close()' },
  template: `
    <section role="region" aria-labelledby="facts-title" class="sheet">
      <div class="grip" aria-hidden="true"></div>
      <div class="head">
        <div>
          <p class="kicker">{{ content().kicker }}</p>
          <h3 #heading id="facts-title" tabindex="-1">Wie genau weiss man das?</h3>
        </div>
        <button type="button" class="close" aria-label="Fakten schliessen" (click)="close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
      <ul>
        @for (fact of content().facts; track fact) {
          <li>{{ fact }}</li>
        }
      </ul>
      @for (b of content().branches ?? []; track b.slug) {
        <a class="branch" [routerLink]="['/module', b.slug]">{{ b.label }} →</a>
      }
      <p class="source">
        @for (c of sources(); track c.title) {
          <span>{{ c.kind }}: {{ c.source }}</span>
        }
        <button type="button" class="credits" (click)="ui.creditsOpen.set(true)">Bildnachweise</button>
      </p>
    </section>
  `,
  styleUrl: './fact-sheet.css',
})
export class FactSheet {
  protected readonly ui = inject(JourneyUi);
  private readonly zoom = inject(ZoomState);
  readonly content = input.required<FactSheetContent>();
  readonly closed = output<void>();
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  protected readonly sources = computed(() =>
    this.content().credits.map((id) => ({ title: CREDITS[id].title, source: CREDITS[id].source, kind: CREDIT_KIND_LABEL[CREDITS[id].kind] })),
  );

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
    // Any movement of the view closes the sheet.
    let first = true;
    effect(() => {
      this.zoom.z();
      if (first) {
        first = false;
        return;
      }
      this.close();
    });
  }

  close(): void {
    this.closed.emit();
  }
}
