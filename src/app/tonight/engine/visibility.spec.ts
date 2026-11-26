import { DarknessLevel } from '../../core/models';
import { OBJECTS, ObjectId, SkyObject } from '../data/objects';
import { Moment, momentsFor } from './moments';
import { NightPlace, nightFor } from './night';
import { NightSky, highlightFor, listFor, milkyWayTonight } from './visibility';
import { addDays } from './time';

const HAMBURG: NightPlace = { lat: 53.55, lon: 9.99, tz: 'Europe/Berlin' };
const MADRID: NightPlace = { lat: 40.42, lon: -3.7, tz: 'Europe/Madrid' };
const evening = (year: number, month: number, day: number) => ({ year, month, day });
const object = (id: ObjectId) => OBJECTS.find((o) => o.id === id) as SkyObject;

function setUp(darkness: DarknessLevel, day = evening(2026, 11, 26), place = HAMBURG) {
  const night = nightFor(place, day);
  const sky = new NightSky(place, night, darkness);
  const moments = momentsFor(night, place.tz);
  const at = (id: Moment['id']) => moments.find((m) => m.id === id) as Moment;
  return { night, sky, moments, at };
}

describe('Hamburg on 26 November 2026, darkness 2', () => {
  const { sky, moments, at } = setUp(2);

  it('shows the Moon, Saturn, the Plejaden and bright stars in the evening, Saturn in the south', () => {
    const list = listFor(sky, at('abends'));
    const ids = list.visible.map((v) => v.id);
    expect(ids[0]).toBe('mond');
    expect(ids).toEqual(expect.arrayContaining(['saturn', 'plejaden', 'kapella', 'kassiopeia', 'sommerdreieck']));
    const saturn = list.visible.find((v) => v.id === 'saturn');
    expect(saturn?.position).toBe('Süden · Vier Fäuste hoch');
    expect(saturn?.ease).toBe('leicht');
    expect(saturn?.steps?.[0]).toBe('Dreh dich nach Süden.');
    expect(saturn?.steps?.[1]).toMatch(/^Vier Fäuste hoch steht ein gelblicher Punkt/);
    expect(saturn?.eye).toContain('Den Ring siehst du erst in einem kleinen Teleskop.');
    expect(saturn?.span).toBe('bis 1:30 Uhr');
    expect(list.moonDisturbs).toBe(true);
  });

  it('orders by ease, then brightness', () => {
    const list = listFor(sky, at('abends'));
    const order = ['sofort', 'leicht', 'uebung'];
    const eases = list.visible.map((v) => order.indexOf(v.ease));
    expect([...eases].sort((a, b) => a - b)).toEqual(eases);
  });

  it('hides the Milky Way and Andromeda behind the bright place and Moon, and names when Orion is high enough', () => {
    const hidden = listFor(sky, at('abends')).hidden;
    const mw = hidden.find((h) => h.id === 'milchstrasse');
    expect(mw?.reason).toBe('Dein Ort ist zu hell.');
    expect(mw?.detail).toBe('Dafür braucht es Dunkelheit 3 von 5.');
    const orion = hidden.find((h) => h.id === 'orion');
    expect(orion?.reason).toMatch(/^(Zu tief am Horizont|Noch nicht aufgegangen)\.$/);
    expect(orion?.detail).toMatch(/\d+(:\d\d)? Uhr/);
  });

  it('merges Jupiter and Mars at midnight and moves the Sommerdreieck to the hidden list as too low', () => {
    const list = listFor(sky, at('mitternacht'));
    const ids = list.visible.map((v) => v.id);
    const hidden = list.hidden.find((h) => h.id === 'sommerdreieck');
    expect(hidden?.reason).toBe('Zu tief am Horizont.');
    expect(ids).not.toContain('sommerdreieck');
    const pair = list.visible.find((v) => v.id === 'jupiter+mars' || v.id === 'jupiter');
    expect(pair).toBeDefined();
  });

  it('puts Jupiter and Mars on one card in the morning, with the photo of both', () => {
    const list = listFor(sky, at('morgens'));
    const pair = list.visible.find((v) => v.id === 'jupiter+mars');
    expect(pair?.name).toBe('Jupiter und Mars');
    expect(pair?.kind).toBe('zwei Planeten nebeneinander');
    expect(pair?.eyeView.picture.id).toBe('eye-jupiter-mars');
    expect(pair?.steps?.[2]).toMatch(/daneben ein schwächerer, rötlicher Punkt: Mars\.$/);
    expect(list.visible.map((v) => v.id)).toContain('venus');
    expect(list.hidden.find((h) => h.id === 'saturn')?.reason).toBe('Schon untergegangen.');
  });

  it('shows Kassiopeia overhead with the overhead step', () => {
    const k = listFor(sky, at('abends')).visible.find((v) => v.id === 'kassiopeia');
    expect(k?.position).toBe('Fast genau über dir');
    expect(k?.steps?.[0]).toBe('Leg den Kopf in den Nacken: fast genau über dir.');
  });

  it('chooses Saturn as the evening highlight and knows the Milky Way is not visible tonight', () => {
    expect(milkyWayTonight(sky, moments)).toBe(false);
    expect(highlightFor(sky, moments, at('abends'))).toEqual({ id: 'saturn', name: 'Saturn', direction: 'Süden' });
    expect(highlightFor(sky, moments, at('morgens'))?.id).toBe('venus');
  });

  it('lists no object that stays below the horizon all night', () => {
    const all = moments.flatMap((m) => listFor(sky, m).hidden.map((h) => h.id));
    for (const id of all) {
      if (id !== 'milchstrasse') {
        expect(sky.upTonight(object(id))).toBe(true);
      }
    }
  });
});

describe('a darker place', () => {
  it('hides Kassiopeia at level 1 because the place is too bright', () => {
    const { sky, at } = setUp(1);
    const k = listFor(sky, at('abends')).hidden.find((h) => h.id === 'kassiopeia');
    expect(k?.reason).toBe('Dein Ort ist zu hell.');
  });

  it('lets the Moon hide the Milky Way at level 4 on a moonlit evening', () => {
    const { sky, at } = setUp(4);
    const mw = listFor(sky, at('abends')).hidden.find((h) => h.id === 'milchstrasse');
    expect(mw?.reason).toBe('Der fast volle Mond überstrahlt sie.');
  });

  it('puts the Milky Way first on a moonless night at level 4, with a route to the band', () => {
    const { sky, moments, at } = setUp(4, evening(2026, 12, 9));
    const list = listFor(sky, at('abends'));
    expect(list.visible[0].id).toBe('milchstrasse');
    expect(list.visible[0].steps?.join(' ')).toContain('Folge dem Band nach oben.');
    expect(list.visible[0].eye).toContain('von Horizont zu Horizont');
    expect(highlightFor(sky, moments, at('abends'))?.id).toBe('milchstrasse');
  });
});

describe('outside Central Europe', () => {
  it('shows positions but no steps', () => {
    const { sky, at } = setUp(2, evening(2026, 11, 26), MADRID);
    const list = listFor(sky, at('abends'));
    expect(list.visible.length).toBeGreaterThan(0);
    expect(list.visible.every((v) => v.steps === null)).toBe(true);
  });
});

describe('year-round coverage', () => {
  for (const lat of [45, 50, 56]) {
    it(`shows at least five objects at some moment of every night at ${lat}° North, darkness 2`, () => {
      const place: NightPlace = { lat, lon: 10, tz: 'Europe/Berlin' };
      let day = evening(2026, 1, 1);
      // Every fourth night keeps the test fast; the Moon's cycle and the seasons are covered.
      for (let i = 0; i < 365; i += 4) {
        const night = nightFor(place, day);
        const sky = new NightSky(place, night, 2);
        const best = Math.max(...momentsFor(night, place.tz).map((m) => listFor(sky, m).visible.length));
        expect(best, `${lat}° on day ${i}`).toBeGreaterThanOrEqual(5);
        day = addDays(day, 4);
      }
    });
  }
});
