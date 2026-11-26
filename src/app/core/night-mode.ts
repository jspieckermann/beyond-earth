import { DOCUMENT, Service, effect, inject, signal } from '@angular/core';
import { LocalStore } from './local-store';

export const NIGHT_MODE_KEY = 'be.nightMode.v1';
/** The browser's theme colour in the normal look and in night mode. */
export const THEME_COLOR = { day: '#03050c', night: '#000000' } as const;

/**
 * Night mode: the whole app red on black, so the phone does not spoil dark-adapted eyes outside.
 * The setting is stored on the device and mirrored to the `night` class on the root element and the theme colour.
 */
@Service()
export class NightMode {
  private readonly store = inject(LocalStore);
  private readonly document = inject(DOCUMENT);
  private readonly state = signal(this.store.read(NIGHT_MODE_KEY) === 'on');

  readonly on = this.state.asReadonly();

  constructor() {
    effect(() => {
      const on = this.state();
      this.document.documentElement.classList.toggle('night', on);
      this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', on ? THEME_COLOR.night : THEME_COLOR.day);
    });
  }

  set(on: boolean): void {
    this.state.set(on);
    this.store.write(NIGHT_MODE_KEY, on ? 'on' : 'off');
  }

  toggle(): void {
    this.set(!this.state());
  }
}
