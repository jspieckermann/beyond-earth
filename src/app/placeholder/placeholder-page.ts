import { Component, ElementRef, afterNextRender, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Calm stand-in for destinations that do not exist yet. */
@Component({
  selector: 'app-placeholder-page',
  imports: [RouterLink],
  template: `
    <main class="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 #headingEl tabindex="-1" class="font-serif text-4xl font-semibold text-ink-bright outline-none">
        {{ heading() }}
      </h1>
      <p class="max-w-xs text-base leading-relaxed text-ink-muted">
        Bald verfügbar. Dieser Teil der Reise entsteht gerade.
      </p>
      <a
        routerLink="/"
        class="inline-flex min-h-11 items-center gap-2 rounded-full border border-starlight/50 px-5 text-sm font-medium text-starlight hover:text-ink-bright"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5"></path>
          <path d="M11 6l-6 6 6 6"></path>
        </svg>
        Zurück zum Himmel
      </a>
    </main>
  `,
})
export class PlaceholderPage {
  /** Destination name, bound from route data or a route resolver. */
  readonly heading = input.required<string>();

  private readonly headingEl = viewChild.required<ElementRef<HTMLElement>>('headingEl');

  constructor() {
    // Move focus to the new page's heading so screen-reader users hear where they are.
    afterNextRender(() => this.headingEl().nativeElement.focus());
  }
}
