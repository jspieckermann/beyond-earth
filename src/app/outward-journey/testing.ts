import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CLOCK } from '../core/clock';
import { MATCH_MEDIA } from '../core/layout-mode';
import { FRAME_SCHEDULER, FrameScheduler, REDUCED_MOTION_QUERY } from './engine/zoom-state';

/** Frames driven by Vitest's fake timers (or real timers, at ~60 fps). */
export const fakeFrames: FrameScheduler = {
  request: (cb) => setTimeout(() => cb(Date.now()), 16) as unknown as number,
  cancel: (h) => clearTimeout(h),
  now: () => Date.now(),
};

export interface JourneyTestOptions {
  readonly reducedMotion?: boolean;
  readonly layout?: 'phone' | 'desktop';
  readonly now?: Date;
}

/** Providers that make the journey deterministic in unit tests. */
export function journeyTestProviders(options: JourneyTestOptions = {}): (Provider | EnvironmentProviders)[] {
  const now = options.now ?? new Date(Date.UTC(2026, 10, 20, 12));
  return [
    provideRouter([]),
    { provide: CLOCK, useValue: () => now },
    { provide: FRAME_SCHEDULER, useValue: fakeFrames },
    {
      provide: MATCH_MEDIA,
      useValue: (query: string) => ({
        matches: query === REDUCED_MOTION_QUERY ? !!options.reducedMotion : options.layout === 'desktop' && query.includes('1100'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    },
  ];
}
