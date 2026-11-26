import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExplorationProgress } from '../core/exploration-progress';
import { LayoutMode } from '../core/layout-mode';
import { Haptics } from '../core/haptics';
import { findBody, isBodyId } from './data/planets';
import { STAGES } from './data/stages';
import { ZoomState } from './engine/zoom-state';
import { keyIntent } from './input/zoom-input';
import { JourneyUi, JourneyVariant } from './journey-ui';
import { JourneyScene } from './scene/journey-scene';
import { SceneGeometry } from './scene/scene-geometry';
import { CreditsDialog } from './ui/credits-dialog';
import { DistanceReadout } from './ui/distance-readout';
import { EarthMarker } from './ui/earth-marker';
import { FactSheet, FactSheetContent } from '../core/fact-sheet';
import { CREDITS, CREDIT_KIND_LABEL, CreditId } from './data/credits';
import { JourneyEnd } from './ui/journey-end';
import { ScaleBar } from './ui/scale-bar';
import { StageText } from './ui/stage-text';
import { PlanetCloseup } from './ui/planet-closeup';
import { ShareCardDialog } from '../core/share-card-dialog';

/** The credit lines under the facts: kind and source of each picture. */
function sourcesOf(ids: readonly CreditId[]): FactSheetContent['sources'] {
  return ids.map((id) => ({ kind: CREDIT_KIND_LABEL[CREDITS[id].kind], source: CREDITS[id].source }));
}

/**
 * Modul A "Die Reise nach draussen": one continuous zoom from the Earth to the universe.
 * Embeddable: the module page uses the free-exploration variant; the guided journey can
 * embed the main-journey variant and listen to `completed`.
 */
@Component({
  selector: 'app-outward-journey',
  imports: [
    RouterLink,
    JourneyScene,
    EarthMarker,
    DistanceReadout,
    ScaleBar,
    StageText,
    FactSheet,
    JourneyEnd,
    CreditsDialog,
    PlanetCloseup,
    ShareCardDialog,
  ],
  providers: [ZoomState, SceneGeometry, JourneyUi],
  host: {
    '[attr.data-layout]': 'layout()',
    '(keydown)': 'onKey($event)',
  },
  templateUrl: './outward-journey.html',
  styleUrl: './outward-journey.css',
})
export class OutwardJourney {
  readonly variant = input<JourneyVariant>('freies-erkunden');
  /** Free exploration: the stage to start at (a stage id), e.g. when coming back from Modul B. */
  readonly startStage = input<string | null>(null);
  /** Free exploration: the body whose close-up opens at the start stage. */
  readonly startBody = input<string | null>(null);
  /** Main-journey variant: the user chose "Weiter" at the end. */
  readonly completed = output<void>();

  protected readonly zoom = inject(ZoomState);
  protected readonly ui = inject(JourneyUi);
  private readonly geometry = inject(SceneGeometry);
  private readonly haptics = inject(Haptics);
  private readonly progress = inject(ExplorationProgress);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly layout = inject(LayoutMode).layout;

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly stageText = viewChild(StageText);
  private readonly scaleBar = viewChild(ScaleBar);

  protected readonly planet = computed(() => {
    const id = this.ui.planet();
    return id ? findBody(id, STAGES[untracked(() => this.zoom.nearest())].id) : null;
  });

  /** Facts of the open planet, or of the stage the view rests at. */
  protected readonly facts = computed<FactSheetContent>(() => {
    const planet = this.planet();
    if (planet) {
      return { kicker: planet.name, facts: planet.facts, sources: sourcesOf([planet.credit]) };
    }
    const stage = STAGES[this.zoom.restingStage() ?? this.zoom.nearest()];
    return {
      kicker: stage.title,
      facts: stage.facts,
      sources: sourcesOf(stage.credits),
      branches: this.ui.isExplore() ? stage.factBranches : undefined,
    };
  });

  constructor() {
    effect(() => this.ui.variant.set(this.variant()));

    // Coming back from another module: rest at that stage and open the close-up again. Unknown values start at the Earth.
    let started = false;
    effect(() => {
      const stage = STAGES.findIndex((s) => s.id === this.startStage());
      const body = this.startBody();
      if (started || this.variant() !== 'freies-erkunden' || stage < 0) {
        return;
      }
      started = true;
      untracked(() => {
        this.zoom.settleAt(stage);
        if (isBodyId(body)) {
          this.ui.planet.set(body);
        }
      });
    });
    this.zoom.onCompleted(() => this.progress.markExplored('A'));

    // Any movement of the view closes the facts.
    let lastZ = this.zoom.z();
    effect(() => {
      const z = this.zoom.z();
      if (z === lastZ) {
        return;
      }
      lastZ = z;
      if (untracked(() => this.ui.factsOpen())) {
        untracked(() => this.closeFacts());
      }
    });

    // Every snap into a stage: one short vibration pulse.
    let lastSeq = this.zoom.settled().seq;
    effect(() => {
      const { seq } = this.zoom.settled();
      if (seq === lastSeq) {
        return;
      }
      lastSeq = seq;
      untracked(() => this.haptics.pulse());
    });

    // Measure the viewport the journey fills.
    const resize = () => {
      const rect = this.host.nativeElement.getBoundingClientRect();
      this.geometry.resize(rect.width, rect.height);
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    afterNextRender(() => {
      resize();
      observer?.observe(this.host.nativeElement);
      if (!this.ui.planet()) {
        this.heading().nativeElement.focus();
      }
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }

  protected onKey(event: KeyboardEvent): void {
    if (this.ui.planet() || this.ui.creditsOpen() || this.ui.share()) {
      return;
    }
    const direction = keyIntent(event);
    if (direction) {
      event.preventDefault();
      this.zoom.step(direction);
    }
  }

  protected closeFacts(): void {
    this.ui.factsOpen.set(false);
    this.stageText()?.focusFactsButton();
  }

  protected jumpToStage(): void {
    this.scaleBar()?.focusCurrent();
  }
}
