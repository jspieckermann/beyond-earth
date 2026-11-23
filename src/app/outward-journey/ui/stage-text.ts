import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HOME_LINE, STAGES } from '../data/stages';
import { MAX_Z } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';
import { JourneyUi } from '../journey-ui';
import { SceneGeometry } from '../scene/scene-geometry';

const MOON_STAGE = 1;

/**
 * Title, poetic line and Aha of the stage the view rests at, shown directly in the picture.
 * Hidden while the view moves. Announces each stage once to assistive technology.
 */
@Component({
  selector: 'app-stage-text',
  imports: [RouterLink],
  template: `
    <p class="sr-only" aria-live="polite">{{ announcement() }}</p>
    @if (visible(); as v) {
      <section class="text" [attr.aria-labelledby]="'stage-title'">
        <h2 id="stage-title" class="title">{{ v.title }}</h2>
        <p class="line">{{ v.line }}</p>
        @if (ahaShown() && v.aha) {
          <p class="aha">{{ v.aha }}</p>
          @if (v.extra) {
            <p class="extra">{{ v.extra }}</p>
          }
        }
        @if (!home()) {
          <div class="actions">
            @if (explore()) {
              <button #factsButton type="button" class="link" (click)="openFacts()" [attr.aria-expanded]="ui.factsOpen()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>
                Wie genau weiss man das?
              </button>
            } @else {
              <button #factsButton type="button" class="icon-link" aria-label="Wie genau weiss man das?" (click)="openFacts()" [attr.aria-expanded]="ui.factsOpen()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>
              </button>
            }
            @if (v.stage === moonStage) {
              <button type="button" class="link" (click)="togglePlanetsInGap()" [attr.aria-pressed]="ui.planetsInGap()">
                {{ ui.planetsInGap() ? 'Planeten zurücknehmen' : 'Planeten in die Lücke' }}
              </button>
            }
            @if (explore() && v.branch) {
              <a class="link" [routerLink]="['/module', v.branch.slug]">{{ v.branch.label }} →</a>
            }
            @if (v.stage === lastStage && zoom.homeVisible()) {
              <button type="button" class="link home" (click)="goHome()">Und jetzt zurück. Nach Hause.</button>
            }
          </div>
        }
      </section>
    }
    @if (hint()) {
      <p class="hint">Zum Hinauszoomen scrollen, nach oben ziehen oder ↑ drücken</p>
    }
  `,
  styleUrl: './stage-text.css',
})
export class StageText {
  protected readonly zoom = inject(ZoomState);
  protected readonly ui = inject(JourneyUi);
  protected readonly moonStage = MOON_STAGE;
  protected readonly lastStage = MAX_Z;
  protected readonly explore = computed(() => this.ui.variant() === 'freies-erkunden');
  protected readonly home = computed(() => this.zoom.home() && this.zoom.restingStage() === 0);
  protected readonly ahaShown = this.zoom.ahaVisible;

  private readonly factsButton = viewChild<ElementRef<HTMLButtonElement>>('factsButton');

  /** The stage texts while resting. */
  protected readonly visible = computed(() => {
    const stage = this.zoom.restingStage();
    if (stage === null || this.zoom.phase() !== 'atStage') {
      return null;
    }
    const data = STAGES[stage];
    if (this.home()) {
      return { stage, title: 'Zurück bei der Erde', line: HOME_LINE, aha: '', extra: undefined, branch: undefined };
    }
    return { stage, title: data.title, line: data.line, aha: data.aha, extra: data.extra, branch: data.branch };
  });

  protected readonly hint = computed(() => !this.zoom.moved() && this.zoom.restingStage() === 0);

  /** What assistive technology hears on arrival: title, line and Aha. */
  protected readonly announcement = signal('');

  constructor() {
    effect(() => {
      const v = this.visible();
      if (!v) {
        return;
      }
      this.announcement.set(this.ahaShown() && v.aha ? `${v.title}. ${v.line} ${v.aha}` : `${v.title}. ${v.line}`);
    });

    // Report where the texts start, so the scale bar can end above them on short phones.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const geometry = inject(SceneGeometry);
    const measure = () => {
      const parent = host.offsetParent?.getBoundingClientRect().top ?? 0;
      if (host.offsetHeight > 0) {
        geometry.reportTextTop(Math.round(host.getBoundingClientRect().top - parent));
      }
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    afterNextRender(() => {
      measure();
      observer?.observe(host);
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }

  protected openFacts(): void {
    this.ui.factsOpen.set(true);
  }

  /** Focus target when the fact sheet closes. */
  focusFactsButton(): void {
    this.factsButton()?.nativeElement.focus();
  }

  protected togglePlanetsInGap(): void {
    this.ui.planetsInGap.update((v) => !v);
  }

  protected goHome(): void {
    this.ui.closeOverlays();
    this.zoom.goHome();
  }
}
