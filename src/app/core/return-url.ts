import { Service, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/** Address of the settings page, which is never a place to return to. */
export const SETTINGS_URL = '/einstellungen';

/**
 * Remembers the last page shown before the settings, so that closing the settings returns there. The app shell
 * creates it at start; it listens to every completed navigation.
 */
@Service()
export class ReturnUrl {
  private readonly router = inject(Router);
  private readonly last = signal('/');

  /** The page to return to from the settings; the home screen when the settings were opened first. */
  readonly url = this.last.asReadonly();

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd && e.urlAfterRedirects.split(/[?#]/)[0] !== SETTINGS_URL) {
        this.last.set(e.urlAfterRedirects);
      }
    });
  }
}
