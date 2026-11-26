import { Component, input } from '@angular/core';
import { HiddenView } from '../engine/visibility';
import { ObjectThumb } from './object-thumb';

/** „Heute nicht zu sehen“: objects tonight's Moon, twilight, the place or the time hide, each with its reason. */
@Component({
  selector: 'app-hidden-list',
  imports: [ObjectThumb],
  template: `
    <ul>
      @for (h of items(); track h.id) {
        <li>
          <app-object-thumb [thumb]="h.thumb" />
          <span class="text">
            <span class="name">{{ h.name }}</span>
            <span class="reason"><strong>{{ h.reason }}</strong> {{ h.detail }}</span>
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: block; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    li {
      display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 12px; align-items: center;
      padding: 8px 10px; border-radius: 12px; border: 1px solid var(--color-line);
    }
    app-object-thumb { --thumb-size: 48px; opacity: 0.7; }
    .text { display: flex; flex-direction: column; min-width: 0; }
    .name { font-weight: 600; color: var(--color-ink); }
    .reason { font-size: 13px; color: var(--color-ink-muted); }
    strong { font-weight: 500; color: var(--color-warn, var(--color-starlight)); }
  `,
})
export class HiddenList {
  readonly items = input.required<readonly HiddenView[]>();
}
