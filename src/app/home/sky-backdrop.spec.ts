import { TestBed } from '@angular/core/testing';
import { SkyBackdrop } from './sky-backdrop';

describe('SkyBackdrop', () => {
  async function render() {
    const fixture = TestBed.createComponent(SkyBackdrop);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('is hidden from assistive technology', async () => {
    const el = await render();
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the band layers including the dust lane', async () => {
    const el = await render();
    for (const layer of ['glow', 'mid', 'core', 'dust']) {
      expect(el.querySelector(`.band.${layer}`)).not.toBeNull();
    }
  });

  it('renders the background field and the band star cloud', async () => {
    const el = await render();
    expect(el.querySelectorAll('pattern circle').length).toBe(150);
    expect(el.querySelectorAll('.cloud circle').length).toBeGreaterThan(100);
  });

  it('leaves the band to the constellation on wide layouts', async () => {
    const fixture = TestBed.createComponent(SkyBackdrop);
    fixture.componentRef.setInput('band', false);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.band')).toBeNull();
    expect(el.querySelectorAll('pattern circle').length).toBe(150);
  });

  it('contains no focusable or text content', async () => {
    const el = await render();
    expect(el.querySelector('a, button, [tabindex]')).toBeNull();
    expect(el.textContent?.trim()).toBe('');
  });
});
