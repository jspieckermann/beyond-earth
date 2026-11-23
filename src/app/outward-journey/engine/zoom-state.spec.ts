import { TestBed } from '@angular/core/testing';
import { MATCH_MEDIA } from '../../core/layout-mode';
import { FRAME_SCHEDULER, FrameScheduler, REDUCED_VOID_MS, ZoomState } from './zoom-state';

/** Frames driven by Vitest's fake timers. */
export const fakeFrames: FrameScheduler = {
  request: (cb) => setTimeout(() => cb(Date.now()), 16) as unknown as number,
  cancel: (h) => clearTimeout(h),
  now: () => Date.now(),
};

function setup(reduced = false) {
  TestBed.configureTestingModule({
    providers: [
      ZoomState,
      { provide: FRAME_SCHEDULER, useValue: fakeFrames },
      {
        provide: MATCH_MEDIA,
        useValue: () => ({ matches: reduced, addEventListener: () => undefined, removeEventListener: () => undefined }),
      },
    ],
  });
  return TestBed.inject(ZoomState);
}

describe('ZoomState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts resting at the Earth', () => {
    const zoom = setup();
    expect(zoom.z()).toBe(0);
    expect(zoom.restingStage()).toBe(0);
    expect(zoom.phase()).toBe('atStage');
    expect(zoom.moved()).toBe(false);
  });

  it('moves with direct manipulation and snaps on release', () => {
    const zoom = setup();
    zoom.nudge(0.3);
    expect(zoom.phase()).toBe('moving');
    expect(zoom.restingStage()).toBeNull();
    expect(zoom.moved()).toBe(true);
    zoom.release();
    vi.advanceTimersByTime(1000);
    expect(zoom.z()).toBe(1);
    expect(zoom.restingStage()).toBe(1);
  });

  it('continues in the direction of movement once clearly past a stage', () => {
    const zoom = setup();
    zoom.flyTo(4);
    vi.advanceTimersByTime(20_000);
    zoom.nudge(-0.15);
    zoom.release();
    vi.advanceTimersByTime(2000);
    expect(zoom.restingStage()).toBe(3);
  });

  it('never moves by itself', () => {
    const zoom = setup();
    zoom.flyTo(1);
    vi.advanceTimersByTime(1000);
    const z = zoom.z();
    vi.advanceTimersByTime(60_000);
    expect(zoom.z()).toBe(z);
    expect(zoom.restingStage()).toBe(1);
  });

  it('ignores a release without movement', () => {
    const zoom = setup();
    expect(zoom.ahaVisible()).toBe(true);
    zoom.release();
    expect(zoom.ahaVisible()).toBe(true);
  });

  it('shows the Aha at once at each stage and hides it while moving', () => {
    const zoom = setup();
    expect(zoom.ahaVisible()).toBe(true);
    zoom.nudge(0.3);
    expect(zoom.ahaVisible()).toBe(false);
  });

  it('steps one stage out or in', () => {
    const zoom = setup();
    zoom.step(1);
    vi.advanceTimersByTime(1000);
    expect(zoom.restingStage()).toBe(1);
    zoom.step(-1);
    vi.advanceTimersByTime(1000);
    expect(zoom.restingStage()).toBe(0);
    zoom.step(-1);
    vi.advanceTimersByTime(1000);
    expect(zoom.restingStage()).toBe(0);
  });

  it('takes at least 6 seconds through the emptiness', () => {
    const zoom = setup();
    zoom.flyTo(2);
    vi.advanceTimersByTime(5000);
    expect(zoom.restingStage()).toBe(2);
    zoom.step(1);
    vi.advanceTimersByTime(6000);
    expect(zoom.restingStage()).toBeNull();
    expect(zoom.z()).toBeGreaterThan(2);
    expect(zoom.z()).toBeLessThan(3);
    vi.advanceTimersByTime(1100);
    expect(zoom.restingStage()).toBe(3);
  });

  it('cancels a flight on new input', () => {
    const zoom = setup();
    zoom.flyTo(5);
    vi.advanceTimersByTime(300);
    const z = zoom.z();
    zoom.nudge(0.01);
    vi.advanceTimersByTime(2000);
    expect(zoom.z()).toBeCloseTo(z + 0.01);
    expect(zoom.restingStage()).toBeNull();
  });

  it('offers the way home as soon as it arrives at the universe', () => {
    const zoom = setup();
    zoom.flyTo(6);
    // 5 stages at 900 ms plus 7 s through the emptiness.
    vi.advanceTimersByTime(5 * 900 + 7000 + 100);
    expect(zoom.restingStage()).toBe(6);
    expect(zoom.phase()).toBe('atStage');
    expect(zoom.homeVisible()).toBe(true);
  });

  it('flies home in about 10 seconds and completes the module', () => {
    const zoom = setup();
    const completed = vi.fn();
    zoom.onCompleted(completed);
    zoom.flyTo(6);
    vi.advanceTimersByTime(30_000);
    zoom.goHome();
    expect(zoom.phase()).toBe('returning');
    vi.advanceTimersByTime(9_000);
    expect(zoom.restingStage()).toBeNull();
    vi.advanceTimersByTime(1_100);
    expect(zoom.restingStage()).toBe(0);
    expect(zoom.home()).toBe(true);
    expect(completed).toHaveBeenCalledTimes(1);
  });

  it('completes only after having reached the universe', () => {
    const zoom = setup();
    const completed = vi.fn();
    zoom.onCompleted(completed);
    zoom.flyTo(5);
    vi.advanceTimersByTime(30_000);
    zoom.flyTo(0);
    vi.advanceTimersByTime(30_000);
    expect(completed).not.toHaveBeenCalled();
    expect(zoom.home()).toBe(false);
  });

  it('starts over at the Earth', () => {
    const zoom = setup();
    zoom.flyTo(6);
    vi.advanceTimersByTime(30_000);
    zoom.goHome();
    vi.advanceTimersByTime(11_000);
    zoom.restart();
    expect(zoom.home()).toBe(false);
    expect(zoom.restingStage()).toBe(0);
  });

  it('moves to an absolute position', () => {
    const zoom = setup();
    zoom.moveTo(4.4);
    expect(zoom.z()).toBe(4.4);
    zoom.moveTo(12);
    expect(zoom.z()).toBe(6);
  });

  it('counts every settle', () => {
    const zoom = setup();
    const first = zoom.settled().seq;
    zoom.flyTo(1);
    vi.advanceTimersByTime(1000);
    expect(zoom.settled()).toEqual({ stage: 1, seq: first + 1 });
    expect(zoom.nearest()).toBe(1);
  });

  describe('with reduced motion', () => {
    it('jumps without a continuous zoom', () => {
      const zoom = setup(true);
      expect(zoom.reducedMotion()).toBe(true);
      zoom.flyTo(1);
      expect(zoom.z()).toBe(1);
      expect(zoom.restingStage()).toBe(1);
    });

    it('keeps the emptiness as a still pause', () => {
      const zoom = setup(true);
      zoom.flyTo(6);
      expect(zoom.z()).toBe(2.5);
      expect(zoom.restingStage()).toBeNull();
      vi.advanceTimersByTime(REDUCED_VOID_MS);
      expect(zoom.restingStage()).toBe(6);
    });
  });
});
