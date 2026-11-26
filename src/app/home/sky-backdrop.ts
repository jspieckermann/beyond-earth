import { Component, input } from '@angular/core';
import { createStarField } from './data/star-field';

/**
 * The decorative night sky: a tiled field of faint stars across the whole viewport,
 * plus the Milky Way band (glow, core, dust lane and its denser star cloud) aligned
 * with the centered sky stage that holds the module stars.
 */
@Component({
  selector: 'app-sky-backdrop',
  host: { 'aria-hidden': 'true', class: 'picture' },
  template: `
    <svg class="field" width="100%" height="100%">
      <defs>
        <pattern id="be-sky-field" width="390" height="600" patternUnits="userSpaceOnUse">
          @for (s of fieldStars; track $index) {
            <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" [attr.opacity]="s.opacity" />
          }
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#be-sky-field)" />
    </svg>
    @if (band()) {
    <div class="frame">
      <div class="drift">
        <div class="band glow"></div>
        <div class="band mid"></div>
        <div class="band core"></div>
        <div class="band dust"></div>
        <svg class="cloud" viewBox="0 0 390 600" overflow="visible">
          @for (s of bandStars; track $index) {
            <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" [attr.opacity]="s.opacity" />
          }
        </svg>
      </div>
    </div>
    }
  `,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      background: linear-gradient(180deg, #03050c 0%, #060a18 50%, #0b1124 100%);
    }
    circle { fill: #f4f1ff; }
    .field { position: absolute; inset: 0; }
    /* Same box as the sky stage in HomePage: 1 sky unit = --u. */
    .frame {
      position: relative;
      width: 100%;
      max-width: 420px;
      margin-inline: auto;
      aspect-ratio: 390 / 600;
      container-type: inline-size;
    }
    .drift { position: absolute; inset: 0; --u: calc(100cqw / 390); }
    .cloud { position: absolute; inset: 0; width: 100%; height: 100%; }
    .band { position: absolute; border-radius: 50%; }
    .glow {
      left: calc(var(--u) * -995); top: calc(var(--u) * 272);
      width: calc(var(--u) * 2400); height: calc(var(--u) * 220);
      transform: rotate(-47.7deg);
      background: radial-gradient(ellipse at center, rgb(120 140 210 / 0.2) 0%, rgb(80 95 170 / 0.09) 45%, transparent 72%);
      filter: blur(calc(var(--u) * 28));
    }
    .mid {
      left: calc(var(--u) * -695); top: calc(var(--u) * 322);
      width: calc(var(--u) * 1800); height: calc(var(--u) * 120);
      transform: rotate(-47.7deg);
      background: radial-gradient(ellipse at 52% 50%, rgb(215 214 235 / 0.28) 0%, rgb(160 170 220 / 0.13) 45%, transparent 75%);
      filter: blur(calc(var(--u) * 14));
    }
    .core {
      left: calc(var(--u) * -95); top: calc(var(--u) * 360);
      width: calc(var(--u) * 600); height: calc(var(--u) * 46);
      transform: rotate(-47.7deg);
      background: radial-gradient(ellipse at 48% 50%, rgb(255 236 205 / 0.3) 0%, rgb(230 215 200 / 0.12) 50%, transparent 78%);
      filter: blur(calc(var(--u) * 9));
    }
    .dust {
      left: calc(var(--u) * -60); top: calc(var(--u) * 378);
      width: calc(var(--u) * 540); height: calc(var(--u) * 14);
      transform: rotate(-46deg);
      background: radial-gradient(ellipse at 45% 50%, rgb(3 5 12 / 0.75) 0%, rgb(3 5 12 / 0.35) 55%, transparent 80%);
      filter: blur(calc(var(--u) * 5));
    }
    @media (prefers-reduced-motion: no-preference) {
      .drift { animation: drift 120s ease-in-out infinite alternate; }
    }
    @keyframes drift {
      from { transform: translate(0, 0); }
      to { transform: translate(calc(var(--u) * -6), calc(var(--u) * 4)); }
    }
  `,
})
export class SkyBackdrop {
  /** Draw the band here (phone). On tablet and desktop the constellation draws it in its own region. */
  readonly band = input(true);

  protected readonly fieldStars = createStarField(7, 150, 0);
  protected readonly bandStars = createStarField(11, 0, 170);
}
