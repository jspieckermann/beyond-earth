import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { thumbUrl } from '../data/pictures';
import { Thumb } from '../engine/visibility';
import { StarDrawing } from './star-drawing';

/** The small square picture of an object: a photo thumbnail or a tiny drawing. Decorative; the name is next to it. */
@Component({
  selector: 'app-object-thumb',
  imports: [NgOptimizedImage, StarDrawing],
  template: `
    @if (url(); as src) {
      <img [ngSrc]="src" width="128" height="128" alt="" />
    } @else if (drawingOf(); as d) {
      <app-star-drawing [drawing]="d" />
    }
  `,
  styles: `
    :host { display: block; width: var(--thumb-size, 64px); height: var(--thumb-size, 64px); border-radius: 10px; overflow: hidden; background: var(--color-night-950); flex: none; }
    img { display: block; width: 100%; height: 100%; object-fit: cover; }
  `,
})
export class ObjectThumb {
  readonly thumb = input.required<Thumb>();

  protected readonly url = computed(() => {
    const t = this.thumb();
    return 'picture' in t ? thumbUrl(t.picture) : null;
  });
  protected readonly drawingOf = computed(() => {
    const t = this.thumb();
    return 'drawing' in t ? t.drawing : null;
  });
}
