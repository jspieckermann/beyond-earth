import { Component, ElementRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JourneySettings } from '../core/journey-settings';
import { ReturnUrl } from '../core/return-url';
import { NightMode } from '../core/night-mode';

/** „Einstellungen“: the only place where night mode and the vibration are switched. */
@Component({
  selector: 'app-settings-page',
  imports: [RouterLink],
  template: `
    <main class="page">
      <header class="top">
        <a [routerLink]="backTo()" class="icon" aria-label="Zurück">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </a>
        <h1 #heading tabindex="-1">Einstellungen</h1>
      </header>

      <section class="setting" aria-labelledby="night-label">
        <div class="text">
          <span id="night-label" class="name">Nachtmodus</span>
          <span id="night-description" class="description">
            Färbt die ganze Anwendung dunkelrot auf Schwarz, ohne Weiss und Blau. So blendet das Handy draussen nicht, und deine Augen bleiben an die Dunkelheit gewöhnt.
          </span>
        </div>
        <button type="button" role="switch" class="switch" aria-labelledby="night-label" aria-describedby="night-description" [attr.aria-checked]="night.on()" (click)="night.toggle()">
          <span class="knob" aria-hidden="true"></span>
        </button>
      </section>
      @if (night.on()) {
        <p class="hint" role="status">Dreh auch die Helligkeit deines Bildschirms herunter. Das kann die Anwendung nicht für dich tun.</p>
      }

      <section class="setting" aria-labelledby="vibration-label">
        <div class="text">
          <span id="vibration-label" class="name">Vibration</span>
          <span id="vibration-description" class="description">
            Ein kurzer Impuls, wenn die Reise nach draussen an einer Stufe einrastet. Nur auf Geräten, die vibrieren können.
          </span>
        </div>
        <button type="button" role="switch" class="switch" aria-labelledby="vibration-label" aria-describedby="vibration-description" [attr.aria-checked]="journey.vibration()" (click)="journey.toggle('vibration')">
          <span class="knob" aria-hidden="true"></span>
        </button>
      </section>
    </main>
  `,
  styles: `
    :host { display: block; min-height: 100dvh; background: var(--color-night-900); color: var(--color-ink); font-size: 15px; line-height: 1.5; }
    .page { max-width: 34rem; margin: 0 auto; padding: 8px 20px 48px; box-sizing: border-box; }
    .top { display: flex; align-items: center; gap: 8px; min-height: 60px; border-bottom: 1px solid var(--color-line); }
    .icon { flex: none; width: 44px; height: 44px; border-radius: 999px; display: grid; place-items: center; color: var(--color-ink-soft); }
    h1 { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-starlight); }
    h1:focus { outline: none; }
    .setting {
      margin-top: 16px; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center;
      padding: 14px 16px; border-radius: var(--radius-box); border: 1px solid var(--color-line); background: var(--color-surface);
    }
    .top + .setting { margin-top: 28px; }
    .text { display: flex; flex-direction: column; gap: 4px; }
    .name { font-size: 16px; font-weight: 600; color: var(--color-ink-bright); }
    .description { font-size: 13px; color: var(--color-ink-muted); }
    .switch {
      position: relative; width: 52px; height: 32px; padding: 0; border-radius: 16px; cursor: pointer;
      border: 1px solid var(--color-line-strong); background: var(--color-night-800);
    }
    .switch::before { content: ''; position: absolute; inset: -6px -2px; }
    .switch:focus-visible { outline: 2px solid var(--color-starlight); outline-offset: 2px; }
    .knob { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: var(--color-ink-soft); }
    .switch[aria-checked='true'] { background: var(--color-accent-wash); border-color: var(--color-starlight); }
    .switch[aria-checked='true'] .knob { left: 23px; background: var(--color-starlight); }
    .hint { margin: 12px 0 0; padding: 10px 14px; border-radius: var(--radius-box); background: var(--color-surface); font-size: 14px; color: var(--color-ink-soft); }
    @media (prefers-reduced-motion: no-preference) { .knob { transition: left 0.15s; } }
  `,
})
export class SettingsPage {
  protected readonly night = inject(NightMode);
  protected readonly journey = inject(JourneySettings);
  private readonly router = inject(Router);
  private readonly returnUrl = inject(ReturnUrl);
  /** The page the settings were opened from; the home screen when they were opened directly. */
  protected readonly backTo = computed(() => this.router.parseUrl(this.returnUrl.url()));
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());
  }
}
