import { InjectionToken, Service, inject, signal } from '@angular/core';

export type HomeLayout = 'phone' | 'tablet' | 'desktop';

/** Wide screens, or tablets held sideways. */
export const DESKTOP_QUERY = '(min-width: 1100px), (min-width: 768px) and (orientation: landscape)';
/** Tablets held upright (when the desktop query does not match). */
export const TABLET_QUERY = '(min-width: 768px)';

export type MatchMedia = (query: string) => MediaQueryList;

/** The browser's `matchMedia`, or null where it does not exist (tests, SSR). */
export const MATCH_MEDIA = new InjectionToken<MatchMedia | null>('MATCH_MEDIA', {
  providedIn: 'root',
  factory: () => (typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia.bind(globalThis) : null),
});

/** Which home-screen layout fits the current viewport; updates live on resize and rotation. */
@Service()
export class LayoutMode {
  private readonly matchMedia = inject(MATCH_MEDIA);
  private readonly desktop = this.matchMedia?.(DESKTOP_QUERY) ?? null;
  private readonly tablet = this.matchMedia?.(TABLET_QUERY) ?? null;
  private readonly current = signal<HomeLayout>(this.evaluate());

  readonly layout = this.current.asReadonly();

  constructor() {
    const update = () => this.current.set(this.evaluate());
    this.desktop?.addEventListener('change', update);
    this.tablet?.addEventListener('change', update);
  }

  private evaluate(): HomeLayout {
    if (this.desktop?.matches) {
      return 'desktop';
    }
    return this.tablet?.matches ? 'tablet' : 'phone';
  }
}
