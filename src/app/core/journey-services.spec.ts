import { TestBed } from '@angular/core/testing';
import { BirthYear } from './birth-year';
import { CLOCK } from './clock';
import { JourneySettings } from './journey-settings';
import { BROWSER_STORAGE } from './local-store';

function blockedStorage(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

describe('JourneySettings', () => {
  beforeEach(() => localStorage.clear());

  it('has vibration on by default', () => {
    expect(TestBed.inject(JourneySettings).vibration()).toBe(true);
  });

  it('persists the choice across visits', () => {
    TestBed.inject(JourneySettings).toggle('vibration');
    TestBed.resetTestingModule();
    expect(TestBed.inject(JourneySettings).vibration()).toBe(false);
  });

  it('ignores malformed stored values', () => {
    localStorage.setItem('be.journey', '{"vibration":"yes"}');
    expect(TestBed.inject(JourneySettings).vibration()).toBe(true);
  });

  it('keeps the vibration choice of earlier versions that also stored sound and voice', () => {
    localStorage.setItem('be.journey', '{"sound":true,"voice":false,"vibration":false}');
    expect(TestBed.inject(JourneySettings).vibration()).toBe(false);
  });

  it('works for the visit when storage is unavailable', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: blockedStorage() }] });
    const settings = TestBed.inject(JourneySettings);
    settings.set('vibration', false);
    expect(settings.vibration()).toBe(false);
  });
});

describe('BirthYear', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: CLOCK, useValue: () => new Date(2026, 10, 20) }] });
  });

  it('is empty by default and remembers a valid year', () => {
    const birthYear = TestBed.inject(BirthYear);
    expect(birthYear.year()).toBeNull();
    birthYear.set(1996);
    expect(birthYear.year()).toBe(1996);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: CLOCK, useValue: () => new Date(2026, 10, 20) }] });
    expect(TestBed.inject(BirthYear).year()).toBe(1996);
  });

  it('rejects years outside 1900 to now', () => {
    const birthYear = TestBed.inject(BirthYear);
    birthYear.set(3000);
    birthYear.set(1899);
    expect(birthYear.year()).toBeNull();
    expect(birthYear.isValid(2026)).toBe(true);
    expect(birthYear.isValid('1996')).toBe(false);
  });

  it('can be removed', () => {
    const birthYear = TestBed.inject(BirthYear);
    birthYear.set(1990);
    birthYear.clear();
    expect(birthYear.year()).toBeNull();
    expect(localStorage.getItem('be.birthYear')).toBe('null');
  });

  it('ignores an invalid stored year', () => {
    localStorage.setItem('be.birthYear', '2999');
    expect(TestBed.inject(BirthYear).year()).toBeNull();
  });
});
