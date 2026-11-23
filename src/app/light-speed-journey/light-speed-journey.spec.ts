import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorationProgress } from '../core/exploration-progress';
import { Haptics } from '../core/haptics';
import { JourneyTestOptions, journeyTestProviders } from '../outward-journey/testing';
import { LightSpeedJourney } from './light-speed-journey';

describe('LightSpeedJourney', { timeout: 30_000 }, () => {
  let fixture: ComponentFixture<LightSpeedJourney>;
  let el: HTMLElement;
  let pulse: ReturnType<typeof vi.fn<() => void>>;

  async function render(inputs: Record<string, unknown> = {}, options: JourneyTestOptions = {}) {
    TestBed.configureTestingModule({ providers: journeyTestProviders({ now: new Date(Date.UTC(2026, 10, 23, 12)), ...options }) });
    pulse = vi.fn<() => void>();
    TestBed.inject(Haptics).pulse = pulse;
    fixture = TestBed.createComponent(LightSpeedJourney);
    for (const [k, v] of Object.entries(inputs)) {
      fixture.componentRef.setInput(k, v);
    }
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  }

  const text = () => el.textContent?.replace(/\s+/g, ' ') ?? '';
  const button = (name: string) =>
    [...el.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').replace(/\s+/g, ' ').trim().startsWith(name)) as HTMLButtonElement;
  const live = () => el.querySelector('[aria-live]')?.textContent ?? '';
  const slider = () => el.querySelector<HTMLInputElement>('input[type="range"]') as HTMLInputElement;
  const numbers = () => [...el.querySelectorAll('dd')].map((d) => d.textContent?.trim());

  async function type(value: string) {
    const field = el.querySelector<HTMLInputElement>('#speed-percent') as HTMLInputElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  afterEach(() => {
    el.remove();
    document.body.replaceChildren();
    localStorage.clear();
  });

  it('starts with Proxima Centauri at 10 %, focus on its heading and a way back', async () => {
    await render();
    expect(document.activeElement?.textContent).toBe('Reisen mit Lichtgeschwindigkeit');
    expect(el.querySelector('a[aria-label="Zurück zum Himmel"]')?.getAttribute('href')).toBe('/');
    expect(el.querySelector('.goal-name')?.textContent).toBe('Proxima Centauri');
    expect(slider().getAttribute('aria-valuetext')).toBe('10 % der Lichtgeschwindigkeit');
    expect(numbers()).toEqual(['42,2 Jahre', '42,4 Jahre', '1', '1']);
    expect(text()).toContain('Wer abfliegt, kommt an.');
    expect([...el.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(['Ziel', 'Tempo', 'Ankunft']);
  });

  it('marks the module explored once a journey is shown', async () => {
    await render();
    expect(TestBed.inject(ExplorationProgress).isExplored('B')).toBe(true);
  });

  it('recalculates with a preset and announces and pulses once', async () => {
    await render();
    button('Voyager 1').click();
    await fixture.whenStable();
    expect(button('Voyager 1').getAttribute('aria-pressed')).toBe('true');
    expect(text()).toContain('0,0057 %');
    expect(text()).toContain('etwa 17 km/s');
    expect(numbers()).toEqual(['74.772 Jahre', '74.772 Jahre', '2.991', '2.991']);
    expect(el.querySelectorAll('.figures svg').length).toBeLessThanOrEqual(20);
    expect(text()).toContain('Eine Figur steht für 1.000 Generationen.');
    expect(text()).toContain('Wer abfliegt, kommt nie an.');
    expect(live()).toContain('Proxima Centauri, 0,0057 % der Lichtgeschwindigkeit: auf der Erde 74.772 Jahre');
    expect(pulse).toHaveBeenCalledTimes(1);
  });

  it('follows the slider at once but announces only on release', async () => {
    await render();
    slider().value = '700';
    slider().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(slider().getAttribute('aria-valuetext')).not.toBe('10 % der Lichtgeschwindigkeit');
    expect(live()).toBe('');
    expect(pulse).not.toHaveBeenCalled();
    slider().dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(live()).toContain('Proxima Centauri');
    expect(pulse).toHaveBeenCalledTimes(1);
  });

  it('takes exact values and clamps 100 % with the light-speed hint', async () => {
    await render();
    await type('1');
    expect(numbers()).toEqual(['424 Jahre', '424 Jahre', '17', '17']);
    expect(el.querySelectorAll('.figures svg')).toHaveLength(17);
    expect(el.querySelector('.figures')?.getAttribute('aria-label')).toBe('17 Generationen an Bord');
    expect(text()).toContain('Galileis erster Blick durchs Fernrohr');
    await type('100');
    expect(slider().getAttribute('aria-valuetext')).toBe('99,9999 % der Lichtgeschwindigkeit');
    expect(text()).toContain('Auf 99,9999 % gesetzt');
    await type('schnell');
    expect(text()).toContain('Bitte eine Zahl eingeben');
  });

  it('chooses a destination from the grouped, searchable list', async () => {
    await render();
    button('Proxima Centauri').click();
    await fixture.whenStable();
    const dialog = el.querySelector('app-destination-picker') as HTMLElement;
    expect(dialog.querySelectorAll('h3')).toHaveLength(7);
    const search = dialog.querySelector('input') as HTMLInputElement;
    expect(document.activeElement).toBe(search);
    search.value = 'andro';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const offered = [...dialog.querySelectorAll('li button')];
    expect(offered.map((b) => [b.querySelector('.name')?.textContent, b.querySelector('.distance')?.textContent])).toEqual([
      ['Andromeda', 'ca. 2,5 Mio. Lichtjahre'],
    ]);
    expect(dialog.querySelector('h3')?.textContent).toBe('Die Lokale Gruppe');
    (offered[0] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('app-destination-picker')).toBeNull();
    expect(el.querySelector('.goal-name')?.textContent).toBe('Andromeda');
    expect(live()).toContain('Andromeda');
    expect(pulse).toHaveBeenCalledTimes(1);
  });

  it('explains the closest approach of a planet and closes the list with Escape', async () => {
    await render({ destinationId: 'mars' });
    expect(text()).toContain('55 Mio. km');
    expect(text()).toContain('Bei günstigster Stellung');
    button('Mars').click();
    await fixture.whenStable();
    el.querySelector('dialog')?.dispatchEvent(new Event('cancel', { cancelable: true }));
    await fixture.whenStable();
    expect(el.querySelector('app-destination-picker')).toBeNull();
  });

  it('shows lower bounds, "here" and "never"', async () => {
    await render({ destinationId: 'geschosshaufen' });
    expect(numbers()[0]).toMatch(/^mindestens /);
    expect(text()).toContain('dehnt sich der Raum weiter aus');
    fixture.componentRef.setInput('destinationId', 'orion-arm');
    await fixture.whenStable();
    expect(el.querySelector('dl')).toBeNull();
    expect(text()).toContain('Du musst nicht reisen. Du bist schon da');
    fixture.componentRef.setInput('destinationId', 'ton-618');
    await fixture.whenStable();
    expect(el.querySelector('dl')).toBeNull();
    expect(text()).toContain('Nie. Selbst das Licht kommt dort nicht mehr an.');
    expect(button('Bild teilen')).toBeUndefined();
  });

  it('shows time dilation for Sagittarius A* at 99,9999 %', async () => {
    await render({ destinationId: 'sgr-a' });
    await type('99,9999');
    expect(numbers()).toEqual(['36,8 Jahre', '26.000 Jahre', '1', '1.041']);
    expect(text()).toContain('Du kommst an. Aber zu Hause kennt dich niemand mehr.');
  });

  it('adds the birth-year line only when a birth year is stored', async () => {
    localStorage.setItem('be.birthYear', '1996');
    await render();
    await type('20');
    expect(text()).toContain('Wärst du bei deiner Geburt aufgebrochen, wärst du schon angekommen: im Jahr 2017.');
    expect(el.querySelector('input[type="number"]')).toBeNull();
  });

  it('never asks for a birth year', async () => {
    await render();
    expect(text()).not.toContain('Geburt');
  });

  it('opens the fact sheet and returns focus to its opener', async () => {
    await render();
    button('Wie genau weiss man das?').click();
    await fixture.whenStable();
    expect(text()).toContain('ohne Beschleunigen, ohne Bremsen');
    expect(text()).toContain('Eine Generation zählt 25 Jahre.');
    expect(text()).toContain('NASA/JPL (Voyager 1)');
    el.querySelector('app-fact-sheet')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(el.querySelector('app-fact-sheet')).toBeNull();
    expect(document.activeElement?.textContent).toBe('Wie genau weiss man das?');
  });

  it('opens the travel card', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:card');
    URL.revokeObjectURL = vi.fn();
    await render();
    await type('1');
    button('Bild teilen').click();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    expect(el.querySelector('app-share-card-dialog')?.textContent).toContain(
      'Nach Proxima Centauri mit 1 % der Lichtgeschwindigkeit: 424 Jahre.',
    );
    expect(el.querySelector('app-share-card-dialog')?.textContent).toContain(
      'An Bord vergehen dabei 17 Generationen.',
    );
  });

  it('links back to the close-up of Modul A it came from', async () => {
    await render({ destinationId: 'sirius', from: 'alpha-centauri' });
    const back = [...el.querySelectorAll('a')].find((a) => a.textContent?.includes('Zurück zu Sirius'));
    expect(back?.getAttribute('href')).toBe('/module/reise-nach-draussen?stufe=alpha-centauri&nah=sirius');
    expect(el.querySelector('.goal-name')?.textContent).toBe('Sirius');
  });

  it('has no way back to Modul A without a known stage', async () => {
    await render({ destinationId: 'sirius', from: 'irgendwo' });
    expect(text()).not.toContain('Zurück zu Sirius');
  });

  it('shows the time on board before the time on Earth, and no moving picture', async () => {
    await render();
    expect([...el.querySelectorAll('dt')].map((d) => d.textContent)).toEqual([
      'An Bord',
      'Auf der Erde',
      'Generationen an Bord',
      'Generationen auf der Erde',
    ]);
    expect(el.querySelector('app-journey-line')).toBeNull();
  });

  it('steps through three speeds in the main-journey variant and then completes', async () => {
    await render({ variant: 'hauptreise', destinationId: 'andromeda' });
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    expect(el.querySelector('.goal-name')?.textContent).toBe('Proxima Centauri');
    expect(slider()).toBeNull();
    expect(button('Ziel ändern')).toBeUndefined();
    expect(button('Bild teilen')).toBeUndefined();
    expect(text()).toContain('0,0057 % der Lichtgeschwindigkeit');
    button('Weiter').click();
    await fixture.whenStable();
    expect(text()).toContain('20 % der Lichtgeschwindigkeit');
    button('Weiter').click();
    await fixture.whenStable();
    expect(text()).toContain('99 % der Lichtgeschwindigkeit');
    expect(completed).not.toHaveBeenCalled();
    button('Weiter').click();
    expect(completed).toHaveBeenCalledTimes(1);
  });
});
