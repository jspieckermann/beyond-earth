import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ExplorationProgress } from '../core/exploration-progress';
import { ModuleConstellation } from './module-constellation';

describe('ModuleConstellation', () => {
  let fixture: ComponentFixture<ModuleConstellation>;
  let el: HTMLElement;

  async function render(explored: string[] = []) {
    localStorage.setItem('be.explored.v2', JSON.stringify(explored));
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ModuleConstellation);
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  }

  const star = (id: string) => el.querySelector<HTMLButtonElement>(`button[data-module="${id}"]`);
  const click = async (id: string) => {
    star(id)?.click();
    await fixture.whenStable();
  };

  afterEach(() => {
    el.remove();
    localStorage.clear();
  });

  it('renders six stars in journey order with full-title accessible names and short labels', async () => {
    await render();
    const buttons = [...el.querySelectorAll('button.star')];
    expect(buttons.map((b) => b.getAttribute('data-module'))).toEqual(['A', 'B', 'D', 'C', 'F', 'E']);
    expect(star('B')?.getAttribute('aria-label')).toBe('Reisen mit Lichtgeschwindigkeit');
    const labels = [...el.querySelectorAll('.label')].map((l) => l.textContent?.trim());
    expect(labels).toContain('Lichtgeschwindigkeit');
    expect(labels).toHaveLength(6);
  });

  describe('clickable labels', () => {
    const label = (id: string) => star(id)?.querySelector<HTMLElement>('.label');

    it('puts each label inside its star control, keeping one control per module', async () => {
      await render();
      expect(el.querySelectorAll('button.star')).toHaveLength(6);
      expect(label('B')?.textContent?.trim()).toBe('Lichtgeschwindigkeit');
      expect(star('B')?.getAttribute('aria-label')).toBe('Reisen mit Lichtgeschwindigkeit');
    });

    it('selects the module when its label is clicked', async () => {
      await render();
      label('D')?.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.selected()).toBe('D');
      expect(el.querySelector('app-module-preview')?.textContent).toContain('Sterne zählen');
    });

    it('closes the preview when the label is clicked again (wide layout)', async () => {
      await render();
      fixture.componentRef.setInput('layout', 'desktop');
      await fixture.whenStable();
      label('D')?.click();
      await fixture.whenStable();
      label('D')?.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.selected()).toBeNull();
    });

    it('anchors left-side labels from the right so the star stays in place', async () => {
      await render();
      expect(star('F')?.classList).toContain('left');
      // F (Das Unsichtbare) sits at x = 319 of 390: anchored 100 % − 81.79 % from the right.
      expect(parseFloat((star('F')?.style.right ?? '').replace('calc(', ''))).toBeCloseTo(100 - (319 / 390) * 100, 2);
      expect(star('F')?.style.left).toBe('');
      expect(parseFloat(star('A')?.style.left ?? '')).toBeCloseTo((43 / 390) * 100, 2);
    });

    it('keeps hiding the label of the selected module on the phone layout', async () => {
      await render();
      label('B')?.click();
      await fixture.whenStable();
      expect(label('B')?.hidden).toBe(true);
    });
  });

  it('shows explored modules brighter and others faint', async () => {
    await render(['B']);
    expect(star('B')?.classList).toContain('explored');
    expect(star('A')?.classList).not.toContain('explored');
    expect(TestBed.inject(ExplorationProgress).isExplored('B')).toBe(true);
  });

  it('opens a preview for the selected star', async () => {
    await render(['B']);
    await click('B');
    expect(fixture.componentInstance.selected()).toBe('B');
    expect(star('B')?.getAttribute('aria-expanded')).toBe('true');
    expect(star('B')?.getAttribute('aria-controls')).toBe('module-preview');
    const preview = el.querySelector('app-module-preview');
    expect(preview?.textContent).toContain('Schon vertieft');
    expect(preview?.textContent).toContain('Reisen mit Lichtgeschwindigkeit');
    expect(preview?.textContent).toContain('Eintauchen');
  });

  it('switches the selection to another star', async () => {
    await render();
    await click('B');
    await click('D');
    expect(el.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
    expect(el.querySelector('app-module-preview')?.textContent).toContain('Sterne zählen');
    expect(el.querySelector('app-module-preview')?.textContent).toContain('Noch nicht vertieft');
  });

  it('closes when the selected star is activated again', async () => {
    await render();
    await click('B');
    await click('B');
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(el.querySelector('app-module-preview')).toBeNull();
    expect(star('B')?.getAttribute('aria-controls')).toBeNull();
  });

  it('closes on Escape and returns focus to the star', async () => {
    await render();
    await click('C');
    el.querySelector<HTMLAnchorElement>('app-module-preview a')?.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBeNull();
    expect(document.activeElement).toBe(star('C'));
  });

  it('ignores Escape when nothing is selected', async () => {
    await render();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.selected()).toBeNull();
  });

  it('hides the label of the selected star while its preview shows the title', async () => {
    await render();
    await click('F');
    const hidden = [...el.querySelectorAll<HTMLElement>('.label')].filter((l) => l.hidden);
    expect(hidden.map((l) => l.textContent?.trim())).toEqual(['Das Unsichtbare']);
  });

  describe('wide layouts', () => {
    async function renderWide(layout: 'tablet' | 'desktop', width: number, height: number) {
      await render(['B']);
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
      Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
      fixture.componentRef.setInput('layout', layout);
      window.dispatchEvent(new Event('resize'));
      await fixture.whenStable();
    }

    it('draws the band and spreads the stars over the region', async () => {
      await renderWide('desktop', 950, 900);
      expect(el.classList).toContain('wide');
      expect(el.querySelectorAll('.band .layer')).toHaveLength(4);
      expect(el.querySelectorAll('.cloud circle').length).toBeGreaterThan(100);
      expect(star('A')?.style.left).toBe('9%');
      expect(star('E')?.style.top).toBe('26%');
    });

    it('keeps the label of the selected star visible', async () => {
      await renderWide('tablet', 834, 738);
      await click('F');
      const hidden = [...el.querySelectorAll<HTMLElement>('.label')].filter((l) => l.hidden);
      expect(hidden).toEqual([]);
      expect(el.querySelector('.label.selected')?.textContent?.trim()).toBe('Das Unsichtbare');
    });

    it('opens the preview at the fixed spot, joined to the star by a line', async () => {
      await renderWide('desktop', 950, 900);
      await click('B');
      const preview = el.querySelector<HTMLElement>('app-module-preview');
      expect(preview?.classList).toContain('wide');
      expect(preview?.style.left).toBe('570px');
      expect(preview?.style.top).toBe('589.5px');
      const line = el.querySelector('.connector line');
      expect(line?.getAttribute('x2')).toBe('570');

      await click('E');
      expect(el.querySelector<HTMLElement>('app-module-preview')?.style.left).toBe('570px');
      expect(el.querySelector('.connector line')?.getAttribute('y2')).toBe('589.5');
    });

    it('shows no connector without a selection', async () => {
      await renderWide('desktop', 950, 900);
      expect(el.querySelector('.connector')).toBeNull();
    });
  });

  it('places the preview using the measured stage width', async () => {
    await render();
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 320 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 492 });
    await click('E');
    const preview = el.querySelector<HTMLElement>('app-module-preview');
    const left = parseFloat(preview?.style.left ?? 'NaN');
    expect(left + 208).toBeLessThanOrEqual(320 - 16);
  });
});
