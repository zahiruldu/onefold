/**
 * DevTools initialization.
 * Demonstrates: enableDevtools, effect monitoring
 */
import { enableDevtools } from '../../../src/core/devtools';

export const devtools = enableDevtools();

devtools.on('render', (entry: unknown) => {
  const e = entry as { label: string; duration: number };
  if (e.duration > 5) {
    console.warn(`[perf] Slow effect: ${e.label} (${e.duration.toFixed(2)}ms)`);
  }
});
