import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, validate } from '@angular/forms/signals';
import { BirthYear } from '../../core/birth-year';
import { CLOCK } from '../../core/clock';
import { Planet } from '../data/planets';
import { formatAge, planetAge } from '../engine/age';

/**
 * The user's age on a planet. Asks for the birth year once (optional, only on this device),
 * then shows the age in that planet's years with a way to share it or change the year.
 */
@Component({
  selector: 'app-birth-year-form',
  imports: [FormField],
  template: `
    @if (age(); as a) {
      <div class="age">
        <p>Hier wärst du <strong>{{ a }}</strong> {{ a === '1' ? 'Jahr' : 'Jahre' }} alt.</p>
        <button type="button" class="icon" [attr.aria-label]="'Als Bild teilen: Auf ' + planet().dative + ' wäre ich ' + a" (click)="shareAge.emit(a)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
        </button>
        <button type="button" class="change" (click)="edit()">Jahrgang {{ birthYear.year() }} ändern</button>
      </div>
    } @else if (editing()) {
      <form class="ask" (submit)="save($event)" novalidate>
        <label for="birth-year">Dein Geburtsjahr</label>
        <div class="row">
          <input id="birth-year" inputmode="numeric" autocomplete="bday-year"
            [formField]="yearForm.year" [attr.aria-invalid]="showError()" [attr.aria-describedby]="showError() ? 'birth-year-error' : null" />
          <button type="submit">Alter berechnen</button>
          @if (birthYear.year() !== null) {
            <button type="button" class="change" (click)="remove()">Jahrgang löschen</button>
          }
        </div>
        @if (showError()) {
          <p id="birth-year-error" class="error" role="alert">{{ errorText() }}</p>
        }
        <p class="note">Bleibt nur auf diesem Gerät.</p>
      </form>
    } @else {
      <button type="button" class="change" (click)="edit()">Wie alt wäre ich hier?</button>
    }
  `,
  styleUrl: './birth-year-form.css',
})
export class BirthYearForm {
  protected readonly birthYear = inject(BirthYear);
  private readonly clock = inject(CLOCK);
  readonly planet = input.required<Planet>();
  readonly shareAge = output<string>();

  protected readonly editing = signal(false);
  private readonly submitted = signal(false);
  private readonly model = signal({ year: '' });

  protected readonly yearForm = form(this.model, (path) => {
    validate(path.year, ({ value }) => {
      const year = Number(value());
      return this.birthYear.isValid(year) && /^\d{4}$/.test(value().trim())
        ? undefined
        : { kind: 'range', message: `Bitte ein Jahr zwischen 1900 und ${this.clock().getFullYear()} eingeben.` };
    });
  });

  protected readonly showError = computed(() => this.submitted() && this.yearForm.year().invalid());
  protected readonly errorText = computed(() => this.yearForm.year().errors()[0]?.message ?? '');

  protected readonly age = computed(() => {
    const year = this.birthYear.year();
    if (year === null || this.editing()) {
      return null;
    }
    return formatAge(planetAge(year, this.planet().period, this.clock()));
  });

  protected edit(): void {
    this.model.set({ year: this.birthYear.year()?.toString() ?? '' });
    this.submitted.set(false);
    this.editing.set(true);
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.yearForm.year().invalid()) {
      return;
    }
    this.birthYear.set(Number(this.model().year));
    this.editing.set(false);
  }

  protected remove(): void {
    this.birthYear.clear();
    this.model.set({ year: '' });
    this.submitted.set(false);
  }
}
