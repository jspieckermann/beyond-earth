import { Component, computed, input, output } from '@angular/core';
import { formatCount, formatDuration } from '../engine/format';
import { TravelResult } from '../engine/travel';

/**
 * Step "Ankunft": durations on board and on Earth (board first, like the generations below), generations, arrival year, a row of figures,
 * the history anchor and the closing sentence; "here" and "never" show only their sentence.
 */
@Component({
  selector: 'app-arrival',
  template: `
    @let r = result();
    @if (r.kind === 'journey') {
      <dl class="numbers">
        <div>
          <dt>An Bord</dt>
          <dd>{{ prefix() }}{{ duration(r.boardYears) }}</dd>
        </div>
        <div>
          <dt>Auf der Erde</dt>
          <dd>{{ prefix() }}{{ duration(r.earthYears) }}</dd>
        </div>
        <div>
          <dt>Generationen an Bord</dt>
          <dd>{{ prefix() }}{{ count(r.generationsBoard) }}</dd>
        </div>
        <div>
          <dt>Generationen auf der Erde</dt>
          <dd>{{ prefix() }}{{ count(r.generationsEarth) }}</dd>
        </div>
      </dl>
      @if (r.arrivalYear !== null) {
        <p class="year">Ankunft im Jahr {{ r.arrivalYear }}, nach Erdzeit</p>
      }
      <div class="figures" role="img" [attr.aria-label]="figuresLabel()">
        @for (f of figureSlots(); track $index) {
          <svg width="14" height="26" viewBox="0 0 14 26" aria-hidden="true"><circle cx="7" cy="5" r="4" /><path d="M2 25V15a5 5 0 0 1 10 0v10z" /></svg>
        }
      </div>
      @if (r.figures.unit > 1) {
        <p class="legend">Eine Figur steht für {{ count(r.figures.unit) }} Generationen.</p>
      }
      @if (r.anchor) {
        <p class="anchor">{{ r.anchor }}</p>
      }
      @if (r.lowerBound) {
        <p class="note">Mindestens: Während der Reise dehnt sich der Raum weiter aus, das Ziel rückt also noch weiter weg.</p>
      }
    } @else if (r.kind === 'never') {
      <p class="never">Nie.</p>
    }
    <p class="outcome">„{{ r.outcome }}“</p>
    @if (r.kind === 'journey' && r.birthLine) {
      <p class="birth">{{ r.birthLine }}</p>
    }
    @if (shareable() && r.kind === 'journey') {
      <button type="button" class="share" (click)="share.emit()">Bild teilen</button>
    }
  `,
  styleUrl: './arrival.css',
})
export class Arrival {
  readonly result = input.required<TravelResult>();
  /** Offer "Bild teilen" (free exploration). */
  readonly shareable = input(false);
  readonly share = output<void>();

  protected readonly prefix = computed(() => {
    const r = this.result();
    return r.kind === 'journey' && r.lowerBound ? 'mindestens ' : '';
  });

  protected readonly figureSlots = computed(() => {
    const r = this.result();
    return r.kind === 'journey' ? Array.from({ length: r.figures.count }) : [];
  });

  protected readonly figuresLabel = computed(() => {
    const r = this.result();
    if (r.kind !== 'journey') {
      return '';
    }
    const n = r.generationsBoard;
    return n === 1 ? 'Eine Generation an Bord' : `${formatCount(n)} Generationen an Bord`;
  });

  protected duration(years: number): string {
    return formatDuration(years);
  }

  protected count(n: number): string {
    return formatCount(n);
  }
}
