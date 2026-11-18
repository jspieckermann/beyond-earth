import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeActions } from './home-actions';

describe('HomeActions', () => {
  async function render(count: number) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HomeActions);
    fixture.componentRef.setInput('momentsCount', count);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows only "Die Reise", full width, when nothing is saved', async () => {
    const el = await render(0);
    const links = [...el.querySelectorAll('a')];
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain('Die Reise');
    expect(links[0].getAttribute('href')).toBe('/reise');
    expect(el.classList).not.toContain('two');
  });

  it('can stack the actions for the tablet layout', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HomeActions);
    fixture.componentRef.setInput('stacked', true);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('stacked');
  });

  it('shows "Meine Sterne" with the count when moments are saved', async () => {
    const el = await render(2);
    const moments = el.querySelectorAll('a')[1];
    expect(el.classList).toContain('two');
    expect(moments.textContent).toContain('Meine Sterne');
    expect(moments.querySelector('.badge')?.textContent).toContain('2');
    expect(moments.textContent).toContain('gespeicherte Momente');
    expect(moments.getAttribute('href')).toBe('/meine-sterne');
  });
});
