import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExplorationProgress } from '../core/exploration-progress';
import { FactSheet } from '../core/fact-sheet';
import { Haptics } from '../core/haptics';
import { LayoutMode, MATCH_MEDIA } from '../core/layout-mode';
import { FRAME_SCHEDULER, REDUCED_MOTION_QUERY } from '../outward-journey/engine/zoom-state';
import { SECTIONS, SECTION_TITLES, Section, factsFor } from './data/scenes';
import { isFullRound, stationsFor } from './data/stations';
import { earthAt } from './engine/earth';
import { formatCompleted, formatRoundsBack, formatTimeBack } from './engine/galactic';
import { SLIDER_STEPS, nearestStation, roundsAtSlider, ruler, sliderFraction, sliderValue } from './engine/orbit';
import { EarthGlobe } from './ui/earth-globe';
import { GalaxyView } from './ui/galaxy-view';

export type GalacticYearVariant = 'freies-erkunden' | 'hauptreise';

/** How long the Sun glides to a station. */
export const GLIDE_MS = 450;

/**
 * Modul C "Das galaktische Jahr" on one page: one round of the Solar System around the galactic centre,
 * and turning the Sun back round by round with the Earth of the past.
 * Embeddable like Modul A and B: the module page uses the free-exploration variant; the guided journey can
 * embed `hauptreise` and listen to `completed`.
 */
@Component({
  selector: 'app-galactic-year',
  imports: [RouterLink, GalaxyView, EarthGlobe, FactSheet],
  host: { '[attr.data-layout]': 'layout()' },
  templateUrl: './galactic-year.html',
  styleUrl: './galactic-year.css',
})
export class GalacticYear {
  readonly variant = input<GalacticYearVariant>('freies-erkunden');
  /** Main-journey variant: "Weiter: Rausgehen" at the end of the page. */
  readonly completed = output<void>();

  private readonly frames = inject(FRAME_SCHEDULER);
  private readonly haptics = inject(Haptics);
  private readonly progress = inject(ExplorationProgress);
  protected readonly layout = inject(LayoutMode).layout;
  private readonly reducedMotion = !!inject(MATCH_MEDIA)?.(REDUCED_MOTION_QUERY).matches;
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly factButtons = viewChildren<ElementRef<HTMLElement>>('factsButton');

  protected readonly titles = SECTION_TITLES;
  protected readonly explore = computed(() => this.variant() === 'freies-erkunden');
  protected readonly stations = computed(() => stationsFor(!this.explore()));
  private readonly stationRounds = computed(() => this.stations().map((s) => s.rounds));
  protected readonly sliderSteps = SLIDER_STEPS;
  /** The slider ends at the oldest station: 20 rounds, or 3 in the main journey. Its first 5 rounds are stretched. */
  private readonly maxRounds = computed(() => this.stations()[this.stations().length - 1].rounds);
  /** The ruler under the slider: ticks per quarter round and per round, and labelled rounds. */
  protected readonly ruler = computed(() => ruler(this.maxRounds()));
  /** The stations as dots at their true place on the ruler; main stations larger, the current one highlighted. */
  protected readonly dots = computed(() => {
    const max = this.maxRounds();
    const marked = this.snapTarget();
    return this.stations().map((s, i) => ({ id: s.id, main: s.kind === 'haupt', now: i === marked, left: `${Number((sliderFraction(s.rounds, max) * 100).toFixed(4))}%` }));
  });
  /**
   * The highlighted station: while the user moves the slider or the Sun, the one it will snap to when let go;
   * otherwise the one it rests at or glides to.
   */
  protected readonly snapTarget = computed(() => (this.following() ? nearestStation(this.rounds(), this.stationRounds()) : this.settled()));

  // Zurückdrehen
  /** Rounds turned back; follows the slider and dragging at once. */
  protected readonly rounds = signal(0);
  /** The user is moving the slider or dragging the Sun and has not let go yet. */
  private readonly following = signal(false);
  /** The station the Sun last settled at (or is gliding to). */
  protected readonly settled = signal(0);
  protected readonly station = computed(() => this.stations()[this.settled()]);
  protected readonly atStation = computed(() => Math.abs(this.rounds() - this.station().rounds) < 1e-6);
  protected readonly position = computed(() => sliderValue(this.rounds(), this.maxRounds()));
  protected readonly time = computed(() => (this.atStation() ? this.station().time : formatTimeBack(this.rounds())));
  protected readonly timeLong = computed(() => (this.atStation() ? this.station().timeLong : formatTimeBack(this.rounds(), true)));
  protected readonly roundsText = computed(() => {
    const text = this.atStation() ? this.station().roundsText : formatRoundsBack(this.rounds());
    return this.rounds() < 0.002 ? text : `${text} zurück`;
  });
  /** What the rings count: the rounds the Sun had completed at that time. */
  protected readonly completedText = computed(() => formatCompleted(this.rounds()));
  /** The Earth at the Sun's current place, blended between the neighbouring stations while the Sun moves. */
  protected readonly earth = computed(() => earthAt(this.rounds()));
  protected readonly globeLabel = computed(() => {
    const s = this.station();
    if (!this.atStation()) {
      return `Die Erde ${this.timeLong()}`;
    }
    return s.rounds === 0 ? 'Die Erde heute' : `Die Erde ${s.timeLong}: ${s.caption}`;
  });
  /**
   * The station closest to the Sun's place: its title, sentence and caption are always shown and change as the Sun
   * passes the stations, so no text disappears while the slider moves. Only the announcement waits for the Sun to settle.
   */
  protected readonly shown = computed(() => this.stations()[nearestStation(this.rounds(), this.stationRounds())]);
  protected readonly pictureAlt = computed(() =>
    this.rounds() < 0.002
      ? 'Die Milchstrasse von oben mit der Bahn der Sonne als Kreis um das Zentrum. Ein Pfeil an der Markierung der Erde zeigt, in welche Richtung die Sonne zieht.'
      : `Die Milchstrasse von oben mit der Bahn der Sonne. Die Sonne steht ${this.timeLong()} auf ihrer Bahn.`,
  );
  protected readonly sunLabel = computed(() => (this.rounds() > 0.002 ? `Sonne, ${this.time()}` : 'Erde'));

  protected readonly announcement = signal('');
  /** Which part's facts are open. */
  protected readonly factsOpen = signal<Section | null>(null);
  protected readonly facts = computed(() => {
    const section = this.factsOpen();
    return section ? factsFor(section, this.explore()) : null;
  });

  private glide: number | null = null;

  constructor() {
    afterNextRender(() => this.heading().nativeElement.focus());

    inject(DestroyRef).onDestroy(() => this.stopGlide());
  }

  /** The slider moves: the time and the Sun follow at once, nothing is announced. */
  protected slide(value: string): void {
    this.stopGlide();
    this.turnTo(roundsAtSlider(Number(value), this.maxRounds()));
  }

  /** The slider is let go: the Sun glides to the nearest station. */
  protected slideEnd(value: string): void {
    this.settleAt(nearestStation(roundsAtSlider(Number(value), this.maxRounds()), this.stationRounds()));
  }

  /** Arrow keys move from station to station, Page-Up and Page-Down from main station to main station, Home and End to the ends. */
  protected key(event: KeyboardEvent): void {
    const last = this.stations().length - 1;
    // From the station the Sun is gliding to, so quick presses never lose a step.
    const current = this.settled();
    const target: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      PageUp: this.nextMain(current, 1),
      PageDown: this.nextMain(current, -1),
      Home: 0,
      End: last,
    };
    if (!(event.key in target)) {
      return;
    }
    event.preventDefault();
    this.settleAt(Math.min(Math.max(target[event.key], 0), last));
  }

  /** The next main station from the given index in the given direction, or the last or first station. */
  private nextMain(index: number, step: 1 | -1): number {
    const stations = this.stations();
    for (let i = index + step; i > 0 && i < stations.length - 1; i += step) {
      if (stations[i].kind === 'haupt') {
        return i;
      }
    }
    return step > 0 ? stations.length - 1 : 0;
  }

  protected drag(rounds: number): void {
    this.stopGlide();
    this.turnTo(rounds);
  }

  protected dragEnd(): void {
    this.settleAt(nearestStation(this.rounds(), this.stationRounds()));
  }

  /**
   * The Sun settles at a station: it glides there, the station is announced once, and a full round gives a pulse.
   * Turning back at least one round marks the module explored.
   */
  protected settleAt(index: number): void {
    const station = this.stations()[index];
    const changed = index !== this.settled();
    this.following.set(false);
    this.settled.set(index);
    this.glideTo(station.rounds);
    this.announcement.set(`${station.timeLong}. ${station.sentence}`);
    if (changed && isFullRound(station)) {
      this.haptics.pulse();
    }
    if (station.rounds >= 1) {
      this.progress.markExplored('C');
    }
  }

  protected finish(): void {
    this.completed.emit();
  }

  protected closeFacts(): void {
    const section = this.factsOpen();
    this.factsOpen.set(null);
    this.factButtons()[section ? SECTIONS.indexOf(section) : 0]?.nativeElement.focus();
  }

  private turnTo(rounds: number): void {
    this.following.set(true);
    this.rounds.set(rounds);
  }

  private glideTo(target: number): void {
    this.stopGlide();
    const from = this.rounds();
    if (this.reducedMotion || Math.abs(target - from) < 1e-9) {
      this.rounds.set(target);
      return;
    }
    const start = this.frames.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / GLIDE_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      this.rounds.set(t >= 1 ? target : from + (target - from) * eased);
      this.glide = t >= 1 ? null : this.frames.request(step);
    };
    this.glide = this.frames.request(step);
  }

  private stopGlide(): void {
    if (this.glide !== null) {
      this.frames.cancel(this.glide);
      this.glide = null;
    }
  }
}
