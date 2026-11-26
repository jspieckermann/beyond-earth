import { TestBed } from '@angular/core/testing';
import { EYE_VIEWS } from '../data/pictures';
import { OBJECTS } from '../data/objects';
import { MarkedPhoto, markedAlt } from './marked-photo';
import { StarDrawing } from './star-drawing';
import { ConditionsBox } from './conditions';

describe('MarkedPhoto', () => {
  async function render(key: keyof typeof EYE_VIEWS, name: string) {
    const fixture = TestBed.createComponent(MarkedPhoto);
    fixture.componentRef.setInput('view', EYE_VIEWS[key]);
    fixture.componentRef.setInput('name', name);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('draws the marks in the picture’s own pixels, so they scale with it', async () => {
    const el = await render('plejaden', 'Plejaden');
    const svg = el.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('viewBox')).toBe('0 0 960 640');
    const rings = [...svg.querySelectorAll('circle')];
    expect(rings[0].getAttribute('cx')).toBe('284');
    expect(rings[0].getAttribute('r')).toBe('40');
    expect(rings.filter((r) => r.classList.contains('minor'))).toHaveLength(2);
    expect([...svg.querySelectorAll('text')].map((t) => t.textContent)).toEqual(['Plejaden', 'Venus', 'Kapella']);
    const img = el.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('tonight/img/eye-plejaden.webp');
  });

  it('names what is marked in the text alternative', async () => {
    const el = await render('plejaden', 'Plejaden');
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Foto ohne Teleskop: Plejaden am Nachthimmel. Markiert: Plejaden. Zur Orientierung: Venus, Kapella.');
    expect(markedAlt(EYE_VIEWS.kassiopeia, 'Kassiopeia')).toBe('Foto ohne Teleskop: Kassiopeia am Nachthimmel. Markiert: Kassiopeia.');
  });

  it('draws figure lines with small rings on the stars', async () => {
    const el = await render('kassiopeia', 'Kassiopeia');
    expect(el.querySelector('polyline')?.getAttribute('points')).toBe('604,136 680,302 507,345 485,480 315,545');
    expect(el.querySelectorAll('circle.small')).toHaveLength(5);
  });

  it('keeps labels inside the picture', async () => {
    const el = await render('jupiter+mars', 'Jupiter und Mars');
    const xs = [...el.querySelectorAll('text')].map((t) => Number(t.getAttribute('x')));
    expect(xs.every((x) => x >= 90 && x <= 870)).toBe(true);
  });
});

describe('StarDrawing', () => {
  const render = async (id: string) => {
    const fixture = TestBed.createComponent(StarDrawing);
    const o = OBJECTS.find((x) => x.id === id);
    fixture.componentRef.setInput('drawing', o && 'drawing' in o.look ? o.look.drawing : null);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('draws a figure from real star positions as a decorative thumbnail', async () => {
    const el = await render('kassiopeia');
    const svg = el.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('viewBox')).toBe('0 0 64 64');
    expect(el.querySelectorAll('circle')).toHaveLength(5);
    expect(el.querySelectorAll('line')).toHaveLength(4);
    expect(el.querySelectorAll('text')).toHaveLength(0);
  });

  it('draws east to the left: Caph (smallest right ascension) furthest right', async () => {
    const el = await render('kassiopeia');
    const xs = [...el.querySelectorAll('circle')].map((c) => Number(c.getAttribute('cx')));
    const o = OBJECTS.find((x) => x.id === 'kassiopeia');
    const stars = o && 'drawing' in o.look ? o.look.drawing.stars : [];
    expect(xs[stars.indexOf('caph')]).toBe(Math.max(...xs));
  });
});

describe('ConditionsBox', () => {
  it('shows two quiet lines and highlights a disturbing Moon', async () => {
    const fixture = TestBed.createComponent(ConditionsBox);
    fixture.componentRef.setInput('conditions', {
      dark: { value: 'Dunkel ab 18:15 Uhr', label: '' },
      moon: { value: 'Mond 94 %', label: 'fast voll, ab 17:20 Uhr am Himmel', warn: true },
    });
    await fixture.whenStable();
    const items = [...(fixture.nativeElement as HTMLElement).querySelectorAll('li')];
    expect(items.map((li) => li.textContent?.trim())).toEqual(['Dunkel ab 18:15 Uhr', 'Mond 94 %, fast voll, ab 17:20 Uhr am Himmel']);
    expect(items[1].classList.contains('warn')).toBe(true);
    expect(items[0].classList.contains('warn')).toBe(false);
  });
});
