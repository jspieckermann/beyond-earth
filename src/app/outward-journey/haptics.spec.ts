import { TestBed } from '@angular/core/testing';
import { JourneySettings } from '../core/journey-settings';
import { Haptics, PULSE_MS } from './haptics';

describe('Haptics', () => {
  const vibrate = vi.fn();
  beforeEach(() => {
    localStorage.clear();
    vibrate.mockReset();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });
  });
  afterEach(() => Reflect.deleteProperty(navigator, 'vibrate'));

  it('gives exactly one short pulse per snap', () => {
    TestBed.inject(Haptics).pulse();
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(PULSE_MS);
  });

  it('stays still when vibration is off', () => {
    TestBed.inject(JourneySettings).set('vibration', false);
    TestBed.inject(Haptics).pulse();
    expect(vibrate).not.toHaveBeenCalled();
  });
});
