/**
 * The numbers of Modul C in one place. The concept's open question (230 km/s at 26.000 light-years gives
 * about 210 rather than 230 million years per round) changes only these values.
 */
export const GALACTIC = {
  /** Speed of the Sun around the galactic centre. */
  speedKmS: 230,
  /** One round of the Sun: the galactic year. */
  galacticYear: 230e6,
  /** Seconds in a year of 365,25 days. */
  yearSeconds: 365.25 * 86_400,
  /** Our species, Homo sapiens. */
  humanYears: 300_000,
} as const;

/** The age of the Sun in years, and so the rounds it has completed by today (rounded: about 20). */
export const SUN_AGE_YEARS = 4.6e9;

/**
 * The rounds the Sun had completed at a time `rounds` back: about 20 today, fewer the further back, none when it
 * formed. Whole rounds only, since a ring stands for a completed round.
 */
export function completedRounds(rounds: number): number {
  return Math.max(0, Math.floor(roundsIn(SUN_AGE_YEARS) - rounds + 1e-9));
}

/** What the rings stand for, in words: "Bis heute: rund 20 Runden", "Bis dahin: 19 Runden", "Bis dahin: noch keine Runde". */
export function formatCompleted(rounds: number): string {
  const n = completedRounds(rounds);
  if (rounds < 0.002) {
    return `Bis heute: rund ${n} Runden um das Zentrum`;
  }
  if (n === 0) {
    return 'Bis dahin: noch keine Runde';
  }
  return `Bis dahin: ${n === 1 ? '1 Runde' : `${n} Runden`} um das Zentrum`;
}

/** Distance travelled around the centre in the given number of years. */
export function distanceKm(years: number): number {
  return years * GALACTIC.yearSeconds * GALACTIC.speedKmS;
}

/** Rounds around the centre in the given number of years. */
export function roundsIn(years: number): number {
  return years / GALACTIC.galacticYear;
}

/** Years back for the given number of rounds. */
export function yearsBack(rounds: number): number {
  return rounds * GALACTIC.galacticYear;
}

const de = (value: number, digits = 0) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * A distance in German number format: kilometres below a billion ("13.800 km"), then "Milliarden
 * Kilometer" with one decimal below ten billion ("7,3 Milliarden Kilometer") and whole numbers above.
 */
export function formatKm(km: number): string {
  if (km < 1e9) {
    return `${de(Math.round(km))} km`;
  }
  const billions = km / 1e9;
  return billions < 10 ? `${de(billions, 1)} Milliarden Kilometer` : `${de(Math.round(billions))} Milliarden Kilometer`;
}

/** A number of rounds with two significant digits ("0,00000013", "0,29", "20"). */
export function formatRounds(rounds: number): string {
  return rounds.toLocaleString('de-DE', { maximumSignificantDigits: 2, maximumFractionDigits: 20 });
}

/** The time back for a number of rounds, short ("vor 115 Mio. Jahren") or long for assistive technology. */
export function formatTimeBack(rounds: number, long = false): string {
  const years = yearsBack(rounds);
  if (years < 500_000) {
    return 'heute';
  }
  if (years < 1e9) {
    return `vor ${de(Math.round(years / 1e6))} ${long ? 'Millionen' : 'Mio.'} Jahren`;
  }
  const billions = Math.round(years / 1e8) / 10;
  return `vor ${de(billions, Number.isInteger(billions) ? 0 : 1)} ${long ? 'Milliarden' : 'Mrd.'} Jahren`;
}

/** The rounds back while the Sun moves ("0,6 Runden", "1 Runde", "2,4 Runden"). */
export function formatRoundsBack(rounds: number): string {
  const r = Math.round(rounds * 10) / 10;
  if (r === 0) {
    return 'auf dem Weg';
  }
  return r === 1 ? '1 Runde' : `${de(r, Number.isInteger(r) ? 0 : 1)} Runden`;
}

