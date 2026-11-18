import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE, LocalStore } from './local-store';
import { CLOCK } from './clock';

const isNumber = (value: unknown): value is number => typeof value === 'number';

function createStore(storage: Storage | null): LocalStore {
  TestBed.configureTestingModule({
    providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
  });
  return TestBed.inject(LocalStore);
}

function throwingStorage(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

describe('LocalStore', () => {
  beforeEach(() => localStorage.clear());

  it('reads and writes through localStorage', () => {
    const store = createStore(localStorage);
    store.write('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    expect(store.read('k')).toBe('v');
  });

  it('reads values that were stored in an earlier visit', () => {
    localStorage.setItem('earlier', 'yes');
    expect(createStore(localStorage).read('earlier')).toBe('yes');
  });

  it('round-trips JSON and validates it', () => {
    const store = createStore(localStorage);
    store.writeJson('n', 3);
    expect(store.readJson('n', isNumber, 0)).toBe(3);
  });

  it('falls back when JSON is missing, invalid or of the wrong shape', () => {
    const store = createStore(localStorage);
    expect(store.readJson('missing', isNumber, 7)).toBe(7);
    localStorage.setItem('broken', '{not json');
    expect(store.readJson('broken', isNumber, 7)).toBe(7);
    localStorage.setItem('wrong', '"text"');
    expect(store.readJson('wrong', isNumber, 7)).toBe(7);
  });

  it('keeps working in memory when localStorage throws', () => {
    const store = createStore(throwingStorage());
    expect(store.read('k')).toBeNull();
    expect(() => store.write('k', 'v')).not.toThrow();
    expect(store.read('k')).toBe('v');
  });

  it('keeps working in memory when there is no storage at all', () => {
    const store = createStore(null);
    expect(store.read('k')).toBeNull();
    store.write('k', 'v');
    expect(store.read('k')).toBe('v');
  });

  it('provides the browser localStorage by default', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(BROWSER_STORAGE)).toBe(globalThis.localStorage);
  });
});

describe('CLOCK', () => {
  it('returns the current time by default', () => {
    const before = Date.now();
    const now = TestBed.inject(CLOCK)().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
