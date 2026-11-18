import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TonightInfo } from '../core/models';
import { TonightCard } from './tonight-card';

const HAMBURG: TonightInfo = {
  location: 'Hamburg',
  visibleFrom: '19:40',
  darkness: 2,
  moon: 'Mond geht um 22:10 unter',
  mission: 'Finde den Schwan. Er fliegt mitten durch das Band.',
};

describe('TonightCard', () => {
  async function render(info: TonightInfo | null) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(TonightCard);
    fixture.componentRef.setInput('info', info);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows tonight at a known place', async () => {
    const el = await render(HAMBURG);
    const text = el.textContent ?? '';
    expect(el.querySelector('.kicker')?.textContent).toContain('Heute Nacht · Hamburg');
    expect(text).toContain('Ab 19:40 ist das Band sichtbar.');
    expect(text).toContain('Mond geht um 22:10 unter');
    expect(text).toContain('Mission: Finde den Schwan.');
  });

  it('draws the darkness on a five-point scale with a text equivalent', async () => {
    const el = await render(HAMBURG);
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

  it('links to the Heute-Nacht destination', async () => {
    const el = await render(null);
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/heute-nacht');
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
      fixture.componentRef.setInput('info', HAMBURG);
      await fixture.whenStable();
      expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();
      expect(geolocation.watchPosition).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(navigator, 'geolocation');
    }
  });
});
