import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { routes } from './app.routes';
import { HomePage } from './home/home-page';
import { PlaceholderPage } from './placeholder/placeholder-page';

describe('routes', () => {
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
