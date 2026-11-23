import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZoomState } from '../engine/zoom-state';
import { DRAG_RATE, WHEEL_RATE, WHEEL_RELEASE_MS, ZoomInput, keyIntent } from './zoom-input';

@Component({
  imports: [ZoomInput],
  template: `<div appZoomInput class="scene"><button type="button">Mars</button></div>`,
})
class Host {}

function pointer(type: string, id: number, x: number, y: number): PointerEvent {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }) as unknown as PointerEvent;
  Object.defineProperty(event, 'pointerId', { value: id });
  return event;
}

describe('ZoomInput', () => {
  let zoom: { nudge: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };
  let scene: HTMLElement;

  beforeEach(async () => {
    zoom = { nudge: vi.fn(), release: vi.fn(), stop: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: ZoomState, useValue: zoom }] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    scene = (fixture.nativeElement as HTMLElement).querySelector('.scene') as HTMLElement;
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('zooms with the wheel and releases after a quiet moment', () => {
    scene.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }));
    scene.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }));
    expect(zoom.nudge).toHaveBeenCalledWith(100 * WHEEL_RATE);
    vi.advanceTimersByTime(WHEEL_RELEASE_MS - 1);
    expect(zoom.release).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(zoom.release).toHaveBeenCalledTimes(1);
  });

  it('scales line-based wheel deltas', () => {
    scene.dispatchEvent(new WheelEvent('wheel', { deltaY: 3, deltaMode: 1, cancelable: true }));
    expect(zoom.nudge).toHaveBeenCalledWith(48 * WHEEL_RATE);
  });

  it('zooms out when dragging up and snaps on release', () => {
    scene.dispatchEvent(pointer('pointerdown', 1, 100, 400));
    scene.dispatchEvent(pointer('pointermove', 1, 100, 350));
    expect(zoom.stop).toHaveBeenCalled();
    expect(zoom.nudge).toHaveBeenCalledWith(50 * DRAG_RATE);
    scene.dispatchEvent(pointer('pointerup', 1, 100, 350));
    expect(zoom.release).toHaveBeenCalledTimes(1);
  });

  it('zooms in when two fingers spread apart', () => {
    scene.dispatchEvent(pointer('pointerdown', 1, 100, 400));
    scene.dispatchEvent(pointer('pointerdown', 2, 200, 400));
    scene.dispatchEvent(pointer('pointermove', 2, 300, 400));
    const delta = zoom.nudge.mock.calls.at(-1)?.[0] as number;
    expect(delta).toBeLessThan(0);
    scene.dispatchEvent(pointer('pointerup', 2, 300, 400));
    expect(zoom.release).not.toHaveBeenCalled();
    scene.dispatchEvent(pointer('pointercancel', 1, 100, 400));
    expect(zoom.release).toHaveBeenCalledTimes(1);
  });

  it('leaves presses on controls alone', () => {
    const button = scene.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(pointer('pointerdown', 1, 10, 10));
    scene.dispatchEvent(pointer('pointermove', 1, 10, 0));
    expect(zoom.nudge).not.toHaveBeenCalled();
    scene.dispatchEvent(pointer('pointerup', 1, 10, 0));
    expect(zoom.release).not.toHaveBeenCalled();
  });
});

describe('keyIntent', () => {
  const key = (k: string, target?: HTMLElement, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key: k, ...init });
    if (target) {
      Object.defineProperty(event, 'target', { value: target });
    }
    return keyIntent(event);
  };

  it('maps keys to directions', () => {
    expect(key('ArrowUp')).toBe(1);
    expect(key('PageDown')).toBe(1);
    expect(key('+')).toBe(1);
    expect(key('ArrowDown')).toBe(-1);
    expect(key('PageUp')).toBe(-1);
    expect(key('-')).toBe(-1);
    expect(key('a')).toBeNull();
    expect(key('ArrowUp', undefined, { ctrlKey: true })).toBeNull();
  });

  it('ignores keys inside fields and on rotatable planets', () => {
    expect(key('ArrowUp', document.createElement('input'))).toBeNull();
    const planet = document.createElement('div');
    planet.setAttribute('data-rotatable', '');
    expect(key('ArrowUp', planet)).toBeNull();
  });
});
