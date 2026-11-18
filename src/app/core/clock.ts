import { InjectionToken } from '@angular/core';

/** Returns "now". Injected so that tests can freeze time. */
export type Clock = () => Date;

export const CLOCK = new InjectionToken<Clock>('CLOCK', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
