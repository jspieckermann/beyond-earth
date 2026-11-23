import { Component, computed, linkedSignal, model, output, signal } from '@angular/core';
import { formatKms, formatPercent } from '../engine/format';
import { PRESETS, SLIDER_MAX, SpeedPreset, betaToPosition, parsePercent, positionToBeta, presetFor } from '../engine/speed-scale';

/**
 * Step "Tempo": a logarithmic slider, a number field for an exact value and the presets of the concept.
 * `beta` follows every movement; `committed` fires when a value settles (release, preset, number field).
 */
@Component({
  selector: 'app-speed-control',
  template: `
    <p class="value"><span class="number">{{ percent() }}</span> % <span class="of">der Lichtgeschwindigkeit</span></p>
    <input
      class="slider"
      type="range"
      min="0"
      [max]="sliderMax"
      step="1"
      aria-label="Tempo"
      [attr.aria-valuetext]="percent() + ' % der Lichtgeschwindigkeit'"
      [value]="position()"
      [style.--fill]="position() / sliderMax"
      (input)="slide($event)"
      (change)="committed.emit()"
    />
    <div class="scale" aria-hidden="true">
      @for (t of ticks; track t.label) {
        <span [class]="t.align" [style.--at]="t.at">{{ t.label }}</span>
      }
    </div>

    <div class="exact">
      <label for="speed-percent">Genau</label>
      <input
        id="speed-percent"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        [value]="typed()"
        (input)="typed.set(fieldValue($event))"
        (change)="commitTyped()"
        (keydown.enter)="commitTyped()"
      />
      <span aria-hidden="true">%</span>
    </div>

    <div class="presets" role="group" aria-label="Vorgaben">
      @for (p of presets; track p.id) {
        <button type="button" [attr.aria-pressed]="active()?.id === p.id" (click)="choose(p)">
          <span class="name">{{ p.label }}</span>
          @if (p.label !== percentLabel(p)) {
            <span class="sub">{{ percentLabel(p) }}</span>
          }
        </button>
      }
    </div>

    <p class="kms">Das sind etwa {{ kms() }} km/s.</p>
    <p class="hint">Genau 100 % erreicht nur das Licht selbst.</p>
    <p class="status" role="status">
      @if (clamped()) {
        Auf 99,9999 % gesetzt: Schneller als das geht es hier nicht.
      } @else if (unreadable()) {
        Bitte eine Zahl eingeben, zum Beispiel 0,5.
      }
    </p>
  `,
  styleUrl: './speed-control.css',
})
export class SpeedControl {
  /** Speed as a fraction of the speed of light. */
  readonly beta = model.required<number>();
  readonly committed = output<void>();

  protected readonly sliderMax = SLIDER_MAX;
  protected readonly presets = PRESETS;
  /** Labels under the slider, at the slider positions of their speeds (0 … 1). */
  protected readonly ticks = [
    { label: '0,001 %', at: 0, align: 'start' },
    { label: '10 %', at: betaToPosition(0.1) / SLIDER_MAX, align: 'mark' },
    { label: '99,9999 %', at: 1, align: 'end' },
  ];
  protected readonly percent = computed(() => formatPercent(this.beta()));
  protected readonly position = computed(() => betaToPosition(this.beta()));
  protected readonly kms = computed(() => formatKms(this.beta()));
  protected readonly active = computed(() => presetFor(this.beta()));
  protected readonly typed = linkedSignal(() => formatPercent(this.beta()));
  protected readonly clamped = signal(false);
  protected readonly unreadable = signal(false);

  protected percentLabel(p: SpeedPreset): string {
    return `${formatPercent(p.beta)} %`;
  }

  protected fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected slide(event: Event): void {
    this.reset();
    this.beta.set(positionToBeta(Number(this.fieldValue(event))));
  }

  protected choose(preset: SpeedPreset): void {
    this.reset();
    this.beta.set(preset.beta);
    this.committed.emit();
  }

  protected commitTyped(): void {
    const parsed = parsePercent(this.typed());
    if (!parsed) {
      this.clamped.set(false);
      this.unreadable.set(true);
      return;
    }
    this.unreadable.set(false);
    if (parsed.beta === this.beta()) {
      // Enter and the change event both commit: a repeat keeps the hint of the first.
      this.clamped.update((shown) => shown || parsed.clampedHigh);
      this.typed.set(formatPercent(parsed.beta));
      return;
    }
    this.clamped.set(parsed.clampedHigh);
    this.beta.set(parsed.beta);
    this.committed.emit();
  }

  private reset(): void {
    this.clamped.set(false);
    this.unreadable.set(false);
  }
}
