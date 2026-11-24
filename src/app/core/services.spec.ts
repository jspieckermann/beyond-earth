import { TestBed } from '@angular/core/testing';
import { ExplorationProgress } from './exploration-progress';
import { BROWSER_STORAGE } from './local-store';
import { isModuleId } from './models';
import { SavedMoments } from './saved-moments';
import { TonightService } from './tonight';

function blockedStorage(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

describe('isModuleId', () => {
  it('accepts the six module letters only', () => {
    expect(['A', 'B', 'C', 'D', 'E', 'F'].every(isModuleId)).toBe(true);
    expect(isModuleId('G')).toBe(false);
    expect(isModuleId(1)).toBe(false);
  });
});

describe('ExplorationProgress', () => {
  beforeEach(() => localStorage.clear());

  it('starts with nothing explored', () => {
    const progress = TestBed.inject(ExplorationProgress);
    expect(progress.exploredIds().size).toBe(0);
    expect(progress.isExplored('B')).toBe(false);
  });

  it('persists explored modules across visits', () => {
    TestBed.inject(ExplorationProgress).markExplored('B');
    expect(JSON.parse(localStorage.getItem('be.explored.v3') ?? '[]')).toEqual(['B']);

    TestBed.resetTestingModule();
    const nextVisit = TestBed.inject(ExplorationProgress);
    expect(nextVisit.isExplored('B')).toBe(true);
    expect(nextVisit.isExplored('A')).toBe(false);
  });

  it('ignores unknown or malformed stored values', () => {
    localStorage.setItem('be.explored.v3', '["B","X",3]');
    expect([...TestBed.inject(ExplorationProgress).exploredIds()]).toEqual(['B']);
    TestBed.resetTestingModule();
    localStorage.setItem('be.explored.v3', '{"B":true}');
    expect(TestBed.inject(ExplorationProgress).exploredIds().size).toBe(0);
  });

  it('moves "Das galaktische Jahr" to C, "Licht als Zeitmaschine" to D and "Sterne zählen" to E', () => {
    // Previous letters: C Zeitmaschine, D Sterne zählen, E galaktisches Jahr.
    localStorage.setItem('be.explored.v2', '["A","C","E"]');
    const progress = TestBed.inject(ExplorationProgress);
    expect([...progress.exploredIds()].sort()).toEqual(['A', 'C', 'D']);
    expect(progress.isExplored('C')).toBe(true);
    expect(progress.isExplored('E')).toBe(false);
    expect(localStorage.getItem('be.explored.v2')).toBeNull();
    expect(JSON.parse(localStorage.getItem('be.explored.v3') ?? '[]').sort()).toEqual(['A', 'C', 'D']);
  });

  it('carries the first-version letters straight over to the current ones', () => {
    // First letters: D Zeitmaschine, E Sterne zählen, F galaktisches Jahr.
    localStorage.setItem('be.explored', '["F","D"]');
    const progress = TestBed.inject(ExplorationProgress);
    expect([...progress.exploredIds()].sort()).toEqual(['C', 'D']);
  });

  it('carries every old letter over to the new one and drops the Sandkorn-Welt', () => {
    // Old letters: A Reise, B Sandkorn-Welt, C Lichtgeschwindigkeit, D Zeitmaschine, E Sterne zählen, F galaktisches Jahr, G Unsichtbares.
    localStorage.setItem('be.explored', '["A","B","C","D","E","F","G"]');
    const progress = TestBed.inject(ExplorationProgress);
    expect([...progress.exploredIds()].sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(localStorage.getItem('be.explored')).toBeNull();
    expect(JSON.parse(localStorage.getItem('be.explored.v3') ?? '[]').sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('maps the light-speed module from old C to new B and forgets the old B', () => {
    localStorage.setItem('be.explored', '["A","C","B"]');
    const progress = TestBed.inject(ExplorationProgress);
    expect([...progress.exploredIds()].sort()).toEqual(['A', 'B']);
    expect(progress.isExplored('C')).toBe(false);
  });

  it('migrates only once', () => {
    localStorage.setItem('be.explored', '["G"]');
    expect([...TestBed.inject(ExplorationProgress).exploredIds()]).toEqual(['F']);
    TestBed.resetTestingModule();
    // An old key that appears again later (another tab of an old version) does not override the migrated state.
    localStorage.setItem('be.explored', '["C"]');
    expect([...TestBed.inject(ExplorationProgress).exploredIds()]).toEqual(['F']);
  });

  it('shows nothing explored when storage is unavailable', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: blockedStorage() }] });
    const progress = TestBed.inject(ExplorationProgress);
    expect(progress.exploredIds().size).toBe(0);
    progress.markExplored('A');
    expect(progress.isExplored('A')).toBe(true);
  });
});

describe('SavedMoments', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to zero', () => {
    expect(TestBed.inject(SavedMoments).count()).toBe(0);
  });

  it('persists the count across visits', () => {
    TestBed.inject(SavedMoments).setCount(2);
    TestBed.resetTestingModule();
    expect(TestBed.inject(SavedMoments).count()).toBe(2);
  });

  it('rejects invalid counts', () => {
    localStorage.setItem('be.moments', '-1');
    const moments = TestBed.inject(SavedMoments);
    expect(moments.count()).toBe(0);
    moments.setCount(1.5);
    expect(moments.count()).toBe(0);
  });

  it('defaults to zero when storage is unavailable', () => {
    TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: blockedStorage() }] });
    expect(TestBed.inject(SavedMoments).count()).toBe(0);
  });
});

describe('TonightService', () => {
  it('knows no place by default', () => {
    expect(TestBed.inject(TonightService).info()).toBeNull();
  });

  it('exposes updated info', () => {
    const tonight = TestBed.inject(TonightService);
    tonight.update({ location: 'Hamburg', visibleFrom: '19:40', darkness: 2, moon: 'Kein Mond', mission: 'M' });
    expect(tonight.info()?.location).toBe('Hamburg');
  });
});
