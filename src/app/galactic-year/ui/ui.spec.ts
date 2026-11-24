import { TestBed } from '@angular/core/testing';
import { earthAt } from '../engine/earth';
import { sunAt } from '../engine/orbit';
import { EarthGlobe, capPath } from './earth-globe';
import { directionArrow } from './galaxy-view';

describe('EarthGlobe', () => {
  it('draws polar caps of the given depth', () => {
    expect(capPath(0, true)).toBe('');
    // The inner edge bulges towards the equator: down for the north cap, up for the south cap.
    expect(capPath(8, true)).toMatch(/^M\S+ 10 A48 48 0 0 1 \S+ 10 Q50 12\.8 \S+ 10 Z$/);
    expect(capPath(8, false)).toMatch(/^M\S+ 90 A48 48 0 0 0 \S+ 90 Q50 87\.2 \S+ 90 Z$/);
    expect(capPath(42, true)).toContain('Q50 52 ');
    expect(capPath(60, true)).toContain(' 0 1 1 ');
  });

  it('shows one continent and a text alternative one round back, and almost all ice three rounds back', async () => {
    const fixture = TestBed.createComponent(EarthGlobe);
    fixture.componentRef.setInput('state', earthAt(1));
    fixture.componentRef.setInput('label', 'Die Erde vor 230 Millionen Jahren: Pangäa');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('Die Erde vor 230 Millionen Jahren: Pangäa');
    expect(el.querySelector('path.land')?.getAttribute('d')?.match(/M/g)).toHaveLength(1);
    expect(el.querySelectorAll('path.ice')).toHaveLength(0);
    fixture.componentRef.setInput('state', earthAt(3));
    await fixture.whenStable();
    expect(el.querySelectorAll('path.ice')).toHaveLength(2);
    expect(earthAt(3).iceNorth + earthAt(3).iceSouth).toBeGreaterThan(80);
    // Between two stations with different land, both drawings are shown, each half faded.
    fixture.componentRef.setInput('state', earthAt(1.5));
    await fixture.whenStable();
    expect([...el.querySelectorAll('path.land')].map((p) => p.getAttribute('fill-opacity'))).toHaveLength(2);
    fixture.componentRef.setInput('state', { ...earthAt(0), land: [] });
    await fixture.whenStable();
    expect(el.querySelector('path.land')).toBeNull();
  });
});


describe('GalaxyView geometry', () => {
  it('points the arrow ahead of the Sun, in the direction of its motion', () => {
    const { arc, head } = directionArrow();
    const today = sunAt(0);
    expect(arc.startsWith('M ')).toBe(true);
    const tip = head.split(' ')[1].split(',').map(Number);
    // Clockwise in this view: from the bottom, the Sun moves to the left.
    expect(tip[0]).toBeLessThan(today.x);
  });
});

