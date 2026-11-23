import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FactSheet } from './fact-sheet';

describe('FactSheet', () => {
  async function render(showCredits: boolean) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(FactSheet);
    fixture.componentRef.setInput('content', {
      kicker: 'Die ganze Milchstrasse',
      facts: ['Durchmesser ca. 100.000 Lichtjahre'],
      sources: [{ kind: 'Rekonstruktion', source: 'NASA/JPL-Caltech/ESO/R. Hurt' }],
      branches: [{ label: 'Mit Lichtgeschwindigkeit weiterreisen', slug: 'lichtgeschwindigkeit', queryParams: { ziel: 'proxima' } }],
    });
    fixture.componentRef.setInput('showCredits', showCredits);
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
    return { fixture, el };
  }

  afterEach(() => document.body.replaceChildren());

  it('lists facts, sources and branches and takes focus', async () => {
    const { el } = await render(true);
    expect(el.textContent).toContain('Durchmesser ca. 100.000 Lichtjahre');
    expect(el.textContent).toContain('Rekonstruktion: NASA/JPL-Caltech/ESO/R. Hurt');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/module/lichtgeschwindigkeit?ziel=proxima');
    expect(document.activeElement?.textContent).toBe('Wie genau weiss man das?');
  });

  it('reports the credits button, its close button and Escape', async () => {
    const { fixture, el } = await render(true);
    const closed = vi.fn();
    const credits = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentInstance.credits.subscribe(credits);
    el.querySelector<HTMLButtonElement>('.credits')?.click();
    el.querySelector<HTMLButtonElement>('.close')?.click();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(credits).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(2);
  });

  it('leaves out the credits button when not wanted', async () => {
    const { el } = await render(false);
    expect(el.querySelector('.credits')).toBeNull();
  });
});
