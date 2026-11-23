import { Injectable, computed, inject, signal } from '@angular/core';
import { LayoutMode } from '../../core/layout-mode';
import { STAGE_OFFSETS } from '../data/stages';
import { Point, Rect, STAGE_COUNT, earthOffsetAt, placeMarker } from '../engine/zoom-math';
import { ZoomState } from '../engine/zoom-state';

/** Width of the phone design the layers are drawn for, in base units. */
export const BASE_WIDTH = 390;
/** Top of the scale bar on phones, and its full height (the stage buttons plus spacing). */
export const SCALE_BAR_TOP = 72;
export const SCALE_BAR_FULL = STAGE_COUNT * 44 + 24;

/**
 * Screen geometry of one journey: viewport size, the base unit layers are drawn in,
 * the focus point and where the Earth is right now. Provided per journey component.
 */
@Injectable()
export class SceneGeometry {
  private readonly zoom = inject(ZoomState);
  private readonly layout = inject(LayoutMode).layout;
  private readonly size = signal({ width: BASE_WIDTH, height: 844 });

  readonly viewport = this.size.asReadonly();
  readonly wide = computed(() => this.layout() !== 'phone');

  /** Pixels per base unit: the phone design scaled to the viewport. */
  readonly unit = computed(() => {
    const { width, height } = this.size();
    return Math.max(0.8, Math.min(2, Math.min(width / BASE_WIDTH, height / 760)));
  });

  /** The point the view zooms around (the Earth at the first stages). */
  readonly focus = computed<Point>(() => {
    const { width, height } = this.size();
    return this.wide() ? { x: width * 0.58, y: height * 0.45 } : { x: width * 0.5, y: height * 0.39 };
  });

  /** The Earth's position on screen at the current zoom. */
  readonly earth = computed<Point>(() => {
    const offset = earthOffsetAt(this.zoom.z(), STAGE_OFFSETS);
    const u = this.unit();
    const f = this.focus();
    return { x: f.x + offset.x * u, y: f.y + offset.y * u };
  });

  /** Area the Earth marker may use: away from the edges, the stage texts and the scale bar. */
  readonly markerArea = computed<Rect>(() => {
    const { width, height } = this.size();
    if (this.wide()) {
      return { left: width * 0.42, top: 110, right: width - 190, bottom: height - 120 };
    }
    const textTop = this.textTopState() ?? height - 300;
    return { left: 22, top: 120, right: width - 150, bottom: Math.max(140, Math.min(textTop - 28, 520)) };
  });

  readonly marker = computed(() => placeMarker(this.earth(), this.size(), this.markerArea()));

  /**
   * Highest top edge of the stage texts seen at this viewport size. The scale bar ends above it,
   * so it only ever shrinks (once) instead of jumping with every stage's text.
   */
  private readonly textTopState = signal<number | null>(null);
  readonly textTop = this.textTopState.asReadonly();

  /** Height of the scale bar: on phones it ends above the stage texts. */
  readonly scaleBarHeight = computed(() => {
    if (this.wide()) {
      return null;
    }
    const top = this.textTop() ?? this.size().height - 300;
    return Math.max(160, Math.min(SCALE_BAR_FULL, top - SCALE_BAR_TOP - 12));
  });

  /** True when the stage buttons do not fit at full touch size (44 px each). */
  readonly compactScaleBar = computed(() => {
    const height = this.scaleBarHeight();
    return height !== null && height < STAGE_COUNT * 44;
  });

  /** The stage texts report where they start (pixels from the top of the journey). */
  reportTextTop(top: number): void {
    const current = this.textTopState();
    if (current === null || top < current) {
      this.textTopState.set(top);
    }
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    const { width: w, height: h } = this.size();
    if (w !== width || h !== height) {
      this.textTopState.set(null);
      this.size.set({ width, height });
    }
  }
}
