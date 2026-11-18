import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  async function render(heading: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PlaceholderPage);
    fixture.componentRef.setInput('heading', heading);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('names the destination and says it is coming soon', async () => {
    const el = await render('Das Unsichtbare');
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Das Unsichtbare');
    expect(el.textContent).toContain('Bald verfügbar');
  });

  it('links back to the home screen', async () => {
    const el = await render('Heute Nacht');
    const back = el.querySelector('a');
    expect(back?.getAttribute('href')).toBe('/');
    expect(back?.textContent).toContain('Zurück zum Himmel');
  });

  it('moves focus to the heading', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PlaceholderPage);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('heading', 'Einstellungen');
    await fixture.whenStable();
    expect(document.activeElement?.textContent?.trim()).toBe('Einstellungen');
    fixture.nativeElement.remove();
  });
});
