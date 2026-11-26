import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarknessLevel, StoredPlace } from '../../core/models';
import { DarknessChoice } from './darkness-choice';
import { GEOLOCATE, roundPosition } from './geolocation';
import { PickedPlace, PlacePicker } from './place-picker';

const HAMBURG: StoredPlace = { name: 'Hamburg', region: 'Hamburg', lat: 53.55, lon: 9.99, tz: 'Europe/Berlin', source: 'list' };

describe('PlacePicker', () => {
  let fixture: ComponentFixture<PlacePicker>;
  let el: HTMLElement;
  let geolocate: ReturnType<typeof vi.fn>;
  let picked: PickedPlace[];

  async function render(options: { result?: () => Promise<{ lat: number; lon: number }>; selected?: StoredPlace; skippable?: boolean } = {}) {
    geolocate = vi.fn(options.result ?? (() => Promise.resolve({ lat: 53.5512, lon: 9.9937 })));
    picked = [];
    TestBed.configureTestingModule({ providers: [{ provide: GEOLOCATE, useValue: geolocate }] });
    fixture = TestBed.createComponent(PlacePicker);
    fixture.componentRef.setInput('selected', options.selected ?? null);
    fixture.componentRef.setInput('skippable', options.skippable ?? false);
    fixture.componentInstance.picked.subscribe((p) => picked.push(p));
    el = fixture.nativeElement as HTMLElement;
    document.body.append(el);
    await fixture.whenStable();
  }

  afterEach(() => {
    el.remove();
    localStorage.clear();
  });

  const input = () => el.querySelector('input') as HTMLInputElement;

  async function focus() {
    input().focus();
    await fixture.whenStable();
  }

  async function type(text: string) {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function press(key: string) {
    input().dispatchEvent(new KeyboardEvent('keydown', { key }));
    await fixture.whenStable();
  }

  const button = (text: string) => [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(text)) as HTMLButtonElement;
  const options = () => [...el.querySelectorAll<HTMLElement>('[role="option"]')];
  const names = () => options().map((o) => o.querySelector('.name')?.textContent);
  const option = (name: string) => options().find((o) => o.querySelector('.name')?.textContent === name) as HTMLElement;

  it('shows the chosen place in the field, closed, with its region below', async () => {
    await render({ selected: HAMBURG });
    expect(input().value).toBe('Hamburg');
    expect(input().getAttribute('role')).toBe('combobox');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(options()).toHaveLength(0);
    expect(el.querySelector('#place-note')?.textContent).toBe('Hamburg');
  });

  it('opens with the chosen place and two dark-sky places on focus', async () => {
    await render({ selected: HAMBURG });
    await focus();
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(names()[0]).toBe('Hamburg');
    expect(names().slice(1).every((n) => n?.startsWith('Sternenpark'))).toBe(true);
    expect(option('Hamburg').getAttribute('aria-selected')).toBe('true');
  });

  it('says that the place stays on the device while nothing is chosen', async () => {
    await render();
    expect(input().value).toBe('');
    expect(el.textContent).toContain('Der Ort bleibt nur auf diesem Gerät, auf ein paar Kilometer gerundet.');
  });

  it('suggests places with their region from two letters on', async () => {
    await render();
    await focus();
    await type('L');
    expect(options()).toHaveLength(0);
    await type('Lüne');
    expect(option('Lüneburg').textContent).toContain('Niedersachsen');
    expect(el.querySelector('[role="status"]')?.textContent).toMatch(/Vorschl/);
  });

  it('says so when nothing is found', async () => {
    await render();
    await focus();
    await type('Xyzzy');
    expect(el.textContent).toContain('Kein Ort gefunden.');
  });

  it('reports the chosen place with the suggested darkness and closes', async () => {
    await render();
    for (const [query, name] of [
      ['Lüne', 'Lüneburg'],
      ['Rhön', 'Sternenpark Rhön'],
      ['Hamburg', 'Hamburg'],
    ]) {
      await focus();
      await type(query);
      option(name).dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
      await fixture.whenStable();
    }
    expect(picked.map((p) => [p.place.name, p.suggestion])).toEqual([
      ['Lüneburg', 2],
      ['Sternenpark Rhön', 5],
      ['Hamburg', 1],
    ]);
    expect(picked[0].place.source).toBe('list');
    expect(options()).toHaveLength(0);
  });

  it('moves through the suggestions with the arrow keys and picks with Enter', async () => {
    await render();
    await focus();
    await type('Mün');
    await press('ArrowDown');
    expect(input().getAttribute('aria-activedescendant')).toBe('place-option-0');
    expect(options()[0].classList.contains('active')).toBe(true);
    await press('ArrowDown');
    await press('ArrowUp');
    expect(input().getAttribute('aria-activedescendant')).toBe('place-option-0');
    const first = names()[0];
    await press('Enter');
    expect(picked[0].place.name).toBe(first);
    expect(first).toBe('München');
  });

  it('closes with Escape and shows the chosen place again', async () => {
    await render({ selected: HAMBURG });
    await focus();
    await type('Mün');
    await press('Escape');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().value).toBe('Hamburg');
    expect(picked).toHaveLength(0);
  });

  it('clears the field with the clear button', async () => {
    await render({ selected: HAMBURG });
    const clear = el.querySelector('.clear') as HTMLButtonElement;
    expect(clear.getAttribute('aria-label')).toBe('Eingabe löschen');
    clear.click();
    await fixture.whenStable();
    expect(input().value).toBe('');
    expect(document.activeElement).toBe(input());
  });

  it('asks for the device location only on request, rounds it and suggests level 2', async () => {
    await render();
    expect(geolocate).not.toHaveBeenCalled();
    button('Meinen Standort verwenden').click();
    await fixture.whenStable();
    expect(geolocate).toHaveBeenCalledTimes(1);
    expect(picked[0].place).toMatchObject({ name: 'Dein Standort (Hamburg)', lat: 53.55, lon: 10, source: 'device' });
    expect(picked[0].suggestion).toBe(2);
  });

  it('stays calm when the location is refused', async () => {
    await render({ result: () => Promise.reject(new Error('denied')) });
    button('Meinen Standort verwenden').click();
    await fixture.whenStable();
    expect(el.textContent).toContain('Dein Standort ist gerade nicht verfügbar.');
    expect(input()).not.toBeNull();
    expect(picked).toHaveLength(0);
  });

  it('offers „Überspringen“ only when asked to', async () => {
    await render();
    expect(button('Überspringen')).toBeUndefined();
    el.remove();
    TestBed.resetTestingModule();
    await render({ skippable: true });
    let skipped = false;
    fixture.componentInstance.skipped.subscribe(() => (skipped = true));
    button('Überspringen').click();
    expect(skipped).toBe(true);
  });
});

describe('DarknessChoice', () => {
  async function render(value: DarknessLevel | null, hint: string | null = null) {
    const fixture = TestBed.createComponent(DarknessChoice);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('hint', hint);
    const el = fixture.nativeElement as HTMLElement;
    document.body.append(el);
    await fixture.whenStable();
    const combo = el.querySelector('[role="combobox"]') as HTMLButtonElement;
    const key = async (k: string) => {
      combo.dispatchEvent(new KeyboardEvent('keydown', { key: k, cancelable: true }));
      await fixture.whenStable();
    };
    return { fixture, el, combo, key };
  }

  afterEach(() => document.body.querySelectorAll('app-darkness-choice').forEach((e) => e.remove()));

  it('shows the chosen level with dots, name and sentence, and the hint', async () => {
    const { el, combo } = await render(1, 'Vorgeschlagen für eine Grossstadt.');
    expect(el.querySelector('.label')?.textContent).toBe('Wie dunkel ist es dort?');
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(combo.textContent).toContain('Mitten in der Stadt');
    expect(combo.textContent).toContain('Einige helle Sterne. Planeten und Mond gut.');
    expect(combo.querySelectorAll('.dot.on')).toHaveLength(1);
    expect(el.querySelector('.hint')?.textContent).toBe('Vorgeschlagen für eine Grossstadt.');
  });

  it('opens a list of five levels in the same form and picks one by pointer', async () => {
    const { fixture, el, combo } = await render(2);
    combo.click();
    await fixture.whenStable();
    const options = [...el.querySelectorAll<HTMLElement>('[role="option"]')];
    expect(options).toHaveLength(5);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[4].textContent).toContain('Sehr dunkel: Sternenpark, Gebirge, Insel');
    expect(options[3].textContent).toContain('Das Band deutlich, von Horizont zu Horizont.');
    options[3].dispatchEvent(new MouseEvent('mousedown', { cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe(4);
    expect(el.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it('works with the keyboard', async () => {
    const { fixture, combo, key } = await render(2);
    await key('ArrowDown');
    expect(combo.getAttribute('aria-expanded')).toBe('true');
    expect(combo.getAttribute('aria-activedescendant')).toBe('darkness-2');
    await key('ArrowDown');
    await key('ArrowDown');
    expect(combo.getAttribute('aria-activedescendant')).toBe('darkness-4');
    await key('End');
    expect(combo.getAttribute('aria-activedescendant')).toBe('darkness-5');
    await key('Home');
    await key('ArrowUp');
    expect(combo.getAttribute('aria-activedescendant')).toBe('darkness-1');
    await key('Escape');
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.value()).toBe(2);
    await key('Enter');
    await key('ArrowDown');
    await key('Enter');
    expect(fixture.componentInstance.value()).toBe(3);
    expect(combo.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('roundPosition', () => {
  it('rounds to 0,05°', () => {
    expect(roundPosition({ lat: 53.5512, lon: 9.9937 })).toEqual({ lat: 53.55, lon: 10 });
    expect(roundPosition({ lat: 48.1371, lon: 11.5754 })).toEqual({ lat: 48.15, lon: 11.6 });
  });
});
