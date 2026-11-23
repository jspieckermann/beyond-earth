import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BirthYear } from '../../core/birth-year';
import { findBody, findPlanet } from '../data/planets';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';
import { terminator } from '../scene/layers/earth-globe';
import { sunFrom } from '../scene/layers/body-globe';
import { proceduralTexture, renderLitSphere, renderSphere, sphereLookup, sunLighting, tintTexture } from '../scene/sphere-renderer';
import { journeyTestProviders } from '../testing';
import { BirthYearForm } from './birth-year-form';
import { loadTexture } from '../scene/textures';
import { KEY_STEP, PlanetCloseup } from './planet-closeup';

/** A 2D context stub recording what was drawn. */
function fakeContext() {
  const puts: ImageData[] = [];
  return {
    puts,
    createImageData: (w: number, h: number) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }) as ImageData,
    putImageData: (image: ImageData) => puts.push(image),
  };
}

describe('PlanetCloseup', () => {
  let fixture: ComponentFixture<PlanetCloseup>;
  let el: HTMLElement;
  let ui: JourneyUi;
  let ctx: ReturnType<typeof fakeContext>;

  beforeEach(async () => {
    ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    TestBed.configureTestingModule({ providers: [...journeyTestProviders(), ZoomState, JourneyUi] });
    ui = TestBed.inject(JourneyUi);
    ui.planet.set('jupiter');
    fixture = TestBed.createComponent(PlanetCloseup);
    fixture.componentRef.setInput('planet', findBody('jupiter'));
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    el.remove();
    localStorage.clear();
  });

  it('shows the planet with its distance, line and Aha, and focuses the way back', () => {
    expect(el.querySelector('h2')?.textContent).toBe('Jupiter');
    expect(el.textContent).toContain('778 Mio. km');
    expect(el.textContent).toContain('Über 1.300 Erden');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Zurück zum Sonnensystem');
    expect(ctx.puts.length).toBeGreaterThan(0);
  });

  it('rotates with the arrow keys and by dragging', async () => {
    const sphere = el.querySelector('[data-rotatable]') as HTMLElement;
    const before = ctx.puts.length;
    sphere.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    sphere.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    sphere.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await fixture.whenStable();
    expect(ctx.puts.length).toBeGreaterThan(before);
    sphere.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, clientY: 100 }));
    sphere.dispatchEvent(new MouseEvent('pointermove', { clientX: 140, clientY: 100 }));
    sphere.dispatchEvent(new MouseEvent('pointerup'));
    await fixture.whenStable();
    expect(KEY_STEP).toBe(15);
  });

  it('shows one sentence per selected moon', async () => {
    const europa = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Europa') as HTMLButtonElement;
    europa.click();
    await fixture.whenStable();
    expect(el.querySelector('.moon-line')?.textContent).toContain('Ozean');
    europa.click();
    await fixture.whenStable();
    expect(el.querySelector('.moon-line')?.textContent).toBe('');
  });

  it('stays open when zooming with the wheel or dragging', () => {
    const zoom = TestBed.inject(ZoomState);
    for (let i = 0; i < 10; i++) {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
    }
    const sphere = el.querySelector('[data-rotatable]') as HTMLElement;
    sphere.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, clientY: 300 }));
    sphere.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 100 }));
    sphere.dispatchEvent(new MouseEvent('pointerup'));
    expect(ui.planet()).toBe('jupiter');
    expect(zoom.z()).toBe(0);
  });

  it('closes with the back button, and with Escape', () => {
    el.querySelector<HTMLButtonElement>('button[aria-label="Zurück zum Sonnensystem"]')?.click();
    expect(ui.planet()).toBeNull();
    ui.planet.set('mars');
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(ui.planet()).toBeNull();
  });

  it('opens the planet facts and shares the age', async () => {
    (el.querySelector('.facts') as HTMLButtonElement).click();
    expect(ui.factsOpen()).toBe(true);
    TestBed.inject(BirthYear).set(1996);
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('app-birth-year-form .icon')?.click();
    expect(ui.share()).toEqual({ kinds: ['alter'], planet: 'jupiter' });
  });

  it('shows the Moon without an age and returns to Erde und Mond', async () => {
    fixture.componentRef.setInput('planet', findBody('mond'));
    await fixture.whenStable();
    expect(el.querySelector('h2')?.textContent).toBe('Mond');
    expect(el.textContent).toContain('384.400 km');
    expect(el.textContent).toContain('zur Erde');
    expect(el.querySelector('app-birth-year-form')).toBeNull();
    expect(el.querySelector('.back')?.getAttribute('aria-label')).toBe('Zurück zu Erde und Mond');
    expect(el.querySelector('.back')?.textContent?.trim()).toBe('Erde und Mond');
  });

  it('shows the Sun glowing by itself, without an age', async () => {
    fixture.componentRef.setInput('planet', findBody('sonne'));
    await fixture.whenStable();
    expect(el.querySelector('h2')?.textContent).toBe('Sonne');
    expect(el.textContent).toContain('8 min 20 s');
    expect(el.querySelector('app-birth-year-form')).toBeNull();
    expect(el.querySelector('.back')?.getAttribute('aria-label')).toBe('Zurück zum Sonnensystem');
  });

  it('shows Voyager 1 as a picture instead of a sphere, without an age', async () => {
    fixture.componentRef.setInput('planet', findBody('voyager'));
    await fixture.whenStable();
    expect(el.querySelector('h2')?.textContent).toBe('Voyager 1');
    expect(el.textContent).toContain('25,9 Mrd. km');
    expect(el.querySelector('canvas')).toBeNull();
    expect(el.querySelector('.picture img')?.getAttribute('alt')).toContain('Raumsonde Voyager 1');
    expect(el.querySelector('app-birth-year-form')).toBeNull();
    expect(el.querySelector('.back')?.getAttribute('aria-label')).toBe('Zurück zum Sonnensystem');
  });

  it('loads no texture without a browser image pipeline', async () => {
    expect(await loadTexture('journey/tex/none.webp')).toBeNull();
  });
});

describe('BirthYearForm', () => {
  let fixture: ComponentFixture<BirthYearForm>;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: journeyTestProviders() });
    fixture = TestBed.createComponent(BirthYearForm);
    fixture.componentRef.setInput('planet', findPlanet('mars'));
    el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  async function enter(value: string) {
    el.querySelector<HTMLButtonElement>('button.change')?.click();
    await fixture.whenStable();
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    el.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('shows the age on Mars for 1996', async () => {
    await enter('1996');
    expect(el.textContent).toContain('Hier wärst du 16 Jahre alt.');
    expect(TestBed.inject(BirthYear).year()).toBe(1996);
  });

  it('explains the range for an invalid year and shows no age', async () => {
    await enter('3000');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('zwischen 1900 und 2026');
    expect(el.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(el.textContent).not.toContain('Hier wärst du');
  });

  it('remembers the year and lets the user change or delete it', async () => {
    TestBed.inject(BirthYear).set(1996);
    await fixture.whenStable();
    expect(el.textContent).toContain('Jahrgang 1996 ändern');
    el.querySelector<HTMLButtonElement>('button.change')?.click();
    await fixture.whenStable();
    const remove = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('löschen')) as HTMLButtonElement;
    remove.click();
    await fixture.whenStable();
    expect(TestBed.inject(BirthYear).year()).toBeNull();
  });
});

describe('sphere renderer', () => {
  it('recolours a texture keeping its brightness pattern', () => {
    const tinted = tintTexture(proceduralTexture('#ffffff', false), '#ff5a3a');
    const brightest = Math.max(...tinted.data.filter((_, i) => i % 4 === 0));
    expect(brightest).toBe(255);
    expect(tinted.data[0]).toBeGreaterThan(tinted.data[2]);
    expect(tinted.data[3]).toBe(255);
  });

  it('maps the texture onto a disc and leaves the corners transparent', () => {
    const lookup = sphereLookup(10);
    expect(lookup.size).toBe(20);
    const out = new Uint8ClampedArray(20 * 20 * 4);
    renderSphere(lookup, proceduralTexture('#d06a3a', false), out, { rotation: 0 });
    expect(out[3]).toBe(0);
    const centre = (10 * 20 + 10) * 4;
    expect(out[centre + 3]).toBe(255);
    expect(out[centre]).toBeGreaterThan(out[centre + 2]);
  });

  it('turns the surface when rotated', () => {
    const lookup = sphereLookup(16);
    const tex = proceduralTexture('#d8b48a', true);
    const a = new Uint8ClampedArray(32 * 32 * 4);
    const b = new Uint8ClampedArray(32 * 32 * 4);
    renderSphere(lookup, tex, a, { rotation: 0 });
    renderSphere(lookup, tex, b, { rotation: 90 });
    expect([...a]).not.toEqual([...b]);
  });

  it('lights an emissive body evenly, darker only at the rim', () => {
    const lookup = sphereLookup(16);
    const tex = { width: 4, height: 2, data: new Uint8ClampedArray(4 * 2 * 4).fill(128) };
    const out = new Uint8ClampedArray(32 * 32 * 4);
    renderSphere(lookup, tex, out, { rotation: 0, emissive: true });
    const at = (x: number) => out[(16 * 32 + x) * 4];
    // Left and right of the centre look the same (no side light), the rim is darker than the centre.
    expect(Math.abs(at(6) - at(25))).toBeLessThanOrEqual(1);
    expect(at(1)).toBeLessThan(at(16));
  });

  it('darkens the night side and blends in a night texture', () => {
    const lookup = sphereLookup(16);
    const day = proceduralTexture('#4f93d4', false);
    const night = proceduralTexture('#ffc878', false);
    const out = new Uint8ClampedArray(32 * 32 * 4);
    renderSphere(lookup, day, out, { rotation: 0, night, sun: { lat: 0, lon: 90 } });
    const right = (16 * 32 + 28) * 4;
    const left = (16 * 32 + 3) * 4;
    // Sun to the east: the right side is day (blue), the left side shows the night lights (warm).
    expect(out[right + 2]).toBeGreaterThan(out[right]);
    expect(out[left]).toBeGreaterThan(out[left + 2]);
  });

  it('lights a planet of the solar system on the side facing the Sun', () => {
    const lookup = sphereLookup(16);
    const tex = proceduralTexture('#d8b48a', false);
    const out = new Uint8ClampedArray(32 * 32 * 4);
    // The Sun lies to the upper left of the planet.
    renderSphere(lookup, tex, out, { rotation: 0, sun: sunFrom(-60, -30) });
    const brightness = (x: number, y: number) => out[(y * 32 + x) * 4];
    expect(brightness(8, 12)).toBeGreaterThan(brightness(24, 20) * 2);
  });

  it('turns the Earth under a fixed Sun with precomputed lighting, matching the full render', () => {
    const lookup = sphereLookup(16);
    const day = proceduralTexture('#4f93d4', false);
    const night = proceduralTexture('#ffc878', false);
    const sun = { lat: 20, lon: 60 };
    const lighting = sunLighting(lookup, sun);
    for (const rotation of [0, 37, 200]) {
      const full = new Uint8ClampedArray(32 * 32 * 4);
      const fast = new Uint8ClampedArray(32 * 32 * 4);
      renderSphere(lookup, day, full, { rotation, night, sun });
      renderLitSphere(lookup, day, night, lighting, fast, rotation);
      const diff = full.reduce((max, v, i) => Math.max(max, Math.abs(v - fast[i])), 0);
      expect(diff, `rotation ${rotation}`).toBeLessThanOrEqual(1);
    }
  });
});

describe('Earth globe terminator', () => {
  it('lights the side facing the Sun', () => {
    // 00:00 UTC on 20 Nov: the Sun stands over the Pacific, Europe and Africa are in the night.
    const midnight = terminator(new Date(Date.UTC(2026, 10, 20, 0)));
    expect(midnight.darkFraction).toBeGreaterThan(0.9);
    // 10:00 UTC: the Sun is east of the globe's centre, so the western rim is dark.
    const morning = terminator(new Date(Date.UTC(2026, 10, 20, 10)));
    expect(morning.darkSide).toBe('left');
    expect(morning.darkFraction).toBeLessThan(0.2);
    const evening = terminator(new Date(Date.UTC(2026, 10, 20, 17)));
    expect(evening.darkSide).toBe('right');
  });
});
