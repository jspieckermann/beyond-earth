import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CLOCK } from '../core/clock';
import { DarknessLevel, StoredPlace } from '../core/models';
import { NightMode } from '../core/night-mode';
import { TonightService } from '../core/tonight';
import { GEOLOCATE } from './place/geolocation';
import { Tonight, TonightVariant } from './tonight';

const HAMBURG: StoredPlace = { name: 'Hamburg', region: 'Hamburg', lat: 53.55, lon: 9.99, tz: 'Europe/Berlin', source: 'list' };
const MADRID: StoredPlace = { name: 'Dein Standort', lat: 40.42, lon: -3.7, tz: 'Europe/Madrid', source: 'device' };

/** 26 Nov 2026, 16:00 in Hamburg (Moon 94 %). */
const NOV_26 = new Date('2026-11-26T15:00:00Z');
/** 9 Dec 2026, 16:00 in Hamburg (new Moon). */
const DEC_9 = new Date('2026-12-09T15:00:00Z');

describe('Tonight', () => {
  let fixture: ComponentFixture<Tonight>;
  let el: HTMLElement;
  let geolocate: ReturnType<typeof vi.fn>;

  async function render(options: { place?: StoredPlace; darkness?: DarknessLevel; now?: Date; variant?: TonightVariant } = {}) {
    geolocate = vi.fn(() => Promise.resolve({ lat: 53.55, lon: 10 }));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CLOCK, useValue: () => options.now ?? NOV_26 }, { provide: GEOLOCATE, useValue: geolocate }],
    });
    const tonight = TestBed.inject(TonightService);
    if (options.place) {
      tonight.choosePlace(options.place);
      tonight.setDarkness(options.darkness ?? 2);
    }
    fixture = TestBed.createComponent(Tonight);
    if (options.variant) {
      fixture.componentRef.setInput('variant', options.variant);
    }
    el = fixture.nativeElement as HTMLElement;
    document.body.append(el);
    await fixture.whenStable();
  }

  afterEach(() => {
    el.remove();
    localStorage.clear();
    document.documentElement.classList.remove('night');
  });

  const text = () => el.textContent ?? '';
  const button = (label: string) => [...el.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(label)) as HTMLButtonElement;
  const cards = () => [...el.querySelectorAll('app-object-card')];
  const card = (name: string) => cards().find((c) => c.querySelector('.name')?.textContent === name) as HTMLElement;
  const click = async (b: HTMLElement) => {
    b.click();
    await fixture.whenStable();
  };

  describe('one page', () => {
    const field = () => el.querySelector('#place-search') as HTMLInputElement;
    const darknessButton = () => el.querySelector('#darkness-button') as HTMLButtonElement;

    it('asks for the place on a first visit, without the list and without asking for the location', async () => {
      await render();
      expect(el.querySelector('h2')?.textContent).toBe('Wo stehst du heute Nacht?');
      expect(document.activeElement).toBe(el.querySelector('#h-place'));
      expect(field().value).toBe('');
      expect(el.querySelector('app-darkness-choice')).toBeNull();
      expect(el.querySelector('app-object-card')).toBeNull();
      expect(el.querySelector('app-step-bar')).toBeNull();
      expect(geolocate).not.toHaveBeenCalled();
    });

    it('shows the stored place in the field with its level, and the list below', async () => {
      await render({ place: HAMBURG });
      expect(field().value).toBe('Hamburg');
      expect(darknessButton().textContent).toContain('Stadtrand, Vorort');
      expect(cards().length).toBeGreaterThan(0);
      expect(document.activeElement).toBe(el.querySelector('#h-place'));
    });

    it('stores a chosen place with the suggested level at once, and a changed level too', async () => {
      await render();
      field().focus();
      field().value = 'Rhön';
      field().dispatchEvent(new Event('input'));
      await fixture.whenStable();
      const option = [...el.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes('Sternenpark Rhön')) as HTMLElement;
      option.dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
      await fixture.whenStable();
      const service = TestBed.inject(TonightService);
      expect(service.place()?.name).toBe('Sternenpark Rhön');
      expect(service.darkness()).toBe(5);
      expect(field().value).toBe('Sternenpark Rhön');
      expect(el.querySelectorAll('[role="option"]')).toHaveLength(0);
      expect(el.querySelector('app-darkness-choice .hint')?.textContent).toBe('Vorgeschlagen für einen Sternenpark.');
      expect(cards().length).toBeGreaterThan(0);

      await click(darknessButton());
      (el.querySelector('#darkness-4') as HTMLElement).dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
      await fixture.whenStable();
      expect(service.darkness()).toBe(4);
      expect(darknessButton().textContent).toContain('Auf dem Land');
      expect(el.querySelector('app-darkness-choice .hint')).toBeNull();
    });

    it('suggests level 1 for a big city', async () => {
      await render({ place: HAMBURG, darkness: 1 });
      expect(el.querySelector('app-darkness-choice .hint')?.textContent).toBe('Vorgeschlagen für eine Grossstadt.');
    });

    it('has no „Ort vergessen“', async () => {
      await render({ place: HAMBURG });
      expect(button('Ort vergessen')).toBeUndefined();
    });

    it('has no night-mode switch, only a tip pointing to the settings while it is off', async () => {
      await render({ place: HAMBURG });
      expect(button('Nachtmodus')).toBeUndefined();
      expect(el.querySelector('.tips a')?.getAttribute('href')).toBe('/einstellungen');
      TestBed.inject(NightMode).set(true);
      await fixture.whenStable();
      expect(el.querySelector('.tips a')).toBeNull();
      expect(el.querySelector('[role="switch"], [aria-pressed]:not(.pill)')).toBeNull();
    });
  });

  describe('the sky in Hamburg on 26 November', () => {
    it('shows the conditions, the moments and then the summary', async () => {
      await render({ place: HAMBURG });
      const box = el.querySelector('app-conditions') as HTMLElement;
      expect(box.textContent).toContain('Dunkel ab 18:15 Uhr');
      expect(box.textContent).toMatch(/Mond 9\d %, fast voll, ab 17:20 Uhr am Himmel/);
      expect(box.querySelector('.warn')?.textContent).toMatch(/Mond/);
      expect(box.textContent).not.toContain('Dunkelheit');
      const summary = el.querySelector('.summary') as HTMLElement;
      expect(summary.textContent).toMatch(/^Um 20 Uhr siehst du \d+ Dinge mit blossem Auge\. Der helle Mond schluckt heute alles Blasse/);
      const moments = el.querySelector('.moments') as HTMLElement;
      expect(moments.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(box.compareDocumentPosition(moments) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('lists the objects with position and ease, the first one expanded', async () => {
      await render({ place: HAMBURG });
      expect(cards()[0].querySelector('.name')?.textContent).toBe('Mond');
      expect(cards()[0].querySelector('.head')?.getAttribute('aria-expanded')).toBe('true');
      const saturn = card('Saturn');
      expect(saturn.querySelector('.position')?.textContent).toBe('Süden · Vier Fäuste hoch');
      expect(saturn.querySelector('.ease')?.textContent).toBe('Leicht');
      expect(saturn.querySelector('.head')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('expands a card with the marked naked-eye photo, the eye sentence and the steps, without a close-up', async () => {
      await render({ place: HAMBURG });
      await click(card('Saturn').querySelector('.head') as HTMLElement);
      const saturn = card('Saturn');
      expect(saturn.querySelector('.head')?.getAttribute('aria-expanded')).toBe('true');
      // Opening Saturn leaves the Moon open: nothing above it moves.
      expect(cards()[0].querySelector('.head')?.getAttribute('aria-expanded')).toBe('true');
      await click(saturn.querySelector('.head') as HTMLElement);
      expect(card('Saturn').querySelector('.head')?.getAttribute('aria-expanded')).toBe('false');
      await click(card('Saturn').querySelector('.head') as HTMLElement);
      expect(saturn.querySelector('app-marked-photo img')?.getAttribute('alt')).toContain('Markiert: Saturn.');
      expect(saturn.querySelector('app-marked-photo svg text')?.textContent).toBe('Saturn');
      expect(saturn.textContent).not.toContain('Nahaufnahme');
      expect(saturn.querySelectorAll('img')).toHaveLength(2);
      expect(saturn.textContent).toContain('Mit dem Auge: Ein ruhiger, gelblicher Punkt.');
      const steps = [...saturn.querySelectorAll('ol li')].map((li) => li.textContent);
      expect(steps[0]).toBe('Dreh dich nach Süden.');
      expect(steps).toHaveLength(3);
      expect(saturn.textContent).toContain('Sichtbar: bis 1:30 Uhr');
    });

    it('marks constellations in the photo and draws them only as the thumbnail', async () => {
      await render({ place: HAMBURG });
      await click(card('Kassiopeia').querySelector('.head') as HTMLElement);
      const k = card('Kassiopeia');
      expect(k.textContent).not.toContain('Zeichnung');
      expect(k.querySelectorAll('app-star-drawing')).toHaveLength(1);
      expect(k.querySelector('.head app-star-drawing svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(k.querySelectorAll('app-marked-photo polyline').length).toBeGreaterThan(0);
    });

    it('follows the chosen moment', async () => {
      await render({ place: HAMBURG });
      expect(button('Abends').getAttribute('aria-pressed')).toBe('true');
      await click(button('Mitternacht'));
      expect(button('Mitternacht').getAttribute('aria-pressed')).toBe('true');
      expect(el.querySelector('.summary')?.textContent).toMatch(/^Um 0 Uhr/);
      expect(cards().some((c) => c.querySelector('.name')?.textContent?.startsWith('Jupiter'))).toBe(true);
      expect(card('Plejaden').querySelector('.position')?.textContent).toMatch(/^Süden/);
    });

    it('lists what is hidden tonight with reasons and the Milky Way next good night', async () => {
      await render({ place: HAMBURG });
      const hidden = el.querySelector('app-hidden-list') as HTMLElement;
      expect(hidden.textContent).toContain('Milchstrasse');
      expect(hidden.textContent).toContain('Dein Ort ist zu hell.');
      expect(el.querySelector('.note')?.textContent).toContain('Nächste gute Nacht für die Milchstrasse: Samstag, 28. November');
    });

    it('shows the tips with the Moon tip and opens the facts', async () => {
      await render({ place: HAMBURG });
      expect(text()).toContain('Gib deinen Augen 20 Minuten.');
      expect(text()).toContain('Stell dich so, dass der Mond hinter dir steht');
      const facts = button('Wie genau weiss man das?');
      await click(facts);
      expect(el.querySelector('app-fact-sheet')).not.toBeNull();
      el.querySelector('app-fact-sheet')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(el.querySelector('app-fact-sheet')).toBeNull();
      expect(document.activeElement).toBe(facts);
    });

    it('puts the Milky Way first on a moonless night at a dark place', async () => {
      await render({ place: HAMBURG, darkness: 4, now: DEC_9 });
      expect(cards()[0].querySelector('.name')?.textContent).toBe('Milchstrasse');
      expect(el.querySelector('.summary')?.textContent).toContain('Heute ist eine Nacht für die Milchstrasse.');
      expect(el.querySelector('.note')).toBeNull();
    });

    it('has no steps outside Central Europe', async () => {
      await render({ place: MADRID });
      expect(cards().length).toBeGreaterThan(0);
      expect(cards()[0].textContent).toContain('Eine Anleitung für diesen Ort gibt es noch nicht.');
    });
  });

  describe('the guided journey', () => {
    it('shows only the summary and the first three objects, collapsed', async () => {
      let completed = false;
      await render({ place: HAMBURG, variant: 'hauptreise' });
      fixture.componentInstance.completed.subscribe(() => (completed = true));
      expect(text()).toContain('„Und all das kannst du sehen. Heute Nacht, über dir.“');
      expect(el.querySelector('.moments')).toBeNull();
      expect(cards()).toHaveLength(3);
      expect(el.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0);
      expect(el.querySelector('app-hidden-list')).toBeNull();
      expect(button('Wie genau')).toBeUndefined();
      await click(button('Zurück zum Himmel'));
      expect(completed).toBe(true);
    });

    it('lets the journey skip the place', async () => {
      await render({ variant: 'hauptreise' });
      await click(button('Überspringen'));
      expect(text()).toContain('Such dir heute Nacht einen dunklen Platz, weg von Strassenlaternen, und schau nach oben.');
      expect(text()).toContain('„Die Reise endet hier. Die Milchstrasse nicht.“');
    });
  });
});
