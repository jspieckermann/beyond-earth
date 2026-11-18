import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { ExplorationProgress } from '../core/exploration-progress';
import { HomeLayout } from '../core/layout-mode';
import { ModuleId } from '../core/models';
import { SKY_HEIGHT, SKY_MODULES, SKY_WIDTH, SkyModule, WIDE_PREVIEW_ANCHOR } from './data/modules';
import { Size, previewPlacement } from './data/preview-placement';
import { bandCloud, bandGeometry, connectorLine, toRegion, widePreviewPosition } from './data/wide-sky';
import { ModulePreview } from './module-preview';

/** Bottom of the greeting area in sky units; the phone preview avoids covering it when it can. */
const GREETING_BOTTOM = 190;
const PREVIEW_ID = 'module-preview';

const pct = (value: number) => `${value * 100}%`;

interface StarView {
  readonly module: SkyModule;
  readonly explored: boolean;
  readonly selected: boolean;
  readonly left: string;
  readonly top: string;
  readonly labelLeft: string | null;
  readonly labelRight: string | null;
  readonly labelOnLeft: boolean;
  readonly labelHidden: boolean;
}

/**
 * The seven module stars with their labels and the preview of the selected one.
 * Phone: stars on the 390 × 600 sky stage, preview next to the star.
 * Tablet/desktop: stars spread over the measured sky region, which also draws the band;
 * the preview opens at a fixed spot below the band, joined to its star by a line.
 */
@Component({
  selector: 'app-module-constellation',
  imports: [ModulePreview],
  host: {
    '[class.wide]': 'wide()',
    '(keydown.escape)': 'closeWithEscape()',
    '(window:resize)': 'measure()',
  },
  template: `
    @if (wide()) {
      @let band = bandView();
      <div
        class="band"
        aria-hidden="true"
        [style.--cx]="band.cx + 'px'"
        [style.--cy]="band.cy + 'px'"
        [style.--angle]="band.angle + 'deg'"
        [style.--len]="band.length + 'px'"
        [style.--t]="layout() === 'desktop' ? 1 : 0.87"
      >
        <div class="layer glow"></div>
        <div class="layer mid"></div>
        <div class="layer core"></div>
        <div class="layer dust"></div>
        <svg class="cloud" [attr.width]="region().width" [attr.height]="region().height">
          @for (s of band.cloud; track $index) {
            <circle [attr.cx]="s.x" [attr.cy]="s.y" [attr.r]="s.r" [attr.opacity]="s.opacity" />
          }
        </svg>
      </div>
      @if (connector(); as line) {
        <svg class="connector" aria-hidden="true" [attr.width]="region().width" [attr.height]="region().height">
          <line [attr.x1]="line.x1" [attr.y1]="line.y1" [attr.x2]="line.x2" [attr.y2]="line.y2" />
          <circle [attr.cx]="line.x2" [attr.cy]="line.y2" r="2.5" />
        </svg>
      }
    }
    @for (star of stars(); track star.module.id) {
      <button
        #starButton
        type="button"
        class="star"
        [class.explored]="star.explored"
        [class.selected]="star.selected"
        [style.left]="star.left"
        [style.top]="star.top"
        [attr.aria-label]="star.module.title"
        [attr.aria-expanded]="star.selected"
        [attr.aria-controls]="star.selected ? previewId : null"
        [attr.data-module]="star.module.id"
        (click)="toggle(star.module.id)"
      >
        <span class="dot"></span>
      </button>
      <span
        class="label"
        aria-hidden="true"
        [class.explored]="star.explored"
        [class.selected]="star.selected"
        [class.left]="star.labelOnLeft"
        [style.left]="star.labelLeft"
        [style.right]="star.labelRight"
        [style.top]="star.top"
        [hidden]="star.labelHidden"
      >{{ star.module.short }}</span>
      @if (star.selected) {
        @let place = placement();
        <app-module-preview
          [module]="star.module"
          [explored]="star.explored"
          [x]="place.x"
          [y]="place.y"
          [wide]="wide()"
          [previewId]="previewId"
        />
      }
    }
  `,
  styleUrl: './module-constellation.css',
})
export class ModuleConstellation {
  private readonly progress = inject(ExplorationProgress);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly starButtons = viewChildren<ElementRef<HTMLButtonElement>>('starButton');

  /** Which layout the home screen uses. */
  readonly layout = input<HomeLayout>('phone');
  /** The selected module, two-way bindable: `[(selected)]`. */
  readonly selected = model<ModuleId | null>(null);

  protected readonly previewId = PREVIEW_ID;
  protected readonly wide = computed(() => this.layout() !== 'phone');
  protected readonly region = signal<Size>({ width: SKY_WIDTH, height: SKY_HEIGHT });

  protected readonly stars = computed<StarView[]>(() => {
    const explored = this.progress.exploredIds();
    const selected = this.selected();
    const wide = this.wide();
    return SKY_MODULES.map((module) => {
      const isSelected = module.id === selected;
      const x = wide ? module.wide.x : module.x / SKY_WIDTH;
      const y = wide ? module.wide.y : module.y / SKY_HEIGHT;
      const onLeft = !wide && module.labelSide === 'left';
      return {
        module,
        explored: explored.has(module.id),
        selected: isSelected,
        left: pct(x),
        top: pct(y),
        labelLeft: onLeft ? null : pct(x),
        labelRight: onLeft ? `calc(100% - ${pct(x)})` : null,
        labelOnLeft: onLeft,
        labelHidden: isSelected && !wide,
      };
    });
  });

  private readonly selectedModule = computed(() => SKY_MODULES.find((m) => m.id === this.selected()) ?? null);

  protected readonly placement = computed(() => {
    const module = this.selectedModule() ?? SKY_MODULES[0];
    const region = this.region();
    if (this.wide()) {
      return widePreviewPosition(WIDE_PREVIEW_ANCHOR, region);
    }
    const scale = region.width / SKY_WIDTH;
    const others = SKY_MODULES.filter((m) => m !== module).map((m) => ({ x: m.x * scale, y: m.y * scale }));
    return previewPlacement(
      { x: module.x * scale, y: module.y * scale },
      { width: region.width, height: SKY_HEIGHT * scale },
      GREETING_BOTTOM * scale,
      others,
    );
  });

  protected readonly connector = computed(() => {
    const module = this.selectedModule();
    if (!module || !this.wide()) {
      return null;
    }
    return connectorLine(toRegion(module.wide, this.region()), this.placement());
  });

  protected readonly bandView = computed(() => {
    const region = this.region();
    const first = SKY_MODULES[0].wide;
    const last = SKY_MODULES[SKY_MODULES.length - 1].wide;
    const band = bandGeometry(toRegion(first, region), toRegion(last, region));
    return { ...band, cloud: bandCloud(band, region) };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(() => this.measure());
        observer.observe(this.host.nativeElement);
        destroyRef.onDestroy(() => observer.disconnect());
      }
    });
  }

  protected toggle(id: ModuleId): void {
    this.measure();
    this.selected.update((current) => (current === id ? null : id));
  }

  protected closeWithEscape(): void {
    const id = this.selected();
    if (id === null) {
      return;
    }
    this.selected.set(null);
    const index = SKY_MODULES.findIndex((m) => m.id === id);
    this.starButtons()[index]?.nativeElement.focus();
  }

  protected measure(): void {
    const { clientWidth: width, clientHeight: height } = this.host.nativeElement;
    if (width > 0 && height > 0) {
      const current = this.region();
      if (current.width !== width || current.height !== height) {
        this.region.set({ width, height });
      }
    }
  }
}
