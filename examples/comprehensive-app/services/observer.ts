/**
 * Observability — structured event system for monitoring.
 * Demonstrates: createObserver with typed events
 */
import { createObserver } from '../../../src/core/observe';

export const observer = createObserver();

// Subscribe to events (in real app: send to APM)
observer.on('navigate', (e) => {
  console.log(`[nav] ${e.from} → ${e.to}`);
});

observer.on('error', (e) => {
  console.error('[error]', e.error, e.context);
});

observer.on('metric', (e) => {
  console.log(`[metric] ${e.name}: ${e.value}`, e.tags);
});
