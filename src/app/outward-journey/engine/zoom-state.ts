import { DestroyRef, Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { MATCH_MEDIA } from '../../core/layout-mode';
import {
  FLIGHT_PACE,
  FlightPace,
  MAX_Z,
  RETURN_PACE,
  VOID_FROM,
  clampZ,
  flightDuration,
  flightPosition,
  nearestStage,
  snapTarget,
} from './zoom-math';

/** Duration of the still pause through the emptiness when motion is reduced. */
export const REDUCED_VOID_MS = 7000;

export type ZoomPhase = 'atStage' | 'moving' | 'returning';

/** requestAnimationFrame and its cancel, injectable so tests can drive frames. */
export interface FrameScheduler {
  request(callback: (time: number) => void): number;
  cancel(handle: number): void;
  now(): number;
}

export const FRAME_SCHEDULER = new InjectionToken<FrameScheduler>('FRAME_SCHEDULER', {
  providedIn: 'root',
  factory: () => ({
    request: (cb) => requestAnimationFrame(cb),
    cancel: (h) => cancelAnimationFrame(h),
    now: () => performance.now(),
  }),
});

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** A completed settle at a stage; `seq` changes on every settle so effects can react to repeats. */
export interface Settle {
  readonly stage: number;
  readonly seq: number;
}

/**
 * State of the outward journey's zoom. Provided per journey component.
 * The view only ever moves because of a user action: direct manipulation, a release that
 * snaps to a stage, a jump, or the way home the user starts.
 */
@Injectable()
export class ZoomState {
  private readonly frames = inject(FRAME_SCHEDULER);
  private readonly mediaQuery = inject(MATCH_MEDIA)?.(REDUCED_MOTION_QUERY) ?? null;

  private readonly zState = signal(0);
  private readonly resting = signal<number | null>(0);
  private readonly flight = signal<'none' | 'flight' | 'return'>('none');
  private readonly homeOffered = signal(false);
  private readonly reachedUniverse = signal(false);
  private readonly arrivedHome = signal(false);
  private readonly hasMoved = signal(false);
  private readonly settleState = signal<Settle>({ stage: 0, seq: 0 });
  private readonly reducedState = signal(this.mediaQuery?.matches ?? false);

  private frame = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private lastDirection = 0;
  private completedListeners: (() => void)[] = [];

  /** Continuous zoom position, 0 (Erde) to 9 (Universum). */
  readonly z = this.zState.asReadonly();
  /** The stage the view rests at, or null while it moves. */
  readonly restingStage = this.resting.asReadonly();
  /** The Aha comparison shows together with the title and line, as soon as the view rests at a stage. */
  readonly ahaVisible = computed(() => this.resting() !== null);
  /** True once "Und jetzt zurück. Nach Hause." may be offered. */
  readonly homeVisible = this.homeOffered.asReadonly();
  /** True after arriving back at the Earth from the universe. */
  readonly home = this.arrivedHome.asReadonly();
  /** False until the user zooms for the first time (drives the start hint). */
  readonly moved = this.hasMoved.asReadonly();
  readonly settled = this.settleState.asReadonly();
  readonly reducedMotion = this.reducedState.asReadonly();

  readonly phase = computed<ZoomPhase>(() => {
    if (this.flight() === 'return') {
      return 'returning';
    }
    return this.resting() === null ? 'moving' : 'atStage';
  });

  constructor() {
    const onChange = (e: MediaQueryListEvent) => this.reducedState.set(e.matches);
    this.mediaQuery?.addEventListener?.('change', onChange);
    inject(DestroyRef).onDestroy(() => {
      this.stop();
      this.mediaQuery?.removeEventListener?.('change', onChange);
    });
    // The journey begins resting at the Earth, with the usual rhythm of texts.
    this.settle(0);
  }

  /** Registers a callback for the moment the user arrives back home from the universe. */
  onCompleted(listener: () => void): void {
    this.completedListeners.push(listener);
  }

  /** Direct manipulation (wheel, drag, pinch, range): moves the view by `delta` stages. */
  nudge(delta: number): void {
    if (delta === 0) {
      return;
    }
    this.setPosition(this.zState() + delta);
  }

  /** Direct manipulation to an absolute position (scale bar range input). */
  moveTo(z: number): void {
    this.setPosition(z);
  }

  /** The user let go: ease into the nearest stage in the direction of the last movement. */
  release(): void {
    if (this.flight() !== 'none' || this.resting() !== null) {
      return;
    }
    this.flyTo(snapTarget(this.zState(), this.lastDirection));
  }

  /** One stage out (+1) or in (−1) from the current or targeted stage. */
  step(direction: 1 | -1): void {
    const z = this.zState();
    const from = this.resting() ?? (direction > 0 ? Math.floor(z) : Math.ceil(z));
    this.lastDirection = direction;
    this.markMoved();
    this.flyTo(from + direction);
  }

  /** Flies to a stage (scale bar, keyboard, snapping). */
  flyTo(stage: number, pace: FlightPace = FLIGHT_PACE): void {
    this.start(clampZ(Math.round(stage)), pace, 'flight');
  }

  /** "Und jetzt zurück. Nach Hause.": the ~10 s return flight from the universe. */
  goHome(): void {
    this.start(0, RETURN_PACE, 'return');
  }

  /** Starts over at the Earth (end path "Nochmal reisen"). */
  restart(): void {
    this.stop();
    this.reachedUniverse.set(false);
    this.arrivedHome.set(false);
    this.zState.set(0);
    this.settle(0);
  }

  /**
   * Rests at a stage at once, without a flight (coming back from another module); the texts show as
   * after any arrival.
   */
  settleAt(stage: number): void {
    this.stop();
    const target = clampZ(Math.round(stage));
    if (target !== 0) {
      this.markMoved();
    }
    this.zState.set(target);
    this.settle(target);
  }

  /** Cancels any running flight and pending timers. */
  stop(): void {
    this.frames.cancel(this.frame);
    this.frame = 0;
    this.clearTimers();
    if (this.flight() !== 'none') {
      this.flight.set('none');
    }
  }

  private setPosition(z: number): void {
    const next = clampZ(z);
    const previous = this.zState();
    this.stop();
    if (next !== previous) {
      this.lastDirection = Math.sign(next - previous);
    }
    this.markMoved();
    this.zState.set(next);
    this.unsettle();
  }

  private start(target: number, pace: FlightPace, kind: 'flight' | 'return'): void {
    this.stop();
    this.markMoved();
    const from = this.zState();
    if (Math.abs(target - from) < 1e-6) {
      this.zState.set(target);
      this.settle(target);
      return;
    }
    this.unsettle();
    this.flight.set(kind);
    if (this.reducedState()) {
      this.reducedFlight(from, target);
      return;
    }
    const duration = flightDuration(from, target, pace);
    const begin = this.frames.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - begin) / duration);
      this.zState.set(flightPosition(from, target, p, pace));
      if (p < 1) {
        this.frame = this.frames.request(tick);
        return;
      }
      this.frame = 0;
      this.flight.set('none');
      this.settle(target);
    };
    this.frame = this.frames.request(tick);
  }

  /** Reduced motion: no continuous zoom; the emptiness becomes a still, empty pause. */
  private reducedFlight(from: number, target: number): void {
    const crossesVoid = Math.min(from, target) <= VOID_FROM && Math.max(from, target) >= VOID_FROM + 1;
    const arrive = () => {
      this.zState.set(target);
      this.flight.set('none');
      this.settle(target);
    };
    if (!crossesVoid) {
      arrive();
      return;
    }
    this.zState.set(VOID_FROM + 0.5);
    this.timers.push(setTimeout(arrive, REDUCED_VOID_MS));
  }

  private settle(stage: number): void {
    this.clearTimers();
    this.resting.set(stage);
    this.homeOffered.set(false);
    this.settleState.update((s) => ({ stage, seq: s.seq + 1 }));
    if (stage === MAX_Z) {
      // The texts and the way home show right away at the universe, like at every other stage.
      this.reachedUniverse.set(true);
      this.homeOffered.set(true);
    }
    if (stage === 0 && this.reachedUniverse()) {
      this.reachedUniverse.set(false);
      this.arrivedHome.set(true);
      this.completedListeners.forEach((listener) => listener());
    } else if (stage !== 0) {
      this.arrivedHome.set(false);
    }
  }

  private unsettle(): void {
    if (this.resting() !== null) {
      this.resting.set(null);
      this.homeOffered.set(false);
    }
  }

  private markMoved(): void {
    if (!this.hasMoved()) {
      this.hasMoved.set(true);
    }
  }

  private clearTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  /** The stage nearest to the current position (used for texts during short wobbles). */
  nearest(): number {
    return nearestStage(this.zState());
  }
}
