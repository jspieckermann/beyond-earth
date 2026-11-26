import { Component, ElementRef, afterNextRender, computed, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CLOCK } from '../core/clock';
import { FactSheet } from '../core/fact-sheet';
import { DarknessLevel } from '../core/models';
import { NightMode } from '../core/night-mode';
import { TonightService } from '../core/tonight';
import { TONIGHT_FACTS } from './data/facts';
import { listedPlace, suggestedDarkness, suggestionReason } from './data/places';
import { altitude } from './engine/ephemeris';
import { MomentId, momentsFor, preselectedMoment } from './engine/moments';
import { tonight } from './engine/night';
import { conditionsFor, milkyWayNote, summarySentence } from './engine/summary';
import { NightSky, listFor, milkyWayTonight } from './engine/visibility';
import { DarknessChoice } from './place/darkness-choice';
import { PickedPlace, PlacePicker } from './place/place-picker';
import { ConditionsBox } from './ui/conditions';
import { HiddenList } from './ui/hidden-list';
import { ObjectCard } from './ui/object-card';

export type TonightVariant = 'frei' | 'hauptreise';

/** Objects shown in the guided journey's short variant. */
export const JOURNEY_OBJECTS = 3;

/**
 * „Heute Nacht“ on one page: the place and how dark it is there at the top, below what can be seen tonight with the
 * naked eye, where it stands and how to find it. A chosen place is stored at once and the list follows it.
 * Embeddable like the modules: the page uses `frei`; the guided journey's act 6 embeds `hauptreise` (place, summary
 * and the first objects) and listens to `completed`.
 */
@Component({
  selector: 'app-tonight',
  imports: [RouterLink, FactSheet, PlacePicker, DarknessChoice, ConditionsBox, ObjectCard, HiddenList],
  templateUrl: './tonight.html',
  styleUrl: './tonight.css',
})
export class Tonight {
  readonly variant = input<TonightVariant>('frei');
  /** Guided journey: the closing control was activated. */
  readonly completed = output<void>();

  protected readonly service = inject(TonightService);
  /** Read only: night mode is switched in the settings; the tip pointing there is shown while it is off. */
  protected readonly nightMode = inject(NightMode);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly factsButton = viewChild<ElementRef<HTMLElement>>('factsButton');

  /** "Now" is read once: the page describes tonight as it was when it was opened. */
  private readonly now = inject(CLOCK)();

  protected readonly free = computed(() => this.variant() === 'frei');
  protected readonly place = this.service.place;
  protected readonly darkness = this.service.darkness;

  /** Guided journey: „Überspringen“ was activated. */
  protected readonly skipped = signal(false);
  protected readonly factsOpen = signal(false);
  protected readonly facts = TONIGHT_FACTS;

  /** The level suggested for the stored place, and the line saying so while it is the chosen one. */
  private readonly suggestion = computed(() => {
    const p = this.place();
    const listed = p && p.source === 'list' ? listedPlace(p.name, p.lat, p.lon) : null;
    return p ? { level: suggestedDarkness(listed), reason: suggestionReason(listed) } : null;
  });
  protected readonly darknessHint = computed(() => {
    const s = this.suggestion();
    return s && s.level === this.darkness() ? s.reason : null;
  });

  protected readonly night = computed(() => {
    const p = this.place();
    return p ? tonight(p, this.now) : null;
  });
  private readonly sky = computed(() => {
    const p = this.place();
    const n = this.night();
    const d = this.darkness();
    return p && n && d ? new NightSky(p, n, d) : null;
  });
  protected readonly moments = computed(() => {
    const p = this.place();
    const n = this.night();
    return p && n ? momentsFor(n, p.tz) : [];
  });
  protected readonly momentId = linkedSignal<MomentId>(() => {
    const m = this.moments();
    return m.length ? preselectedMoment(m, this.now) : 'abends';
  });
  protected readonly moment = computed(() => this.moments().find((m) => m.id === this.momentId()) ?? null);
  protected readonly list = computed(() => {
    const s = this.sky();
    const m = this.moment();
    return s && m ? listFor(s, m) : null;
  });
  protected readonly shown = computed(() => {
    const visible = this.list()?.visible ?? [];
    return this.free() ? visible : visible.slice(0, JOURNEY_OBJECTS);
  });
  /**
   * The expanded cards: the first one when the list changes, none in the guided journey. Cards open and close on their
   * own; opening one never closes another, so nothing above it moves and the page does not appear to scroll.
   */
  protected readonly openIds = linkedSignal<ReadonlySet<string>>(() => {
    const first = this.shown()[0]?.id;
    return new Set(this.free() && first ? [first] : []);
  });
  protected readonly conditions = computed(() => {
    const p = this.place();
    const n = this.night();
    const l = this.list();
    return p && n && l ? conditionsFor(n, p.tz, l.moonDisturbs) : null;
  });
  protected readonly summary = computed(() => {
    const n = this.night();
    const d = this.darkness();
    const l = this.list();
    const m = this.moment();
    return n && d && l && m ? summarySentence(l, m, n, d) : '';
  });
  protected readonly milkyWay = computed(() => {
    const p = this.place();
    const n = this.night();
    const d = this.darkness();
    const s = this.sky();
    return p && n && d && s ? milkyWayNote(p, n, d, milkyWayTonight(s, this.moments())) : null;
  });
  protected readonly moonUp = computed(() => {
    const p = this.place();
    const m = this.moment();
    return !!p && !!m && altitude('moon', p, m.at) > 0;
  });

  constructor() {
    // A place stored without a level (older data) gets the suggested one.
    const s = this.suggestion();
    if (s && !this.darkness()) {
      this.service.setDarkness(s.level);
    }
    afterNextRender(() => this.heading()?.nativeElement.focus());
  }

  /** A place was chosen: store it with the suggested level; the list below follows at once. */
  protected picked(p: PickedPlace): void {
    this.service.choosePlace(p.place);
    this.service.setDarkness(p.suggestion);
    this.skipped.set(false);
  }

  protected setDarkness(level: DarknessLevel | null): void {
    if (level) {
      this.service.setDarkness(level);
    }
  }

  protected toggle(id: string): void {
    this.openIds.update((open) => {
      const next = new Set(open);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }

  protected closeFacts(): void {
    this.factsOpen.set(false);
    this.factsButton()?.nativeElement.focus();
  }

  protected finish(): void {
    this.completed.emit();
  }
}
