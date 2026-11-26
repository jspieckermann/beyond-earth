import { InjectionToken } from '@angular/core';

export interface DevicePosition {
  readonly lat: number;
  readonly lon: number;
}

/** Asks the browser once for the device location. Only called after „Meinen Standort verwenden“ is activated. */
export type Geolocate = () => Promise<DevicePosition>;

export const GEOLOCATE = new InjectionToken<Geolocate>('GEOLOCATE', {
  providedIn: 'root',
  factory: () => () =>
    new Promise<DevicePosition>((resolve, reject) => {
      const geo = (globalThis.navigator as Navigator | undefined)?.geolocation;
      if (!geo) {
        reject(new Error('unavailable'));
        return;
      }
      geo.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        (e) => reject(e),
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
      );
    }),
});

/** The device location is rounded to 0,05° (a few kilometres) before anything else sees it. */
export function roundPosition(p: DevicePosition): DevicePosition {
  const round = (v: number) => Math.round(v * 20) / 20;
  return { lat: round(p.lat), lon: round(p.lon) };
}

/** The device's time zone, used for „Dein Standort“. */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
}
