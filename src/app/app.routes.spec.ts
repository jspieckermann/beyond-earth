import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { GalacticYearPage } from './galactic-year/galactic-year-page';
import { HomePage } from './home/home-page';
import { LightSpeedPage } from './light-speed-journey/light-speed-page';
import { OutwardJourneyPage } from './outward-journey/outward-journey-page';
import { PlaceholderPage } from './placeholder/placeholder-page';

describe('routes', { timeout: 30_000 }, () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
    harness = await RouterTestingHarness.create();
  });

  const heading = () => (harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent?.trim();
  const title = () => TestBed.inject(Title).getTitle();

  it('shows the home screen at the root', async () => {
    expect(await harness.navigateByUrl('/')).toBeInstanceOf(HomePage);
    expect(title()).toBe('Die Milchstrasse erleben');
  });

  for (const [path, name] of [
    ['/reise', 'Die Reise'],
    ['/heute-nacht', 'Heute Nacht'],
    ['/meine-sterne', 'Meine Sterne'],
    ['/einstellungen', 'Einstellungen'],
  ]) {
    it(`shows a placeholder for ${path}`, async () => {
      expect(await harness.navigateByUrl(path)).toBeInstanceOf(PlaceholderPage);
      expect(heading()).toBe(name);
      expect(title()).toBe(`${name} · Die Milchstrasse erleben`);
    });
  }

  it('opens the outward journey for Modul A', async () => {
    expect(await harness.navigateByUrl('/module/reise-nach-draussen')).toBeInstanceOf(OutwardJourneyPage);
    expect(title()).toBe('Die Reise nach draussen · Die Milchstrasse erleben');
  });

  it('opens the travel planner for Modul B, with its destination from the address', async () => {
    expect(await harness.navigateByUrl('/module/lichtgeschwindigkeit')).toBeInstanceOf(LightSpeedPage);
    expect(title()).toBe('Reisen mit Lichtgeschwindigkeit · Die Milchstrasse erleben');
    expect(heading()).toBe('Reisen mit Lichtgeschwindigkeit');
    await harness.navigateByUrl('/module/lichtgeschwindigkeit?ziel=sirius&von=alpha-centauri');
    expect((harness.routeNativeElement as HTMLElement).querySelector('.goal-name')?.textContent).toBe('Sirius');
  });

  it('opens Modul C "Das galaktische Jahr"', async () => {
    expect(await harness.navigateByUrl('/module/galaktisches-jahr')).toBeInstanceOf(GalacticYearPage);
    expect(title()).toBe('Das galaktische Jahr · Die Milchstrasse erleben');
    expect(heading()).toBe('Das galaktische Jahr');
  });

  it('titles module placeholders from the catalog', async () => {
    expect(await harness.navigateByUrl('/module/das-unsichtbare')).toBeInstanceOf(PlaceholderPage);
    expect(heading()).toBe('Das Unsichtbare');
    expect(title()).toBe('Das Unsichtbare · Die Milchstrasse erleben');
  });

  it('sends unknown modules and unknown paths back home', async () => {
    await harness.navigateByUrl('/module/gibt-es-nicht');
    expect(TestBed.inject(Router).url).toBe('/');
    await harness.navigateByUrl('/irgendwo');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});

describe('appConfig', () => {
  it('provides the router', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});
