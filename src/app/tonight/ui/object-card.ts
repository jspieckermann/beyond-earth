import { Component, computed, input, output } from '@angular/core';
import { ObjectView } from '../engine/visibility';
import { MarkedPhoto } from './marked-photo';
import { ObjectThumb } from './object-thumb';

/** One object of the list: collapsed a line with position and ease; expanded the naked-eye photo, the eye sentence and the steps. */
@Component({
  selector: 'app-object-card',
  imports: [MarkedPhoto, ObjectThumb],
  template: `
    <button type="button" class="head" [attr.aria-expanded]="open()" [attr.aria-controls]="bodyId()" (click)="toggled.emit()">
      <app-object-thumb [thumb]="view().thumb" />
      <span class="title">
        <span class="name">{{ view().name }}</span>
        <span class="kind">{{ view().kind }}</span>
        <span class="position">{{ view().position }}</span>
      </span>
      <span class="side">
        <span class="ease" [class.easy]="view().ease !== 'uebung'">{{ view().easeWord }}</span>
        <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </button>
    @if (open()) {
      <div class="body" [id]="bodyId()">
        <figure>
          <span class="label">Mit dem blossen Auge</span>
          <app-marked-photo [view]="view().eyeView" [name]="view().name" [priority]="priority()" />
          <figcaption>{{ view().eyeView.caption }} Bild: <a [href]="view().eyeView.picture.source" target="_blank" rel="noopener">{{ view().eyeView.picture.author }}</a>, {{ view().eyeView.picture.licence }}</figcaption>
        </figure>

        <p class="eye">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
          <span><strong>Mit dem Auge:</strong> {{ view().eye }}</span>
        </p>

        <div class="find">
          <h4>So findest du es</h4>
          @if (view().steps; as steps) {
            <ol>
              @for (s of steps; track $index) {
                <li>{{ s }}</li>
              }
            </ol>
          } @else {
            <p class="soft">Eine Anleitung für diesen Ort gibt es noch nicht. Die Schritte sind bisher für Mitteleuropa geschrieben.</p>
          }
        </div>
        <p class="span"><strong>Sichtbar:</strong> {{ view().span }}</p>
      </div>
    }
  `,
  styles: `
    :host { display: block; border: 1px solid var(--color-line); border-radius: var(--radius-box); background: var(--color-surface); overflow: hidden; }
    .head {
      width: 100%; display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 12px; align-items: center;
      padding: 10px 12px 10px 10px; border: 0; background: none; color: var(--color-ink); font: inherit; text-align: left; cursor: pointer;
    }
    .title { display: flex; flex-direction: column; min-width: 0; }
    .name { font-size: 17px; font-weight: 600; color: var(--color-ink-bright); }
    .kind { font-size: 12px; color: var(--color-ink-muted); }
    .position { margin-top: 2px; font-size: 14px; color: var(--color-starlight); }
    .side { display: flex; align-items: center; gap: 6px; }
    .ease { font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--color-line-strong); color: var(--color-ink-soft); white-space: nowrap; }
    .chevron { color: var(--color-ink-soft); }
    .head[aria-expanded='true'] .chevron { transform: rotate(180deg); }
    .body { display: flex; flex-direction: column; gap: 16px; padding: 4px 14px 16px; }
    figure { margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-starlight); }
    figcaption { font-size: 12px; color: var(--color-ink-muted); }
    figcaption a { color: inherit; }
    .eye {
      margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start;
      padding: 10px 12px; border-radius: 8px; border: 1px dashed var(--color-line-strong); font-size: 14px;
    }
    .eye svg { margin-top: 2px; color: var(--color-starlight); }
    h4 { margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-ink-muted); }
    ol { margin: 0; padding: 0; list-style: none; counter-reset: step; display: flex; flex-direction: column; gap: 8px; }
    li { counter-increment: step; display: grid; grid-template-columns: 24px 1fr; gap: 10px; font-size: 15px; }
    li::before {
      content: counter(step); width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--color-accent-line);
      color: var(--color-starlight); display: grid; place-items: center; font-size: 12px; font-weight: 600;
    }
    .soft { margin: 0; color: var(--color-ink-soft); }
    .span { margin: 0; font-size: 13px; color: var(--color-ink-muted); }
    .span strong { color: var(--color-ink-soft); font-weight: 500; }
    @media (prefers-reduced-motion: no-preference) { .chevron { transition: transform 0.2s; } }
  `,
})
export class ObjectCard {
  readonly view = input.required<ObjectView>();
  readonly open = input(false);
  /** The first card's photo is the largest picture on the page: load it first. */
  readonly priority = input(false);
  readonly toggled = output<void>();

  protected readonly bodyId = computed(() => `object-${this.view().id.replace('+', '-')}`);
}
