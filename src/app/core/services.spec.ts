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
  it('accepts the seven module letters only', () => {
    expect(['A', 'B', 'C', 'D', 'E', 'F', 'G'].every(isModuleId)).toBe(true);
    expect(isModuleId('H')).toBe(false);
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
    expect(JSON.parse(localStorage.getItem('be.explored') ?? '[]')).toEqual(['B']);

    TestBed.resetTestingModule();
    const nextVisit = TestBed.inject(ExplorationProgress);
    expect(nextVisit.isExplored('B')).toBe(true);
    expect(nextVisit.isExplored('A')).toBe(false);
  });

  it('ignores unknown or malformed stored values', () => {
    localStorage.setItem('be.explored', '["B","X",3]');
    expect([...TestBed.inject(ExplorationProgress).exploredIds()]).toEqual(['B']);
    TestBed.resetTestingModule();
    localStorage.setItem('be.explored', '{"B":true}');
    expect(TestBed.inject(ExplorationProgress).exploredIds().size).toBe(0);
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
