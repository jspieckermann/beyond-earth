import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './local-store';
import { NIGHT_MODE_KEY, NightMode, THEME_COLOR } from './night-mode';

function blockedStorage(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

describe('NightMode', () => {
  let meta: HTMLMetaElement;

  beforeEach(() => {
    localStorage.clear();
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = THEME_COLOR.day;
    document.head.append(meta);
  });

  afterEach(() => {
    meta.remove();
    document.documentElement.classList.remove('night');
  });

  it('is off by default', () => {
    const night = TestBed.inject(NightMode);
    TestBed.tick();
    expect(night.on()).toBe(false);
    expect(document.documentElement.classList.contains('night')).toBe(false);
  });

  it('switches the whole app and the theme colour', () => {
    const night = TestBed.inject(NightMode);
    night.toggle();
    TestBed.tick();
    expect(night.on()).toBe(true);
    expect(TestBed.inject(DOCUMENT).documentElement.classList.contains('night')).toBe(true);
    expect(meta.content).toBe(THEME_COLOR.night);
    night.set(false);
    TestBed.tick();
    expect(document.documentElement.classList.contains('night')).toBe(false);
    expect(meta.content).toBe(THEME_COLOR.day);
  });

  it('stays on across visits', () => {
    TestBed.inject(NightMode).set(true);
    expect(localStorage.getItem(NIGHT_MODE_KEY)).toBe('on');
    TestBed.resetTestingModule();
    const later = TestBed.inject(NightMode);
    TestBed.tick();
    expect(later.on()).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(true);
  });

  it('works for the current visit without storage', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: blockedStorage() }] });
    const night = TestBed.inject(NightMode);
    night.set(true);
    TestBed.tick();
    expect(night.on()).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(true);
  });
});

/** WCAG relative luminance of a hex colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Alpha-blends `rgb` over the background, both as hex. */
function over(rgb: [number, number, number, number], background: string): string {
  const bg = [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16));
  return `#${rgb
    .slice(0, 3)
    .map((c, i) => Math.round(c * rgb[3] + bg[i] * (1 - rgb[3])).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** The night palette of styles.css (keep both in step). */
const NIGHT = {
  background: ['#000000', '#050000', '#120200'],
  surface: over([26, 2, 0, 0.85], '#000000'),
  text: { ink: '#ff6a55', bright: '#ff8a70', soft: '#ec5a45', muted: '#d24c3a', starlight: '#ff7a5c', explored: '#ff9a80' },
  outlines: { dim: '#b8402f', pip: '#b8402f', starlight: '#ff7a5c', lineStrong: over([255, 106, 85, 0.7], '#000000') },
};

describe('the night palette', () => {
  it('keeps text at 4.5:1 on every background', () => {
    for (const bg of [...NIGHT.background, NIGHT.surface]) {
      for (const [name, colour] of Object.entries(NIGHT.text)) {
        expect(contrast(colour, bg), `${name} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps outlines and focus indicators at 3:1', () => {
    for (const bg of [...NIGHT.background, NIGHT.surface]) {
      for (const [name, colour] of Object.entries(NIGHT.outlines)) {
        expect(contrast(colour, bg), `${name} on ${bg}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('uses no white and no blue: red is always the strongest channel', () => {
    const all = [...NIGHT.background, NIGHT.surface, ...Object.values(NIGHT.text), ...Object.values(NIGHT.outlines)];
    for (const hex of all) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      expect(r >= g && r >= b, hex).toBe(true);
    }
  });
});
