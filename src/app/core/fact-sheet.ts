import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

/** A link from the facts to another module. */
export interface FactBranch {
  readonly label: string;
  /** Slug of the target module. */
  readonly slug: string;
  readonly queryParams?: Params;
}

export interface FactSheetContent {
  readonly kicker: string;
  readonly facts: readonly string[];
  /** Where the pictures and numbers come from, e.g. { kind: 'Aufnahme', source: 'NASA' }. */
  readonly sources: readonly { readonly kind: string; readonly source: string }[];
  readonly branches?: readonly FactBranch[];
}

/**
 * "Wie genau weiss man das?": facts on a translucent sheet. Shared by the modules; it takes focus when
 * it opens and closes with its button or Escape. The opener returns focus when it handles `closed`.
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
        <a class="branch" [routerLink]="['/module', b.slug]" [queryParams]="b.queryParams">{{ b.label }} →</a>
      }
      @if (content().sources.length || showCredits()) {
        <p class="source">
          @for (s of content().sources; track $index) {
            <span>{{ s.kind }}: {{ s.source }}</span>
          }
          @if (showCredits()) {
            <button type="button" class="credits" (click)="credits.emit()">Bildnachweise</button>
          }
        </p>
      }
    </section>
  `,
  styleUrl: './fact-sheet.css',
})
export class FactSheet {
  readonly content = input.required<FactSheetContent>();
  /** Offer the "Bildnachweise" button. */
  readonly showCredits = input(false);
  readonly closed = output<void>();
  /** "Bildnachweise" was activated. */
  readonly credits = output<void>();
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
  }

  close(): void {
    this.closed.emit();
  }
}
