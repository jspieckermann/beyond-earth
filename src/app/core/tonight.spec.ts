import { TestBed } from '@angular/core/testing';
import { CLOCK } from './clock';
import { BROWSER_STORAGE } from './local-store';
import { StoredPlace } from './models';
import { DARKNESS_KEY, OLD_MISSIONS_KEY, PLACE_KEY, TonightService } from './tonight';

const HAMBURG: StoredPlace = { name: 'Hamburg', region: 'Hamburg', lat: 53.55, lon: 9.99, tz: 'Europe/Berlin', source: 'list' };

function blockedStorage(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

describe('TonightService', () => {
  beforeEach(() => localStorage.clear());

  it('knows no place by default', () => {
    const tonight = TestBed.inject(TonightService);
    expect(tonight.place()).toBeNull();
    expect(tonight.info()).toBeNull();
  });

  it('stores place and darkness on the device', () => {
    const tonight = TestBed.inject(TonightService);
    tonight.choosePlace(HAMBURG);
    tonight.setDarkness(4);
    expect(JSON.parse(localStorage.getItem(PLACE_KEY) ?? 'null')).toEqual(HAMBURG);
    expect(localStorage.getItem(DARKNESS_KEY)).toBe('4');

    TestBed.resetTestingModule();
    const later = TestBed.inject(TonightService);
    expect(later.place()).toEqual(HAMBURG);
    expect(later.darkness()).toBe(4);
    expect(later.info()).toEqual({ location: 'Hamburg', darkness: 4, headline: '…' });
  });

  it('forgets place and darkness, and the mission list of the first version', () => {
    localStorage.setItem(OLD_MISSIONS_KEY, '["kassiopeia"]');
    const tonight = TestBed.inject(TonightService);
    tonight.choosePlace(HAMBURG);
    tonight.setDarkness(3);
    tonight.forget();
    expect(tonight.place()).toBeNull();
    expect(tonight.darkness()).toBeNull();
    expect(localStorage.getItem(PLACE_KEY)).toBeNull();
    expect(localStorage.getItem(DARKNESS_KEY)).toBeNull();
    expect(localStorage.getItem(OLD_MISSIONS_KEY)).toBeNull();
  });

  it('ignores unreadable or invalid stored values', () => {
    localStorage.setItem(PLACE_KEY, '{"name":"X","lat":"nope"}');
    localStorage.setItem(DARKNESS_KEY, '9');
    const tonight = TestBed.inject(TonightService);
    expect(tonight.place()).toBeNull();
    expect(tonight.darkness()).toBeNull();
  });

  it('works for the current visit when storage is blocked', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: blockedStorage() }] });
    const tonight = TestBed.inject(TonightService);
    expect(tonight.place()).toBeNull();
    tonight.choosePlace(HAMBURG);
    tonight.setDarkness(5);
    expect(tonight.info()?.location).toBe('Hamburg');
  });

  it('calculates the card summary on request', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CLOCK, useValue: () => new Date('2026-12-09T18:00:00Z') }] });
    const tonight = TestBed.inject(TonightService);
    await tonight.refresh();
    expect(tonight.info()).toBeNull();
    tonight.choosePlace(HAMBURG);
    tonight.setDarkness(4);
    await tonight.refresh();
    const info = tonight.info();
    expect(info?.headline).toMatch(/zum Beispiel die Milchstrasse\.$/);
    expect(info?.moon).toBe('Der Mond ist neu. Er stört heute nicht.');
    expect(info?.darkFrom).toMatch(/^Dunkel ab /);
    expect(info?.milkyWayNext).toBeUndefined();
    tonight.setDarkness(2);
    expect(tonight.info()?.headline).toBe('…');
  });
});
