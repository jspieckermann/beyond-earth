/** The seven experience modules of the concept, by their letter. */
export const MODULE_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export function isModuleId(value: unknown): value is ModuleId {
  return typeof value === 'string' && (MODULE_IDS as readonly string[]).includes(value);
}

/** What the real sky offers tonight at the user's chosen place. */
export interface TonightInfo {
  /** Display name of the chosen place, e.g. "Hamburg". */
  readonly location: string;
  /** Local time from which the band is visible, e.g. "19:40". */
  readonly visibleFrom: string;
  /** Sky darkness on a 1–5 scale (5 = darkest). */
  readonly darkness: 1 | 2 | 3 | 4 | 5;
  /** One short line about the moon. */
  readonly moon: string;
  /** Tonight's small mission for outside. */
  readonly mission: string;
}
