import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CLOCK } from '../core/clock';
import { DESKTOP_QUERY, MATCH_MEDIA, TABLET_QUERY } from '../core/layout-mode';
import { SavedMoments } from '../core/saved-moments';
import { TonightService } from '../core/tonight';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let el: HTMLElement;

  async function render() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CLOCK, useValue: () => new Date(2026, 10, 18, 21, 0) }],
    });
    fixture = TestBed.createComponent(HomePage);
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  }

  const star = (id: string) => el.querySelector<HTMLButtonElement>(`button[data-module="${id}"]`);

  afterEach(() => {
    el.remove();
    localStorage.clear();
  });

  it('shows the date in German long form', async () => {
    await render();
    expect(el.textContent).toContain('Mittwoch, 18. November');
  });

  it('shows exactly one greeting line without digits', async () => {
    await render();
    const greetings = el.querySelectorAll('.greeting');
    expect(greetings).toHaveLength(1);
    expect(greetings[0].textContent).not.toMatch(/\d/);
  });

  it('renders all sections', async () => {
    await render();
    expect(el.querySelector('app-sky-backdrop')).not.toBeNull();
    expect(el.querySelectorAll('app-module-constellation button.star')).toHaveLength(6);
    expect(el.querySelector('app-tonight-card')?.textContent).toContain('Wo stehst du heute Nacht?');
    expect(el.querySelector('app-home-actions')?.textContent).toContain('Die Reise');
    expect(el.querySelector('h1')?.textContent).toBe('Die Milchstrasse erleben');
  });

  it('offers a labelled settings link', async () => {
    await render();
    const settings = el.querySelector('a[aria-label="Einstellungen"]');
    expect(settings?.getAttribute('href')).toBe('/einstellungen');
  });

  it('passes saved moments and tonight info to the sections', async () => {
    await render();
    TestBed.inject(SavedMoments).setCount(2);
    TestBed.inject(TonightService).update({
      location: 'Hamburg',
      visibleFrom: '19:40',
      darkness: 2,
      moon: 'Kein Mond',
      mission: 'Finde den Schwan.',
    });
    await fixture.whenStable();
    expect(el.querySelector('app-home-actions')?.textContent).toContain('Meine Sterne');
    expect(el.querySelector('app-tonight-card')?.textContent).toContain('Hamburg');
  });

  it('closes the preview when the empty sky is clicked', async () => {
    await render();
    star('B')?.click();
    await fixture.whenStable();
    expect(el.querySelector('app-module-preview')).not.toBeNull();

    el.querySelector<HTMLElement>('app-module-preview')?.click();
    await fixture.whenStable();
    expect(el.querySelector('app-module-preview')).not.toBeNull();

    el.querySelector<HTMLElement>('.sky-region')?.click();
    await fixture.whenStable();
    expect(el.querySelector('app-module-preview')).toBeNull();
  });

  describe('layouts', () => {
    async function renderAs(matching: string[]) {
      const matchMedia = (query: string) =>
        ({ matches: matching.includes(query), addEventListener: () => undefined }) as unknown as MediaQueryList;
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: CLOCK, useValue: () => new Date(2026, 10, 18, 21, 0) },
          { provide: MATCH_MEDIA, useValue: matchMedia },
        ],
      });
      fixture = TestBed.createComponent(HomePage);
      el = fixture.nativeElement as HTMLElement;
      document.body.appendChild(el);
      await fixture.whenStable();
    }

    it('uses the phone layout by default, with the band in the backdrop', async () => {
      await render();
      expect(el.getAttribute('data-layout')).toBe('phone');
      expect(el.querySelector('app-sky-backdrop .frame')).not.toBeNull();
      expect(el.querySelector('app-module-constellation')?.classList).not.toContain('wide');
    });

    it('uses the tablet layout with stacked actions and the band in the sky region', async () => {
      await renderAs([TABLET_QUERY]);
      expect(el.getAttribute('data-layout')).toBe('tablet');
      expect(el.querySelector('app-home-actions')?.classList).toContain('stacked');
      expect(el.querySelector('app-sky-backdrop .frame')).toBeNull();
      expect(el.querySelector('app-module-constellation')?.classList).toContain('wide');
    });

    it('uses the desktop layout with brand, hint and the same Tab order', async () => {
      await renderAs([DESKTOP_QUERY, TABLET_QUERY]);
      expect(el.getAttribute('data-layout')).toBe('desktop');
      expect(el.querySelector('.brand')?.textContent).toBe('Die Milchstrasse erleben');
      expect(el.querySelector('.hint')?.textContent).toContain('Wähle einen Stern');
      expect(el.querySelector('app-home-actions')?.classList).not.toContain('stacked');
      const focusables = [...el.querySelectorAll('a, button')].map(
        (e) => e.getAttribute('aria-label') ?? e.textContent?.trim().split(/\s+/)[0],
      );
      expect(focusables[0]).toBe('Einstellungen');
      expect(focusables[1]).toBe('Die Reise nach draussen');
      expect(focusables.at(-1)).toBe('Die');
    });
  });

  it('contains no audio or video elements', async () => {
    await render();
    expect(el.querySelector('audio, video')).toBeNull();
  });
});
