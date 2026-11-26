import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { JourneySettings } from '../core/journey-settings';
import { NIGHT_MODE_KEY, NightMode } from '../core/night-mode';
import { ReturnUrl } from '../core/return-url';
import { SettingsPage } from './settings-page';

describe('SettingsPage', () => {
  async function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SettingsPage);
    const el = fixture.nativeElement as HTMLElement;
    document.body.append(el);
    await fixture.whenStable();
    return { fixture, el };
  }

  afterEach(() => {
    document.body.querySelectorAll('app-settings-page').forEach((e) => e.remove());
    localStorage.clear();
    document.documentElement.classList.remove('night');
  });

  it('focuses its heading and offers a way back to the sky', async () => {
    const { el } = await render();
    expect(document.activeElement).toBe(el.querySelector('h1'));
    expect(el.querySelector('h1')?.textContent).toBe('Einstellungen');
    expect(el.querySelector('a[aria-label="Zurück"]')?.getAttribute('href')).toBe('/');
  });

  it('switches night mode on and off, stores it and shows the brightness hint', async () => {
    const { fixture, el } = await render();
    const toggle = el.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(toggle.getAttribute('aria-labelledby')).toBe('night-label');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(TestBed.inject(NightMode).on()).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(true);
    expect(localStorage.getItem(NIGHT_MODE_KEY)).toBe('on');
    expect(el.textContent).toContain('Dreh auch die Helligkeit deines Bildschirms herunter.');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(document.documentElement.classList.contains('night')).toBe(false);
    expect(el.querySelector('.hint')).toBeNull();
  });

  it('switches the vibration of the journey and stores it', async () => {
    const { fixture, el } = await render();
    const toggle = [...el.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find((b) => b.getAttribute('aria-labelledby') === 'vibration-label') as HTMLButtonElement;
    expect(el.querySelector('#vibration-label')?.textContent).toBe('Vibration');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(TestBed.inject(JourneySettings).vibration()).toBe(false);
    expect(JSON.parse(localStorage.getItem('be.journey') ?? '{}')).toEqual({ vibration: false });
  });

  it('returns to the page it was opened from', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: SettingsPage }])] });
    TestBed.inject(ReturnUrl);
    await TestBed.inject(Router).navigateByUrl('/heute-nacht');
    const fixture = TestBed.createComponent(SettingsPage);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Zurück"]')?.getAttribute('href')).toBe('/heute-nacht');
  });
});
