import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JourneySettings } from '../../core/journey-settings';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';
import { JourneyScene } from '../scene/journey-scene';
import { LOCAL_GROUP_MARKS, UNIVERSE_MARKS } from '../scene/layers/galaxy-layers';
import { EarthMoonLayer } from '../scene/layers/near-layers';
import { SceneGeometry } from '../scene/scene-geometry';
import { JourneyTestOptions, journeyTestProviders } from '../testing';
import { DistanceReadout } from './distance-readout';
import { EarthMarker } from './earth-marker';
import { JourneyControls } from './journey-controls';
import { ScaleBar } from './scale-bar';
import { StageText } from './stage-text';

@Component({
  imports: [JourneyScene, StageText, ScaleBar, EarthMarker, DistanceReadout, JourneyControls],
  providers: [ZoomState, SceneGeometry, JourneyUi],
  template: `
    <app-journey-scene />
    <app-earth-marker />
    <app-distance-readout />
    <app-scale-bar />
    <app-stage-text />
    <app-journey-controls />
  `,
})
class Host {
  readonly zoom = inject(ZoomState);
  readonly ui = inject(JourneyUi);
  readonly geometry = inject(SceneGeometry);
}

describe('journey overlay', { timeout: 30_000 }, () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;
  let host: Host;

  async function render(options: JourneyTestOptions = {}) {
    TestBed.configureTestingModule({ providers: journeyTestProviders(options) });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    vi.useFakeTimers();
  }

  function advance(ms: number) {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('shows only the resting stage layer at a stage', async () => {
    await render();
    host.zoom.flyTo(2);
    advance(5000);
    const layers = [...el.querySelectorAll<HTMLElement>('.layer')];
    expect(layers[2].style.opacity).toBe('1');
    expect(layers.filter((l) => l.style.visibility === 'visible')).toHaveLength(1);
    expect(el.querySelector('.scene')?.getAttribute('aria-label')).toContain('Bahnen der acht Planeten');
  });

  it('shows the large distance only while moving', async () => {
    await render();
    const transit = el.querySelector<HTMLElement>('.transit');
    expect(transit?.style.opacity).toBe('0');
    host.zoom.nudge(0.4);
    fixture.detectChanges();
    expect(Number(transit?.style.opacity)).toBeGreaterThan(0.5);
    expect(el.querySelector('.text')).toBeNull();
  });

  it('highlights the resting stage and jumps from the bar', async () => {
    await render();
    const current = () => el.querySelector('[data-scale-bar] button[aria-current="location"]')?.textContent?.trim();
    expect(current()).toBe('Erde');
    const mond = [...el.querySelectorAll<HTMLButtonElement>('[data-scale-bar] button')].find((b) => b.textContent?.trim() === 'Mond');
    mond?.click();
    advance(1500);
    expect(current()).toBe('Mond');
    expect(el.querySelectorAll('[data-scale-bar] button.dim')).toHaveLength(6);
  });

  it('zooms by dragging the bar and steps with its arrow keys', async () => {
    await render();
    const range = el.querySelector<HTMLInputElement>('input[type="range"]') as HTMLInputElement;
    range.value = '3.6';
    range.dispatchEvent(new Event('input'));
    expect(host.zoom.z()).toBeCloseTo(3.6);
    range.dispatchEvent(new Event('change'));
    advance(1500);
    expect(host.zoom.restingStage()).toBe(4);
    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    advance(1500);
    expect(host.zoom.restingStage()).toBe(3);
    fixture.detectChanges();
    expect(range.getAttribute('aria-valuetext')).toBe('Benachbarte Sternensysteme, 4,24 Lichtjahre');
  });

  it('keeps keyboard focus in the scale bar when it turns compact and after choosing from the list', async () => {
    await render();
    document.body.appendChild(el);
    const stop = (name: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('app-scale-bar button')].find((b) => b.textContent?.trim() === name) as HTMLButtonElement;
    // Full bar: focus a stage button, then the stage texts grow and the bar turns compact.
    stop('Mond').focus();
    expect(document.activeElement?.textContent?.trim()).toBe('Mond');
    host.geometry.reportTextTop(300);
    advance(10);
    expect(el.querySelector('app-scale-bar')?.classList).toContain('compact');
    expect(document.activeElement?.textContent?.trim()).toBe('Stufen');
    // Compact list: choosing a stage closes the list and returns focus to "Stufen".
    stop('Stufen').click();
    advance(10);
    stop('Sonnensystem').focus();
    stop('Sonnensystem').click();
    advance(10);
    expect(el.querySelector('#stage-list')).toBeNull();
    expect(document.activeElement?.textContent?.trim()).toBe('Stufen');
    // Escape closes it the same way.
    stop('Stufen').click();
    advance(10);
    stop('Erde').focus();
    stop('Erde').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    advance(10);
    expect(document.activeElement?.textContent?.trim()).toBe('Stufen');
    el.remove();
  });

  it('lets focus leave the scale bar for good', async () => {
    await render();
    document.body.appendChild(el);
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    el.querySelector<HTMLButtonElement>('app-scale-bar button')?.focus();
    outside.focus();
    host.geometry.reportTextTop(300);
    advance(10);
    expect(document.activeElement).toBe(outside);
    outside.remove();
    el.remove();
  });

  it('offers stage-specific actions and branches', async () => {
    await render();
    host.zoom.flyTo(1);
    advance(1500);
    const gap = [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('Planeten in die Lücke'));
    gap?.click();
    fixture.detectChanges();
    expect(host.ui.planetsInGap()).toBe(true);
    expect(el.querySelectorAll('app-earth-moon-layer .gap-planet.in')).toHaveLength(7);
    host.zoom.flyTo(3);
    advance(10_000);
    expect([...el.querySelectorAll('app-stage-text a')].some((a) => a.textContent?.includes('Wie leer ist das wirklich?'))).toBe(false);
  });

  it('lines the seven planets up in the Earth–Moon gap', () => {
    const fits = EarthMoonLayer.gapLength;
    expect(fits).toBeGreaterThan(180);
    expect(fits).toBeLessThan(195);
  });

  it('shows the Milky Way only from above, with selectable arms and the black hole', async () => {
    await render({ reducedMotion: true });
    host.zoom.flyTo(4);
    advance(20_000);
    expect([...el.querySelectorAll('button')].some((b) => b.textContent?.includes('Seitenansicht'))).toBe(false);
    const layer = el.querySelector('app-milky-way-layer');
    expect(layer?.querySelector('.edge')).toBeNull();
    const names = [...(layer?.querySelectorAll('button') ?? [])].map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual([
      'Sagittarius A* ansehen',
      'Scutum-Centaurus-Arm ansehen',
      'Sagittarius-Arm ansehen',
      'Orion-Arm ansehen',
      'Perseus-Arm ansehen',
    ]);
    layer?.querySelector<HTMLButtonElement>('button')?.click();
    expect(host.ui.planet()).toBe('sgr-a');
  });

  it('makes every named galaxy of the Local Group selectable, each with its own target', async () => {
    await render({ reducedMotion: true });
    host.zoom.flyTo(5);
    advance(20_000);
    const layer = el.querySelector('app-local-group-layer');
    expect(layer?.hasAttribute('aria-hidden')).toBe(false);
    const buttons = [...(layer?.querySelectorAll('button') ?? [])];
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Milchstrasse ansehen',
      'Andromeda ansehen',
      'Dreiecksgalaxie ansehen',
      'Grosse Magellansche Wolke ansehen',
      'Kleine Magellansche Wolke ansehen',
    ]);
    buttons[3].click();
    expect(host.ui.planet()).toBe('grosse-magellansche-wolke');
    for (const [i, a] of LOCAL_GROUP_MARKS.entries()) {
      for (const b of LOCAL_GROUP_MARKS.slice(i + 1)) {
        expect(Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y), `${a.id} – ${b.id}`).toBeGreaterThanOrEqual(24);
      }
    }
  });

  it('makes every named structure of the universe selectable, each with its own target', async () => {
    await render({ reducedMotion: true });
    host.zoom.flyTo(6);
    advance(20_000);
    const layer = el.querySelector('app-universe-layer');
    const buttons = [...(layer?.querySelectorAll('button') ?? [])];
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(UNIVERSE_MARKS.map((m) => `${m.name} ansehen`));
    expect(buttons).toHaveLength(8);
    buttons[1].click();
    expect(host.ui.planet()).toBe('geschosshaufen');
    for (const [i, a] of UNIVERSE_MARKS.entries()) {
      for (const b of UNIVERSE_MARKS.slice(i + 1)) {
        expect(Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y), `${a.id} – ${b.id}`).toBeGreaterThanOrEqual(24);
      }
      // Clear of the Earth marker, which sits at the origin.
      expect(Math.hypot(a.at.x, a.at.y), a.id).toBeGreaterThanOrEqual(24);
    }
  });

  it('lets the Earth be opened from every stage after the first', async () => {
    await render({ reducedMotion: true });
    const earthButton = () => el.querySelector<HTMLButtonElement>('app-earth-marker button');
    expect(earthButton()).toBeNull();
    expect(el.querySelector('app-earth-moon-layer button[aria-label="Erde ansehen"]')).not.toBeNull();
    // At Erde und Mond, the Earth sphere itself is the target and the marker stays hidden.
    host.zoom.flyTo(1);
    advance(20_000);
    expect(earthButton()).toBeNull();
    el.querySelector<HTMLButtonElement>('app-earth-moon-layer button[aria-label="Erde ansehen"]')?.click();
    expect(host.ui.planet()).toBe('erde');
    // The names open the close-ups too.
    el.querySelector<HTMLElement>('app-earth-moon-layer .moon-lbl')?.click();
    expect(host.ui.planet()).toBe('mond');
    el.querySelector<HTMLElement>('app-earth-moon-layer .earth-lbl')?.click();
    expect(host.ui.planet()).toBe('erde');
    host.ui.planet.set(null);
    // In the solar system, too, the Earth is a sphere whose name can be clicked.
    host.zoom.flyTo(2);
    advance(20_000);
    expect(earthButton()).toBeNull();
    el.querySelector<HTMLElement>('app-solar-system-layer button[aria-label="Erde ansehen"] .lbl')?.click();
    expect(host.ui.planet()).toBe('erde');
    host.ui.planet.set(null);
    for (const stage of [3, 4, 5, 6]) {
      host.zoom.flyTo(stage);
      advance(20_000);
      expect(earthButton()?.getAttribute('aria-label'), `stage ${stage}`).toBe('Erde ansehen');
    }
    earthButton()?.click();
    expect(host.ui.planet()).toBe('erde');
  });

  it('draws the planets as spheres lit from the Sun, each with a clickable name', async () => {
    await render({ reducedMotion: true });
    host.zoom.flyTo(2);
    advance(20_000);
    const layer = el.querySelector('app-solar-system-layer');
    // Eight planets and the Sun.
    expect(layer?.querySelectorAll('app-body-globe')).toHaveLength(9);
    expect(layer?.querySelector('app-body-globe.sun')).not.toBeNull();
    expect(layer?.querySelectorAll('.rings')).toHaveLength(1);
    for (const name of ['Merkur', 'Venus', 'Erde', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptun']) {
      const label = [...(layer?.querySelectorAll<HTMLElement>('button .lbl') ?? [])].find((l) => l.textContent?.trim() === name);
      expect(label, name).toBeDefined();
    }
  });

  it('offers only the vibration setting, and no sound controls', async () => {
    await render();
    const settings = TestBed.inject(JourneySettings);
    expect(el.querySelector('button[aria-label="Ton"]')).toBeNull();
    el.querySelector<HTMLButtonElement>('button[aria-label="Weitere Einstellungen"]')?.click();
    fixture.detectChanges();
    const inputs = el.querySelectorAll<HTMLInputElement>('#journey-settings input');
    expect(inputs).toHaveLength(1);
    inputs[0].dispatchEvent(new Event('change'));
    expect(settings.vibration()).toBe(false);
    expect(el.textContent).not.toContain('Erzählstimme');
  });
});
