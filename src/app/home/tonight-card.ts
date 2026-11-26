import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TonightInfo } from '../core/models';

const SCALE = [1, 2, 3, 4, 5] as const;

/** The bridge to the real sky: what is visible tonight, or an invitation to choose a place. Either way it ends with a visible way into Heute Nacht. */
@Component({
  selector: 'app-tonight-card',
  imports: [RouterLink],
  template: `
    <a routerLink="/heute-nacht" class="card">
      <span class="kicker">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"></path>
        </svg>
        @if (info(); as tonight) {
          Heute Nacht · {{ tonight.location }}
        } @else {
          Heute Nacht
        }
      </span>

      @if (info(); as tonight) {
        <span class="title">{{ tonight.headline }}</span>
        @if (tonight.milkyWayNext) {
          <span class="next">{{ tonight.milkyWayNext }}</span>
        }
        <span class="meta">
          <span class="flex items-center gap-1.5">
            <span aria-hidden="true">Himmel</span>
            <span class="flex gap-[3px]" aria-hidden="true">
              @for (step of scale; track step) {
                <span class="pip" [class.on]="step <= tonight.darkness"></span>
              }
            </span>
            <span class="sr-only">Dunkelheit {{ tonight.darkness }} von 5</span>
          </span>
          @if (tonight.darkFrom) {
            <span>{{ tonight.darkFrom }}</span>
          }
          @if (tonight.moon) {
            <span>{{ tonight.moon }}</span>
          }
        </span>
        <span class="choose">
          Was du heute siehst
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
            <path d="M9 6l6 6-6 6"></path>
          </svg>
        </span>
      } @else {
        <span class="title">Wo stehst du heute Nacht?</span>
        <span class="mission">
          <span>Wähle einen Ort, dann zeigt dir der Himmel, was heute zu sehen ist.</span>
        </span>
        <span class="choose">
          Ort wählen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
            <path d="M9 6l6 6-6 6"></path>
          </svg>
        </span>
      }
    </a>
  `,
  styles: `
    :host { display: block; }
    .card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px 18px;
      border-radius: var(--radius-box);
      background: var(--color-surface);
      border: 1px solid color-mix(in srgb, var(--color-ink) 8%, transparent);
      backdrop-filter: blur(12px);
      color: var(--color-ink);
      text-decoration: none;
    }
    .card:hover { border-color: color-mix(in srgb, var(--color-starlight) 35%, transparent); }
    .kicker {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-starlight);
    }
    .title {
      font-family: var(--font-serif);
      font-weight: 600;
      font-size: 20px;
      line-height: 1.2;
      color: var(--color-ink-bright);
    }
    .next { font-size: 13px; color: var(--color-ink); }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; font-size: 12px; color: var(--color-ink-muted); }
    .pip { width: 7px; height: 7px; box-sizing: border-box; border-radius: 50%; border: 1px solid var(--color-pip); }
    .pip.on { background: var(--color-starlight); border-color: var(--color-starlight); }
    .mission {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 13px;
      line-height: 1.4;
      color: var(--color-ink);
    }
    .choose {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      align-self: flex-start;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-starlight);
    }
  `,
})
export class TonightCard {
  /** Tonight's sky, or `null` when no place has been chosen yet. */
  readonly info = input<TonightInfo | null>(null);

  protected readonly scale = SCALE;
}
