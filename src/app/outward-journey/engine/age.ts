import { de } from './format';

export const MIN_BIRTH_YEAR = 1900;
const MS_PER_YEAR = 365.25 * 86_400_000;

/** True for a whole year from 1900 up to and including the current year. */
export function isValidBirthYear(year: number, now: Date): boolean {
  return Number.isInteger(year) && year >= MIN_BIRTH_YEAR && year <= now.getFullYear();
}

/** Age in Earth years, counted from 1 July of the birth year (only the year is known). */
export function earthAge(birthYear: number, now: Date): number {
  return Math.max(0, (now.getTime() - Date.UTC(birthYear, 6, 1)) / MS_PER_YEAR);
}

/** Age in the years of a planet with the given orbital period (in Earth years). */
export function planetAge(birthYear: number, orbitalPeriodYears: number, now: Date): number {
  return earthAge(birthYear, now) / orbitalPeriodYears;
}

/** One decimal below 10, whole numbers from 10 upwards. */
export function formatAge(age: number): string {
  return age < 10 ? de(Math.round(age * 10) / 10, 1) : de(Math.round(age));
}
