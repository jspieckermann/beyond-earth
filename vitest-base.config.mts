import { defineConfig } from 'vitest/config';

/** Extra Vitest options for `ng test` (picked up via `runnerConfig: true` in angular.json). */
export default defineConfig({
  test: {
    // Component tests render the whole journey; under coverage on all cores they need more than 5 s.
    testTimeout: 30_000,
  },
});
