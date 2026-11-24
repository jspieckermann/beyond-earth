import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExplorationProgress } from '../core/exploration-progress';
import { Haptics } from '../core/haptics';
import { JourneyTestOptions, journeyTestProviders } from '../outward-journey/testing';
import { GalacticYear } from './galactic-year';

describe('GalacticYear', { timeout: 30_000 }, () => {
  let fixture: ComponentFixture<GalacticYear>;
  let el: HTMLElement;
  let pulse: ReturnType<typeof vi.fn<() => void>>;
  /** With fake timers, Angular's scheduler never runs by itself: advance the timers and detect changes instead. */
  let fake = false;

  async function stable() {
    if (fake) {
      await vi.advanceTimersByTimeAsync(20);
      fixture.detectChanges();
    } else {
      await fixture.whenStable();
    }
  }

  async function render(
    inputs: Record<string, unknown> = {},
    options: JourneyTestOptions & { fakeTimers?: boolean } = {},
  ) {
    fake = !!options.fakeTimers;
    if (fake) {
      vi.useFakeTimers({ now: Date.UTC(2026, 6, 1) });
    }
    const providers = journeyTestProviders({ reducedMotion: true, now: new Date(Date.UTC(2026, 6, 1)), ...options });
    TestBed.configureTestingModule({ providers });
    pulse = vi.fn<() => void>();
    TestBed.inject(Haptics).pulse = pulse;
    fixture = TestBed.createComponent(GalacticYear);
    for (const [k, v] of Object.entries(inputs)) {
      fixture.componentRef.setInput(k, v);
    }
    el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await stable();
  }

  const text = () => el.textContent?.replace(/\s+/g, ' ') ?? '';
  const button = (name: string) =>
    [...el.querySelectorAll<HTMLElement>('button, a')].find((b) =>
      (b.getAttribute('aria-label') ?? b.textContent ?? '').replace(/\s+/g, ' ').trim().startsWith(name),
    ) as HTMLElement;
  const factsButton = (part: string) => el.querySelector(`section[aria-labelledby="part-${part}"] .links button:last-child`) as HTMLButtonElement;
  const live = () => el.querySelector('[aria-live="polite"]')?.textContent ?? '';
  const slider = () => el.querySelector<HTMLInputElement>('#time-slider') as HTMLInputElement;
  const time = () => el.querySelector('.time-row .big')?.textContent;

  async function click(name: string) {
    button(name).click();
    await stable();
  }

  async function slide(value: number, release = true) {
    slider().value = String(value);
    slider().dispatchEvent(new Event('input'));
    if (release) {
      slider().dispatchEvent(new Event('change'));
    }
    await stable();
  }

  async function press(key: string) {
    slider().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await stable();
  }

  afterEach(() => {
    vi.useRealTimers();
    el?.remove();
    document.body.replaceChildren();
    localStorage.clear();
  });

  it('shows one round and turning back on one page, with focus on its heading and a way back', async () => {
    await render();
    expect(document.activeElement?.textContent).toBe('Das galaktische Jahr');
    expect(el.querySelector('a[aria-label="Zurück zum Himmel"]')?.getAttribute('href')).toBe('/');
    expect([...el.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(['Eine Runde', 'Zurückdrehen']);
    expect(text()).not.toContain('Spüren');
    expect(text()).not.toContain('Seit du hier bist');
    // One round is the Solar System's way around the centre, at about 230 km per second.
    expect(text()).toContain('Die Sonne zieht mit allen Planeten um das Zentrum der Milchstrasse. Für eine Runde braucht sie 230 Millionen Jahre.');
    expect(text()).toContain('ist der Weg unseres ganzen Sonnensystems einmal um das Zentrum der Milchstrasse');
    expect(text()).toContain('230 Kilometern pro Sekunde: in einer Sekunde fast von Hamburg nach Berlin, Luftlinie.');
    expect(text()).not.toContain('Neptun');
    expect(time()).toBe('heute');
    expect(el.querySelector('.orbit')).not.toBeNull();
    expect(el.querySelector('.arrow')).not.toBeNull();
    expect(el.querySelector('app-galaxy-view .picture')?.getAttribute('aria-label')).toContain('Pfeil');
    expect(text()).not.toContain('Orion-Arm');
  });

  it('changes nothing by itself', async () => {
    await render({}, { fakeTimers: true });
    await vi.advanceTimersByTimeAsync(120_000);
    await stable();
    expect(time()).toBe('heute');
    expect(live()).toBe('');
  });

  it('follows the slider at once but settles, announces and draws the Earth only on release', async () => {
    await render();
    expect(slider().getAttribute('aria-valuetext')).toBe('heute');
    // The first 5 rounds fill 700 of the 1000 steps: 132 steps are 0,94 rounds back.
    await slide(132, false);
    expect(time()).toBe('vor 217 Mio. Jahren');
    expect(el.querySelector('.arrow')).toBeNull();
    expect(live()).toBe('');
    // While moving: the closest station's title, sentence and caption stay visible, the Earth blends; nothing is announced.
    expect(el.querySelector('.event')?.textContent).toBe('Pangäa und die ersten Dinosaurier');
    expect(el.querySelectorAll('app-earth-globe path.land')).toHaveLength(2);
    expect(text()).toContain('Als die Sonne das letzte Mal an dieser Stelle war');
    expect(el.querySelector('.hidden')).toBeNull();
    expect(text()).not.toContain('Leben:');
    expect(el.querySelector('app-earth-globe svg')?.getAttribute('aria-label')).toBe('Die Erde vor 217 Millionen Jahren');
    await slide(132);
    expect(time()).toBe('vor 230 Mio. Jahren');
    expect(text()).toContain('Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.');
    expect(text()).toContain('Die Erde damals: Ein einziger grosser Kontinent, Pangäa. Die ersten Dinosaurier.');
    expect(el.querySelector('app-earth-globe svg')?.getAttribute('aria-label')).toContain('Pangäa');
    expect(live()).toBe('vor 230 Millionen Jahren. Als die Sonne das letzte Mal an dieser Stelle war, gingen die ersten Dinosaurier über die Erde.');
    expect(el.querySelectorAll('.ring')).toHaveLength(19);
    expect(el.querySelector('.arc')).toBeNull();
  });

  it('steps through all stations with the arrows, main stations with the page keys, and pulses only at full rounds', async () => {
    await render();
    await press('ArrowRight');
    expect(time()).toBe('vor 6 Mio. Jahren');
    expect(text()).toContain('In Afrika richten sich die ersten Vormenschen auf.');
    expect(el.querySelector('.event')?.textContent).toBe('Die ersten Vormenschen');
    await press('ArrowRight');
    expect(time()).toBe('vor 34 Mio. Jahren');
    await press('PageUp');
    expect(time()).toBe('vor 66 Mio. Jahren');
    expect(pulse).not.toHaveBeenCalled();
    await press('PageUp');
    expect(time()).toBe('vor 115 Mio. Jahren');
    expect(el.querySelector('.arc')?.getAttribute('d')).toMatch(/^M /);
    expect(pulse).not.toHaveBeenCalled();
    await press('PageUp');
    await press('PageUp');
    expect(time()).toBe('vor 460 Mio. Jahren');
    expect(pulse).toHaveBeenCalledTimes(2);
    await press('ArrowLeft');
    expect(time()).toBe('vor 445 Mio. Jahren');
    await press('PageDown');
    expect(time()).toBe('vor 230 Mio. Jahren');
    await press('PageUp');
    await press('PageUp');
    await press('PageUp');
    await press('PageUp');
    expect(time()).toBe('vor 3,7 Mrd. Jahren');
    await press('PageUp');
    expect(time()).toBe('vor 4,6 Mrd. Jahren');
    await press('PageDown');
    expect(time()).toBe('vor 3,7 Mrd. Jahren');
    await press('End');
    expect(text()).toContain('Zwanzig Runden. Weiter zurück gibt es uns nicht.');
    await press('Home');
    expect(time()).toBe('heute');
    await press('a');
    expect(time()).toBe('heute');
  });

  it('draws one ring per round the Sun had completed at that time: about 20 today, fewer further back', async () => {
    await render();
    await slide(420);
    expect(text()).toContain('Drei Runden zurück: eine weisse Kugel aus Eis.');
    expect(el.querySelectorAll('.ring')).toHaveLength(17);
    expect(text()).toContain('3 Runden zurück');
    expect(text()).toContain('Bis dahin: 17 Runden um das Zentrum');
    await press('PageDown');
    expect(time()).toBe('vor 460 Mio. Jahren');
    expect(el.querySelectorAll('.ring')).toHaveLength(18);
    await press('ArrowLeft');
    expect(time()).toBe('vor 445 Mio. Jahren');
    expect(el.querySelectorAll('.ring')).toHaveLength(18);
    await press('Home');
    expect(time()).toBe('heute');
    expect(el.querySelectorAll('.ring')).toHaveLength(20);
    expect(text()).toContain('Bis heute: rund 20 Runden um das Zentrum');
  });

  it('highlights the station the Sun will snap to while the slider moves', async () => {
    await render({}, { reducedMotion: false, fakeTimers: true });
    const marked = () => [...el.querySelectorAll('.ruler .dot')].findIndex((d) => d.classList.contains('now'));
    expect(marked()).toBe(0);
    // 0,94 rounds back without letting go: the closest station is one round back (index 7).
    await slide(132, false);
    expect(marked()).toBe(7);
    expect(el.querySelectorAll('.ruler .dot.now')).toHaveLength(1);
    // Further on, the target moves along: 1,14 rounds back is closest to "Das grosse Sterben" (index 8).
    await slide(160, false);
    expect(marked()).toBe(8);
    // Let go: the Sun glides there, and the target stays highlighted throughout.
    slider().dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(marked()).toBe(8);
    await vi.advanceTimersByTimeAsync(1000);
    await stable();
    expect(marked()).toBe(8);
    expect(time()).toBe('vor 252 Mio. Jahren');
  });

  it('turns the Sun back by dragging and snaps on release', async () => {
    await render();
    const view = el.querySelector('app-galaxy-view') as HTMLElement;
    const picture = view.querySelector('.picture') as HTMLElement;
    picture.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) });
    const handle = view.querySelector('.handle') as HTMLElement;
    const pointer = (type: string, x: number, y: number) =>
      handle.dispatchEvent(Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX: x, clientY: y, pointerId: 1 }));
    pointer('pointermove', 80, 50);
    await stable();
    expect(time()).toBe('heute');
    pointer('pointerdown', 50, 69);
    // A pointer to the right of the centre: a quarter round back, then above the centre: half a round.
    pointer('pointermove', 80, 50);
    pointer('pointermove', 70, 25);
    pointer('pointermove', 50, 20);
    await stable();
    expect(time()).toBe('vor 115 Mio. Jahren');
    pointer('pointerup', 50, 20);
    await stable();
    expect(text()).toContain('Auf der anderen Seite der Galaxie: Die Erde beginnt zu blühen.');
    pointer('pointerup', 50, 20);
  });

  it('glides to a station without reduced motion', async () => {
    await render({}, { reducedMotion: false, fakeTimers: true });
    await slide(73);
    expect(time()).not.toBe('vor 115 Mio. Jahren');
    await vi.advanceTimersByTimeAsync(1000);
    await stable();
    expect(time()).toBe('vor 115 Mio. Jahren');
    await slide(1, false);
    expect(time()).toBe('vor 2 Mio. Jahren');
  });

  it('marks the module explored once the Sun is turned back a full round', async () => {
    await render();
    await press('PageUp');
    await press('PageUp');
    await press('ArrowRight');
    await press('ArrowRight');
    expect(time()).toBe('vor 180 Mio. Jahren');
    expect(TestBed.inject(ExplorationProgress).isExplored('C')).toBe(false);
    await press('ArrowRight');
    expect(TestBed.inject(ExplorationProgress).isExplored('C')).toBe(true);
  });

  it('has no buttons under the slider: no magnifier, no way back to today, no sharing and no link to Modul A', async () => {
    await render();
    for (const name of ['Wo bleiben wir Menschen?', 'Zurück nach heute', 'Bild teilen', 'Zur Milchstrasse in Modul A']) {
      expect(button(name)).toBeUndefined();
    }
    await press('End');
    expect(button('Zurück nach heute')).toBeUndefined();
    expect(el.querySelector('app-magnifier')).toBeNull();
    expect(el.querySelector('app-share-card-dialog')).toBeNull();
    // The only controls in "Zurückdrehen" are the slider and the facts.
    expect([...el.querySelectorAll('section[aria-labelledby="part-zurueck"] button')].map((b) => b.textContent?.trim())).toEqual(['Wie genau weiss man das?']);
  });

  it('shows no distance since birth, also when a birth year is stored', async () => {
    localStorage.setItem('be.birthYear', '1996');
    await render();
    expect(text()).not.toContain('Seit deiner Geburt');
    expect(text()).not.toContain('galaktische Jahre alt.');
  });

  it('opens the facts of each part with the branch and returns focus to its opener', async () => {
    await render();
    factsButton('runde').click();
    await stable();
    const sheet = el.querySelector('app-fact-sheet') as HTMLElement;
    expect(sheet.textContent).toContain('210 bis 250 Millionen Jahre');
    expect(sheet.querySelector('a.branch')?.getAttribute('href')).toBe('/module/das-unsichtbare');
    (sheet.querySelector('button.close') as HTMLButtonElement).click();
    await stable();
    expect(el.querySelector('app-fact-sheet')).toBeNull();
    expect(document.activeElement).toBe(factsButton('runde'));
    factsButton('zurueck').click();
    await stable();
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('vereinfachte Zeichnung');
    (el.querySelector('app-fact-sheet button.close') as HTMLButtonElement).click();
    await stable();
    expect(document.activeElement).toBe(factsButton('zurueck'));
    factsButton('runde').click();
    await stable();
    expect(el.querySelector('app-fact-sheet')?.textContent).toContain('mit dem ganzen Sonnensystem, um das Zentrum der Milchstrasse');
  });

  it('runs the main journey with four stations and signals completion', async () => {
    await render({ variant: 'hauptreise' });
    const done = vi.fn();
    fixture.componentInstance.completed.subscribe(done);
    expect(slider().max).toBe('1000');
    expect([...el.querySelectorAll('.ruler .label')].map((s) => s.textContent)).toEqual(['heute', '1', '2', '3']);
    expect(el.querySelectorAll('.ruler .dot')).toHaveLength(4);
    await slide(400);
    expect(time()).toBe('vor 230 Mio. Jahren');
    factsButton('runde').click();
    await stable();
    expect(el.querySelector('app-fact-sheet a.branch')).toBeNull();
    (el.querySelector('app-fact-sheet button.close') as HTMLButtonElement).click();
    await stable();
    expect(text()).toContain('Und all das kannst du sehen. Heute Nacht, über dir.');
    await click('Weiter: Rausgehen');
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('shows one ray with the first 5 rounds stretched and every station as a dot at its true place', async () => {
    await render();
    expect(slider().max).toBe('1000');
    expect([...el.querySelectorAll('.ruler .label')].map((l) => l.textContent)).toEqual(['heute', '1', '2', '3', '4', '5', '10', '15', '20']);
    expect(el.querySelector('.ruler .label.strong')?.textContent).toBe('5');
    expect(el.querySelectorAll('.ruler .tick')).toHaveLength(36);
    expect(el.querySelectorAll('.ruler .tick.quarter')).toHaveLength(15);
    const dots = [...el.querySelectorAll<HTMLElement>('.ruler .dot')];
    expect(dots).toHaveLength(24);
    expect(dots.filter((d) => d.classList.contains('main'))).toHaveLength(9);
    // One round back is 14 % of the slider: the first 5 rounds fill 70 %.
    expect(dots[7].style.left).toBe('14%');
    expect(dots[23].style.left).toBe('100%');
    expect(dots[0].classList).toContain('now');
    await press('PageUp');
    expect(dots[0].classList).not.toContain('now');
    expect(el.querySelectorAll('.ruler .dot')[3].classList).toContain('now');
    expect(slider().value).toBe(String(Math.round((66 / 230 / 5) * 700)));
  });

  it('uses the wide picture and two columns on desktop', async () => {
    await render({}, { layout: 'desktop' });
    expect(el.getAttribute('data-layout')).toBe('desktop');
    expect(el.querySelector('app-galaxy-view img')?.getAttribute('src')).toContain('milky-way-1920');
  });
});
