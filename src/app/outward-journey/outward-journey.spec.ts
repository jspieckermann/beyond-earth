import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorationProgress } from '../core/exploration-progress';
import { OutwardJourney } from './outward-journey';
import { OutwardJourneyPage } from './outward-journey-page';
import { JourneyTestOptions, journeyTestProviders } from './testing';

describe('OutwardJourney', { timeout: 30_000 }, () => {
  let fixture: ComponentFixture<OutwardJourney>;
  let el: HTMLElement;

  async function render(variant: 'freies-erkunden' | 'hauptreise' = 'freies-erkunden', options: JourneyTestOptions = {}) {
    TestBed.configureTestingModule({ providers: journeyTestProviders(options) });
    fixture = TestBed.createComponent(OutwardJourney);
    fixture.componentRef.setInput('variant', variant);
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    vi.useFakeTimers();
  }

  function advance(ms: number) {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  const button = (name: string) =>
    [...el.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').trim() === name) as HTMLButtonElement;
  const text = () => el.textContent?.replace(/\s+/g, ' ') ?? '';

  afterEach(() => {
    vi.useRealTimers();
    el.remove();
    localStorage.clear();
  });

  it('starts at the Earth with focus on its heading and a way back', async () => {
    await render();
    expect(document.activeElement?.textContent).toBe('Die Reise nach draussen');
    expect(el.querySelector('a[aria-label="Zurück zum Himmel"]')?.getAttribute('href')).toBe('/');
    expect(el.querySelector('h2')?.textContent).toBe('Die Erde');
    expect(text()).toContain('12.742 km');
    expect(text()).toContain('Zum Hinauszoomen');
  });

  it('comes back to a stage with a close-up open, e.g. from Modul B', async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    fixture = TestBed.createComponent(OutwardJourney);
    fixture.componentRef.setInput('startStage', 'alpha-centauri');
    fixture.componentRef.setInput('startBody', 'sirius');
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    vi.useFakeTimers();
    advance(50);
    expect(el.querySelector('app-planet-closeup h2')?.textContent).toBe('Sirius');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Zurück zu den benachbarten Sternensystemen');
    button('Zurück zu den benachbarten Sternensystemen').click();
    advance(50);
    expect(el.querySelector('h2')?.textContent).toBe('Benachbarte Sternensysteme');
  });

  it('comes back to a stage without a close-up', async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    fixture = TestBed.createComponent(OutwardJourney);
    fixture.componentRef.setInput('startStage', 'milchstrasse');
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    vi.useFakeTimers();
    advance(50);
    expect(el.querySelector('app-planet-closeup')).toBeNull();
    expect(el.querySelector('h2')?.textContent).toBe('Die ganze Milchstrasse');
  });

  it('rests at a known stage without a close-up when the close-up is unknown', async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    fixture = TestBed.createComponent(OutwardJourney);
    fixture.componentRef.setInput('startStage', 'milchstrasse');
    fixture.componentRef.setInput('startBody', 'nichts');
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    vi.useFakeTimers();
    advance(50);
    expect(el.querySelector('app-planet-closeup')).toBeNull();
    expect(el.querySelector('h2')?.textContent).toBe('Die ganze Milchstrasse');
  });

  it('starts at the Earth for unknown return values', async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    fixture = TestBed.createComponent(OutwardJourney);
    fixture.componentRef.setInput('startStage', 'irgendwo');
    fixture.componentRef.setInput('startBody', 'nichts');
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    vi.useFakeTimers();
    expect(el.querySelector('app-planet-closeup')).toBeNull();
    expect(el.querySelector('h2')?.textContent).toBe('Die Erde');
  });

  it('moves one stage out with Arrow-Up and shows the texts only at rest', async () => {
    await render();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    advance(400);
    expect(el.querySelector('.text')).toBeNull();
    advance(800);
    expect(el.querySelector('h2')?.textContent).toBe('Erde und Mond');
    expect(text()).toContain('384.400 km');
    expect(text()).toContain('Alle anderen Planeten passen');
  });

  it('flies to a stage from the scale bar', async () => {
    await render();
    button('Lokale Gruppe').click();
    advance(30_000);
    expect(el.querySelector('h2')?.textContent).toBe('Die Lokale Gruppe');
    expect(button('Lokale Gruppe').getAttribute('aria-current')).toBe('location');
  });

  it('opens and closes the facts, returning focus', async () => {
    await render();
    button('Wie genau weiss man das?').click();
    advance(50);
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('Durchmesser 12.742 km');
    el.querySelector('app-fact-sheet')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    advance(50);
    expect(el.querySelector('app-fact-sheet')).toBeNull();
    expect(document.activeElement?.textContent).toContain('Wie genau weiss man das?');
  });

  it('lists the picture sources in the facts and closes them when the view moves', async () => {
    await render();
    button('Wie genau weiss man das?').click();
    advance(50);
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('Bildnachweise');
    expect(el.querySelector('app-fact-sheet')?.textContent).toMatch(/Aufnahme: /);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    advance(50);
    expect(el.querySelector('app-fact-sheet')).toBeNull();
  });

  it('opens a planet close-up from the solar system', async () => {
    await render();
    button('Sonnensystem').click();
    advance(5000);
    button('Mars ansehen').click();
    advance(50);
    const closeup = el.querySelector('app-planet-closeup');
    expect(closeup?.textContent).toContain('Eine rote Wüste');
    expect(closeup?.textContent).toContain('228 Mio. km');
    button('Zurück zum Sonnensystem').click();
    advance(50);
    expect(el.querySelector('app-planet-closeup')).toBeNull();
  });

  it('opens the Moon from Erde und Mond, the Sun and Voyager 1 from the solar system', async () => {
    await render();
    button('Mond').click();
    advance(5000);
    button('Mond ansehen').click();
    advance(50);
    expect(el.querySelector('app-planet-closeup h2')?.textContent).toBe('Mond');
    button('Wie genau weiss man das?').click();
    advance(50);
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('Mond');
    el.querySelector('app-fact-sheet')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    advance(50);
    button('Zurück zu Erde und Mond').click();
    advance(50);
    expect(el.querySelector('h2')?.textContent).toBe('Erde und Mond');
    button('Sonnensystem').click();
    advance(5000);
    button('Sonne ansehen').click();
    advance(50);
    expect(el.querySelector('app-planet-closeup h2')?.textContent).toBe('Sonne');
    expect(el.querySelector('app-planet-closeup app-birth-year-form')).toBeNull();
    button('Zurück zum Sonnensystem').click();
    advance(50);
    button('Voyager 1 ansehen').click();
    advance(50);
    expect(el.querySelector('app-planet-closeup h2')?.textContent).toBe('Voyager 1');
    button('Wie genau weiss man das?').click();
    advance(50);
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('Pale Blue Dot');
  });

  it('flashes the Earth marker when the Earth is selected', async () => {
    await render();
    button('Sonnensystem').click();
    advance(5000);
    el.querySelector<HTMLButtonElement>('app-solar-system-layer button[aria-label="Erde ansehen"]')?.click();
    advance(50);
    expect(el.querySelector('app-earth-marker')?.classList).toContain('flash');
  });

  it('goes home from the universe and marks the module explored', async () => {
    await render();
    button('Universum').click();
    advance(30_000);
    button('Und jetzt zurück. Nach Hause.').click();
    advance(11_000);
    expect(text()).toContain('All das. Und mittendrin: wir.');
    expect(TestBed.inject(ExplorationProgress).isExplored('A')).toBe(true);
    expect(button('Nochmal reisen')).toBeTruthy();
    button('Bild teilen').click();
    advance(50);
    expect(el.querySelector('app-share-card-dialog')).not.toBeNull();
  });

  it('jumps to the scale bar from the end', async () => {
    await render();
    button('Universum').click();
    advance(30_000);
    button('Und jetzt zurück. Nach Hause.').click();
    advance(11_000);
    button('Zu einer Stufe springen').click();
    advance(10);
    expect(document.activeElement?.textContent?.trim()).toBe('Erde');
    button('Nochmal reisen').click();
    advance(50);
    expect(text()).not.toContain('All das');
  });

  it('keeps the main-journey variant compact and reports completion', async () => {
    await render('hauptreise');
    const done = vi.fn();
    fixture.componentInstance.completed.subscribe(done);
    button('Sonnensystem').click();
    advance(5000);
    expect(el.querySelector('button[aria-label="Mars ansehen"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Sonne ansehen"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Mond ansehen"]')).toBeNull();
    expect(el.querySelector('button[aria-label="Voyager 1 ansehen"]')).toBeNull();
    expect(el.querySelector('.icon-link[aria-label="Wie genau weiss man das?"]')).not.toBeNull();
    button('Universum').click();
    advance(30_000);
    button('Und jetzt zurück. Nach Hause.').click();
    advance(11_000);
    expect(text()).toContain('So schnell, wie es überhaupt geht.');
    button('Weiter').click();
    expect(done).toHaveBeenCalled();
  });

  it('keeps the journey waiting while a planet is open', async () => {
    await render();
    button('Sonnensystem').click();
    advance(5000);
    button('Jupiter ansehen').click();
    advance(50);
    const closeup = el.querySelector('app-planet-closeup') as HTMLElement;
    for (let i = 0; i < 10; i++) {
      closeup.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
    }
    advance(3000);
    expect(el.querySelector('app-planet-closeup')).not.toBeNull();
    expect(el.querySelector('.behind')?.hasAttribute('inert')).toBe(true);
    button('Zurück zum Sonnensystem').click();
    advance(50);
    expect(el.querySelector('.behind')?.hasAttribute('inert')).toBe(false);
    expect(el.querySelector('h2')?.textContent).toBe('Das Sonnensystem');
  });

  it('ignores travel keys while a planet is open', async () => {
    await render();
    button('Sonnensystem').click();
    advance(5000);
    button('Mars ansehen').click();
    advance(50);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    advance(2000);
    expect(el.querySelector('app-planet-closeup')).not.toBeNull();
  });

  it('opens the credits from the fact sheet', async () => {
    await render();
    button('Wie genau weiss man das?').click();
    advance(50);
    button('Bildnachweise').click();
    advance(50);
    expect(el.querySelector('app-credits-dialog')?.textContent).toContain('EHT Collaboration');
    button('Bildnachweise schliessen').click();
    advance(50);
    expect(el.querySelector('app-credits-dialog')).toBeNull();
  });
});

describe('OutwardJourneyPage', { timeout: 30_000 }, () => {
  it('shows the free-exploration variant', async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    const fixture = TestBed.createComponent(OutwardJourneyPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('main app-outward-journey')).not.toBeNull();
    expect(el.querySelector('button[aria-label="Mars ansehen"]')).not.toBeNull();
  });
});
