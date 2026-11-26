import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NightMode } from './core/night-mode';
import { ReturnUrl } from './core/return-url';
import { SettingsLink } from './core/settings-link';

/** Pages without the shell's gear: the home screen has its own at the same place, the settings need none. */
const WITHOUT_GEAR = ['/', '/einstellungen'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SettingsLink],
  template: `
    <router-outlet />
    @if (gear()) {
      <app-settings-link />
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  /** Whether the current page shows the gear; read from the address without query or fragment. */
  protected readonly gear = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => !WITHOUT_GEAR.includes(this.router.url.split(/[?#]/)[0])),
    ),
    { initialValue: false },
  );

  constructor() {
    // Night mode applies from the first page on, also after a reload.
    inject(NightMode);
    // Remembers the page before the settings, from the first navigation on.
    inject(ReturnUrl);
  }
}
