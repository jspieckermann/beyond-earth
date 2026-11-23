import { DestroyRef, Directive, inject } from '@angular/core';
import { ZoomState } from '../engine/zoom-state';

/** Stages per wheel delta unit. */
export const WHEEL_RATE = 0.0025;
/** Stages per pixel of vertical drag (dragging up zooms out). */
export const DRAG_RATE = 0.008;
/** Stages per natural-log unit of pinch distance ratio (spreading zooms in). */
export const PINCH_RATE = 1.6;
/** Quiet time after the last wheel event that counts as letting go. */
export const WHEEL_RELEASE_MS = 240;

/**
 * Which way a key press moves the journey: +1 out, −1 in, or null for keys it does not handle.
 * Keys typed into fields, and arrow keys on a rotatable planet, are left alone.
 */
export function keyIntent(event: KeyboardEvent): 1 | -1 | null {
  const target = event.target;
  if (target instanceof HTMLElement && (target.closest('input, textarea, select, [contenteditable="true"]') || target.closest('[data-rotatable]'))) {
    return null;
  }
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }
  switch (event.key) {
    case 'ArrowUp':
    case 'PageDown':
    case '+':
      return 1;
    case 'ArrowDown':
    case 'PageUp':
    case '-':
    case '−':
      return -1;
    default:
      return null;
  }
}

/**
 * Turns wheel, one-finger drag and two-finger pinch on the scene into stepless zoom,
 * and snaps to the nearest stage when the user lets go.
 */
@Directive({
  selector: '[appZoomInput]',
  host: {
    '(wheel)': 'onWheel($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerEnd($event)',
    '(pointercancel)': 'onPointerEnd($event)',
  },
})
export class ZoomInput {
  private readonly zoom = inject(ZoomState);
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private wheelTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.wheelTimer));
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    this.zoom.nudge(delta * WHEEL_RATE);
    clearTimeout(this.wheelTimer);
    this.wheelTimer = setTimeout(() => this.zoom.release(), WHEEL_RELEASE_MS);
  }

  onPointerDown(event: PointerEvent): void {
    if (event.target instanceof Element && event.target.closest('button, a, input')) {
      return;
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (event.currentTarget instanceof Element && 'setPointerCapture' in event.currentTarget) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic events in tests have no active pointer to capture.
      }
    }
    this.zoom.stop();
    this.pinchDistance = this.currentPinchDistance();
  }

  onPointerMove(event: PointerEvent): void {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) {
      return;
    }
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size >= 2) {
      const distance = this.currentPinchDistance();
      if (this.pinchDistance > 0 && distance > 0) {
        this.zoom.nudge(-Math.log(distance / this.pinchDistance) * PINCH_RATE);
      }
      this.pinchDistance = distance;
      return;
    }
    const dy = previous.y - event.clientY;
    this.zoom.nudge(dy * DRAG_RATE);
  }

  onPointerEnd(event: PointerEvent): void {
    if (!this.pointers.delete(event.pointerId)) {
      return;
    }
    this.pinchDistance = this.currentPinchDistance();
    if (this.pointers.size === 0) {
      this.zoom.release();
    }
  }

  private currentPinchDistance(): number {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
}
