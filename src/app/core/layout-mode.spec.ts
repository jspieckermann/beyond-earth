import { TestBed } from '@angular/core/testing';
import { DESKTOP_QUERY, LayoutMode, MATCH_MEDIA, TABLET_QUERY } from './layout-mode';

/** A tiny matchMedia stand-in driven by a viewport description. */
function fakeViewport(width: number, height: number) {
  const lists = new Map<string, { matches: boolean; listeners: (() => void)[] }>();
  const evaluate = (query: string) => {
    const landscape = viewport.width > viewport.height;
    if (query === DESKTOP_QUERY) return viewport.width >= 1100 || (viewport.width >= 768 && landscape);
    if (query === TABLET_QUERY) return viewport.width >= 768;
    return false;
  };
  const viewport = { width, height };
  const matchMedia = (query: string) => {
    const entry = { matches: evaluate(query), listeners: [] as (() => void)[] };
    lists.set(query, entry);
    return {
      get matches() {
        return entry.matches;
      },
      addEventListener: (_: string, fn: () => void) => entry.listeners.push(fn),
    } as unknown as MediaQueryList;
  };
  const resize = (w: number, h: number) => {
    viewport.width = w;
    viewport.height = h;
    for (const [query, entry] of lists) {
      entry.matches = evaluate(query);
      entry.listeners.forEach((fn) => fn());
    }
  };
  return { matchMedia, resize };
}

function layoutFor(width: number, height: number) {
  const viewport = fakeViewport(width, height);
  TestBed.configureTestingModule({ providers: [{ provide: MATCH_MEDIA, useValue: viewport.matchMedia }] });
  return { mode: TestBed.inject(LayoutMode), viewport };
}

describe('LayoutMode', () => {
  it('uses the phone layout below 768 px', () => {
    expect(layoutFor(390, 844).mode.layout()).toBe('phone');
  });

  it('uses the tablet layout for upright tablets', () => {
    expect(layoutFor(834, 1194).mode.layout()).toBe('tablet');
  });

  it('uses the desktop layout for wide screens', () => {
    expect(layoutFor(1440, 900).mode.layout()).toBe('desktop');
  });

  it('uses the desktop layout for tablets held sideways', () => {
    expect(layoutFor(1024, 768).mode.layout()).toBe('desktop');
  });

  it('follows live changes such as rotating a tablet', () => {
    const { mode, viewport } = layoutFor(834, 1194);
    viewport.resize(1194, 834);
    expect(mode.layout()).toBe('desktop');
    viewport.resize(390, 844);
    expect(mode.layout()).toBe('phone');
  });

  it('falls back to the phone layout without matchMedia', () => {
    TestBed.configureTestingModule({ providers: [{ provide: MATCH_MEDIA, useValue: null }] });
    expect(TestBed.inject(LayoutMode).layout()).toBe('phone');
  });

  it('provides a matchMedia function or null by default', () => {
    const value = TestBed.inject(MATCH_MEDIA);
    expect(value === null || typeof value === 'function').toBe(true);
  });
});
