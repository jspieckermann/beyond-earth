import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TonightInfo } from '../core/models';
import { TonightCard } from './tonight-card';

const GOOD: TonightInfo = {
  location: 'Hamburg',
  darkness: 4,
  headline: '9 Dinge mit blossem Auge, zum Beispiel die Milchstrasse.',
  darkFrom: 'Dunkel ab 18:15 Uhr',
  moon: 'Der Mond geht um 23 Uhr auf. Bis dahin ist es dunkel.',
};

const POOR: TonightInfo = {
  location: 'Hamburg',
  darkness: 2,
  headline: '7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.',
  darkFrom: 'Dunkel ab 18:15 Uhr',
  milkyWayNext: 'Die Milchstrasse: wieder am Samstag.',
  moon: 'Vollmond. Er überstrahlt die Milchstrasse die ganze Nacht.',
};

describe('TonightCard', () => {
  async function render(info: TonightInfo | null) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(TonightCard);
    fixture.componentRef.setInput('info', info);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the count and the highlight at a known place', async () => {
    const el = await render(GOOD);
    const text = el.textContent ?? '';
    expect(el.querySelector('.kicker')?.textContent).toContain('Heute Nacht · Hamburg');
    expect(el.querySelector('.title')?.textContent).toBe('9 Dinge mit blossem Auge, zum Beispiel die Milchstrasse.');
    expect(text).toContain('Dunkel ab 18:15 Uhr');
    expect(text).toContain('Der Mond geht um 23 Uhr auf.');
    expect(text).not.toContain('Mission');
    expect(el.querySelector('.next')).toBeNull();
  });

  it('names a planet as highlight and the Milky Way next good night when the Moon hides it', async () => {
    const el = await render(POOR);
    expect(el.querySelector('.title')?.textContent).toBe('7 Dinge mit blossem Auge, zum Beispiel Saturn im Süden.');
    expect(el.querySelector('.next')?.textContent).toBe('Die Milchstrasse: wieder am Samstag.');
  });

  it('shows a quiet placeholder while tonight is being calculated', async () => {
    const el = await render({ location: 'Hamburg', darkness: 3, headline: '…' });
    expect(el.querySelector('.title')?.textContent).toBe('…');
    expect(el.querySelectorAll('.pip.on')).toHaveLength(3);
  });

  it('draws the darkness on a five-point scale with a text equivalent', async () => {
    const el = await render(POOR);
    expect(el.querySelectorAll('.pip')).toHaveLength(5);
    expect(el.querySelectorAll('.pip.on')).toHaveLength(2);
    expect(el.querySelector('.sr-only')?.textContent?.trim()).toBe('Dunkelheit 2 von 5');
  });

  it('invites to choose a place when none is known', async () => {
    const el = await render(null);
    const text = el.textContent ?? '';
    expect(text).toContain('Wo stehst du heute Nacht?');
    expect(text).toContain('Ort wählen');
    expect(el.querySelector('.pip')).toBeNull();
  });

  it('links to the Heute-Nacht page', async () => {
    const el = await render(null);
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/heute-nacht');
  });

  it('shows a visible way into Heute Nacht when a place is known', async () => {
    const el = await render(POOR);
    expect(el.querySelector('.choose')?.textContent?.trim()).toBe('Was du heute siehst');
    expect(el.querySelector('.choose')?.closest('a')?.getAttribute('href')).toBe('/heute-nacht');
  });

  it('never asks the browser for the device location', async () => {
    const geolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: geolocation });
    try {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(TonightCard);
      await fixture.whenStable();
      fixture.componentRef.setInput('info', GOOD);
      await fixture.whenStable();
      expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
      expect(geolocation.watchPosition).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(navigator, 'geolocation');
    }
  });
});
