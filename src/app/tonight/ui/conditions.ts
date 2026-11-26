import { Component, input } from '@angular/core';
import { Conditions } from '../engine/summary';

/** A quiet box with two lines: when it is dark enough, and the Moon (highlighted while it disturbs). */
@Component({
  selector: 'app-conditions',
  template: `
    <ul aria-label="Bedingungen heute Nacht">
      <li>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <path d="M12 3v2M5.5 6.5L7 8M18.5 6.5L17 8M3 13h2M19 13h2M7.5 17a4.5 4.5 0 019 0M3 20h18" />
        </svg>
        <span><strong>{{ conditions().dark.value }}</strong>{{ rest(conditions().dark.label) }}</span>
      </li>
      <li [class.warn]="conditions().moon.warn">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
          <path d="M11.5 8.5A5 5 0 015.5 2.5a5 5 0 106 6z" />
        </svg>
        <span><strong>{{ conditions().moon.value }}</strong>{{ rest(conditions().moon.label) }}</span>
      </li>
    </ul>
  `,
  styles: `
    :host { display: block; }
    ul {
      list-style: none; margin: 0; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px;
      border-radius: 12px; border: 1px solid var(--color-line); font-size: 14px; color: var(--color-ink-soft);
    }
    li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; }
    svg { margin-top: 2px; color: var(--color-starlight); }
    strong { font-weight: 600; color: var(--color-ink-bright); font-variant-numeric: tabular-nums; }
    .warn strong, .warn svg { color: var(--color-starlight); }
  `,
})
export class ConditionsBox {
  readonly conditions = input.required<Conditions>();

  protected rest(label: string): string {
    return label ? `, ${label}` : '';
  }
}
