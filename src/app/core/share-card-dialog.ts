import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { formatAge, planetAge } from '../outward-journey/engine/age';
import { PlanetId, findPlanet } from '../outward-journey/data/planets';
import { BirthYear } from './birth-year';
import { CLOCK } from './clock';
import { CardKind, CardPicture, DEFAULT_FILE_NAME, JourneyCard, ShareCard, ShareResult, cardFileName, cardText } from './share-card';

const KIND_LABEL: Record<CardKind, string> = {
  kronkorken: 'Kronkorken',
  muenze: 'Münze',
  alter: 'Mein Alter',
  reise: 'Reise',
};

/** Preview of a picture card with "Teilen" (share sheet) or "Herunterladen". */
@Component({
  selector: 'app-share-card-dialog',
  template: `
    <dialog #dialog aria-labelledby="share-title" (cancel)="close()">
      <div class="head">
        <h2 id="share-title">Bild teilen</h2>
        <button type="button" class="icon" aria-label="Schliessen" (click)="close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      @if (kinds().length > 1) {
        <div class="kinds" role="group" aria-label="Karte wählen">
          @for (k of kinds(); track k) {
            <button type="button" [attr.aria-pressed]="kind() === k" (click)="kind.set(k)">{{ label(k) }}</button>
          }
        </div>
      }
      <div class="preview">
        @if (previewUrl(); as url) {
          <img [src]="url" [alt]="alt()" width="270" height="338" />
        } @else {
          <p class="card-text">{{ text() }}</p>
        }
      </div>
      <p class="note">Das Bild entsteht auf deinem Gerät. Nichts wird hochgeladen.</p>
      <div class="actions">
        @if (canShare) {
          <button type="button" class="primary" [disabled]="!blob()" (click)="share()">Teilen</button>
        }
        <button type="button" [class.primary]="!canShare" [disabled]="!blob()" (click)="download()">Herunterladen</button>
      </div>
      <p class="status" aria-live="polite">{{ status() }}</p>
    </dialog>
  `,
  styleUrl: './share-card-dialog.css',
})
export class ShareCardDialog {
  private readonly cards = inject(ShareCard);
  private readonly birthYear = inject(BirthYear);
  private readonly clock = inject(CLOCK);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly kinds = input.required<readonly CardKind[]>();
  readonly planet = input<PlanetId | null>(null);
  /** The journey of the travel card. */
  readonly journey = input<JourneyCard | null>(null);
  /** A picture above the sentence (travel card: the destination). */
  readonly picture = input<CardPicture | null>(null);
  readonly closed = output<void>();

  protected readonly canShare = this.cards.canShareFiles();
  protected readonly kind = signal<CardKind>('kronkorken');
  protected readonly blob = signal<Blob | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly status = signal('');

  protected readonly text = computed(() => {
    const kind = this.kind();
    if (kind === 'reise') {
      return cardText('reise', { journey: this.journey() ?? undefined });
    }
    if (kind !== 'alter') {
      return cardText(kind);
    }
    const planet = findPlanet(this.planet() ?? 'mars');
    const year = this.birthYear.year();
    const age = year === null ? '' : formatAge(planetAge(year, planet.period, this.clock()));
    return cardText('alter', { planetDative: planet.dative, age });
  });

  protected readonly alt = computed(() => {
    const picture = this.picture();
    const head = picture ? `Bildkarte mit einem Bild von ${picture.name}: ` : 'Bildkarte: ';
    return `${head}${this.text().replaceAll('\n', ' ').replace(/ +/g, ' ')} Die Milchstrasse erleben.`;
  });

  /** The travel card is named after its destination ("proxima-centauri.png"), the others "milchstrasse.png". */
  protected readonly fileName = computed(() => {
    const journey = this.journey();
    const kind = this.kind();
    if (kind === 'reise' && journey) {
      return cardFileName(journey.destination);
    }
    return DEFAULT_FILE_NAME;
  });

  private readonly opener = (globalThis.document?.activeElement as HTMLElement | null) ?? null;

  constructor() {
    effect(() => this.kind.set(this.kinds()[0]));
    effect((onCleanup) => {
      const text = this.text();
      const picture = this.picture();
      let cancelled = false;
      void this.cards.render(text, picture).then((blob) => {
        if (cancelled) {
          return;
        }
        this.blob.set(blob);
        this.previewUrl.set(blob && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : null);
      });
      onCleanup(() => {
        cancelled = true;
        this.revoke();
      });
    });
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.revoke();
      this.opener?.focus?.();
    });
  }

  protected label(kind: CardKind): string {
    return KIND_LABEL[kind];
  }

  protected async share(): Promise<void> {
    const blob = this.blob();
    if (blob) {
      this.report(await this.cards.share(blob, this.text(), this.fileName()));
    }
  }

  protected download(): void {
    const blob = this.blob();
    if (blob) {
      this.report(this.cards.download(blob, this.fileName()));
    }
  }

  close(): void {
    this.dialog().nativeElement.close?.();
    this.closed.emit();
  }

  private report(result: ShareResult): void {
    const messages: Record<ShareResult, string> = {
      shared: 'Geteilt.',
      cancelled: '',
      downloaded: 'Das Bild wurde gespeichert.',
      failed: 'Teilen hat nicht geklappt. Du kannst das Bild herunterladen.',
    };
    this.status.set(messages[result]);
  }

  private revoke(): void {
    const url = this.previewUrl();
    if (url && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
  }
}
