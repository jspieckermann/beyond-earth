import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SKY_MODULES } from './data/modules';
import { ModulePreview } from './module-preview';

describe('ModulePreview', () => {
  async function render(explored: boolean) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ModulePreview);
    fixture.componentRef.setInput('module', SKY_MODULES.find((m) => m.slug === 'sterne-zaehlen'));
    fixture.componentRef.setInput('explored', explored);
    fixture.componentRef.setInput('x', 30);
    fixture.componentRef.setInput('y', 200);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows "Schon vertieft" for an explored module', async () => {
    const el = await render(true);
    expect(el.textContent).toContain('Schon vertieft');
  });

  it('shows "Noch nicht vertieft" otherwise, with title, line and position', async () => {
    const el = await render(false);
    expect(el.textContent).toContain('Noch nicht vertieft');
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Sterne zählen');
    expect(el.textContent).toContain('Eins. Zwei. Drei.');
    expect(el.style.left).toBe('30px');
    expect(el.style.top).toBe('200px');
  });

  it('is a labelled region whose "Eintauchen" link opens the module', async () => {
    const el = await render(false);
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-labelledby')).toBe('module-preview-title');
    expect(el.querySelector('h2')?.id).toBe('module-preview-title');
    const link = el.querySelector('a');
    expect(link?.textContent).toContain('Eintauchen');
    expect(link?.getAttribute('href')).toBe('/module/sterne-zaehlen');
  });
});
