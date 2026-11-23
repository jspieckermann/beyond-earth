import { Component, ElementRef, afterNextRender, computed, effect, inject, input, linkedSignal, output, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BirthYear } from '../core/birth-year';
import { CLOCK } from '../core/clock';
import { ExplorationProgress } from '../core/exploration-progress';
import { FactSheet } from '../core/fact-sheet';
import { Haptics } from '../core/haptics';
import { LayoutMode } from '../core/layout-mode';
import { CardPicture, JourneyCard } from '../core/share-card';
import { ShareCardDialog } from '../core/share-card-dialog';
import { STAGES } from '../outward-journey/data/stages';
import { DEFAULT_DESTINATION, Destination, findDestination } from './data/destinations';
import { loadDestinationPicture } from './data/destination-picture';
import { LIGHT_SPEED_FACTS } from './data/facts';
import { formatDuration, formatPercent } from './engine/format';
import { PRESETS } from './engine/speed-scale';
import { TravelResult, travel } from './engine/travel';
import { Arrival } from './ui/arrival';
import { DestinationPicker } from './ui/destination-picker';
import { SpeedControl } from './ui/speed-control';

export type LightSpeedVariant = 'freies-erkunden' | 'hauptreise';

/** The speed the free exploration starts with. */
export const START_BETA = 0.1;
/** The three speeds of the main journey, each after "Weiter". */
export const MAIN_JOURNEY_BETAS: readonly number[] = [PRESETS[0].beta, 0.2, 0.99];

/** One sentence for assistive technology: destination, speed, both durations and the outcome. */
export function announce(destination: string, beta: number, r: TravelResult): string {
  const head = `${destination}, ${formatPercent(beta)} % der Lichtgeschwindigkeit:`;
  if (r.kind !== 'journey') {
    return `${head} ${r.outcome}`;
  }
  const min = r.lowerBound ? 'mindestens ' : '';
  return `${head} auf der Erde ${min}${formatDuration(r.earthYears)}, an Bord ${min}${formatDuration(r.boardYears)}. ${r.outcome}`;
}

/**
 * Modul B "Reisen mit Lichtgeschwindigkeit": a travel planner from a place of Modul A and a speed to the
 * duration on Earth and on board and the generations it takes. Embeddable like Modul A: the module page
 * uses the free-exploration variant; the guided journey can embed `hauptreise` and listen to `completed`.
 */
@Component({
  selector: 'app-light-speed-journey',
  imports: [RouterLink, SpeedControl, Arrival, DestinationPicker, FactSheet, ShareCardDialog],
  host: { '[attr.data-layout]': 'layout()' },
  templateUrl: './light-speed-journey.html',
  styleUrl: './light-speed-journey.css',
})
export class LightSpeedJourney {
  readonly variant = input<LightSpeedVariant>('freies-erkunden');
  /** Destination to start with (a Modul A body id), e.g. from Modul A's close-up. */
  readonly destinationId = input<string | null>(null);
  /** Modul A stage the user came from, for "Zurück zu …". */
  readonly from = input<string | null>(null);
  /** Main-journey variant: "Weiter" after the third speed. */
  readonly completed = output<void>();

  private readonly clock = inject(CLOCK);
  private readonly birthYear = inject(BirthYear);
  private readonly haptics = inject(Haptics);
  private readonly progress = inject(ExplorationProgress);
  protected readonly layout = inject(LayoutMode).layout;
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly factsButton = viewChild<ElementRef<HTMLElement>>('factsButton');

  protected readonly explore = computed(() => this.variant() === 'freies-erkunden');

  protected readonly destination = linkedSignal<Destination>(() => {
    const wanted = this.explore() ? this.destinationId() : null;
    return findDestination(wanted) ?? DEFAULT_DESTINATION;
  });

  /** Main journey: which of the three speeds is shown. */
  protected readonly step = signal(0);
  protected readonly beta = linkedSignal(() => (this.explore() ? START_BETA : MAIN_JOURNEY_BETAS[this.step()]));

  protected readonly result = computed(() =>
    travel(this.destination().reach, this.beta(), this.clock(), this.explore() ? this.birthYear.year() : null),
  );

  /** The live-region text: set only when a result settles, never while the slider moves. */
  protected readonly announcement = signal('');
  protected readonly pickerOpen = signal(false);
  protected readonly factsOpen = signal(false);
  protected readonly shareOpen = signal(false);
  /** The destination's picture on the travel card, loaded when the card is opened. */
  protected readonly sharePicture = signal<CardPicture | null>(null);

  /** "Zurück zu …" when the planner was opened from a close-up in Modul A. */
  protected readonly back = computed(() => {
    const stage = STAGES.find((s) => s.id === this.from());
    const target = findDestination(this.destinationId());
    if (!this.explore() || !stage || !target) {
      return null;
    }
    return { name: target.name, queryParams: { stufe: stage.id, nah: target.id } };
  });

  protected readonly card = computed<JourneyCard | null>(() => {
    const r = this.result();
    if (r.kind !== 'journey') {
      return null;
    }
    return {
      destination: this.destination().name,
      percent: formatPercent(this.beta()),
      duration: formatDuration(r.earthYears),
      generations: r.generationsBoard,
      lowerBound: r.lowerBound,
    };
  });

  protected readonly facts = LIGHT_SPEED_FACTS;
  protected readonly percent = computed(() => formatPercent(this.beta()));

  constructor() {
    // Seeing a travel result marks the module explored.
    effect(() => {
      if (this.result().kind === 'journey' && !untracked(() => this.progress.isExplored('B'))) {
        untracked(() => this.progress.markExplored('B'));
      }
    });
    afterNextRender(() => this.heading().nativeElement.focus());
  }

  /** A result has settled: announce it once and give one short pulse. */
  protected settle(): void {
    this.announcement.set(announce(this.destination().name, this.beta(), this.result()));
    this.haptics.pulse();
  }

  protected choose(destination: Destination): void {
    this.pickerOpen.set(false);
    this.destination.set(destination);
    this.settle();
  }

  protected next(): void {
    if (this.step() >= MAIN_JOURNEY_BETAS.length - 1) {
      this.completed.emit();
      return;
    }
    this.step.update((s) => s + 1);
    this.settle();
  }

  /** "Bild teilen": loads the destination's picture first, so the preview shows the finished card at once. */
  protected async openShare(): Promise<void> {
    this.sharePicture.set(await loadDestinationPicture(this.destination().id));
    this.shareOpen.set(true);
  }

  protected closeFacts(): void {
    this.factsOpen.set(false);
    this.factsButton()?.nativeElement.focus();
  }
}
