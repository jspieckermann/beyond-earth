import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SkyModule } from './data/modules';
import { PREVIEW_SIZE } from './data/preview-placement';
import { WIDE_PREVIEW_SIZE } from './data/wide-sky';

/** Small, non-modal preview of the selected module. */
@Component({
  selector: 'app-module-preview',
  imports: [RouterLink],
  host: {
    role: 'region',
    '[id]': 'previewId()',
    '[attr.aria-labelledby]': 'previewId() + "-title"',
    '[style.left.px]': 'x()',
    '[style.top.px]': 'y()',
    '[class.wide]': 'wide()',
    '[style.width.px]': 'size().width',
    '[style.height.px]': 'size().height',
  },
  template: `
    <span class="status">{{ explored() ? 'Schon vertieft' : 'Noch nicht vertieft' }}</span>
    <h2 [id]="previewId() + '-title'" class="title">{{ module().title }}</h2>
    <p class="line">{{ module().line }}</p>
    <a
      [routerLink]="['/module', module().slug]"
      class="enter mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-full border border-starlight/50 px-4 font-medium text-starlight hover:text-ink-bright"
    >
      Eintauchen
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14"></path>
        <path d="M13 6l6 6-6 6"></path>
      </svg>
    </a>
  `,
  styles: `
    :host {
      position: absolute;
      z-index: 2;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px 16px 12px;
      border-radius: 16px;
      background: var(--color-popover);
      border: 1px solid rgb(243 217 164 / 0.22);
      backdrop-filter: blur(10px);
      pointer-events: auto;
    }
    :host(.wide) { gap: 8px; padding: 18px 20px 16px; border-radius: 20px; }
    .status { font-size: 11px; letter-spacing: 0.06em; color: var(--color-ink-muted); }
    .title {
      margin: 0;
      font-family: var(--font-serif);
      font-size: 21px;
      line-height: 1.1;
      font-weight: 600;
      color: var(--color-ink-bright);
    }
    .enter { font-size: 13px; }
    :host(.wide) .status { font-size: 12px; }
    :host(.wide) .title { font-size: 27px; }
    :host(.wide) .line { font-size: 14px; line-height: 1.5; }
    :host(.wide) .enter { font-size: 14px; }
    .line {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: var(--color-ink-soft);
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
    }
  `,
})
export class ModulePreview {
  readonly module = input.required<SkyModule>();
  readonly explored = input(false);
  readonly x = input(0);
  readonly y = input(0);
  readonly previewId = input('module-preview');
  /** Larger preview for the tablet and desktop layouts. */
  readonly wide = input(false);

  protected readonly size = computed(() => (this.wide() ? WIDE_PREVIEW_SIZE : PREVIEW_SIZE));
}
