/**
 * Plugin system setup.
 * Demonstrates: createPluginHost, plugin registration, lifecycle
 */
import { createPluginHost } from '../../../src/index';
import { observer } from './observer';

export const plugins = createPluginHost();

// Analytics plugin
plugins.register({
  name: 'analytics',
  version: '1.0.0',
  permissions: ['observe', 'navigate'],
  setup: (ctx) => {
    ctx.on('pageview', (path: unknown) => {
      observer.metric('pageview', 1, { path: path as string });
    });
    console.log(`[plugin] ${ctx.name} v1.0.0 loaded`);
    return () => console.log(`[plugin] ${ctx.name} unloaded`);
  },
});

// Performance monitoring plugin
plugins.register({
  name: 'perf-monitor',
  version: '1.0.0',
  permissions: ['observe'],
  setup: (ctx) => {
    const start = performance.now();
    ctx.on('check', () => {
      observer.metric('uptime', performance.now() - start);
    });
    console.log(`[plugin] ${ctx.name} v1.0.0 loaded`);
  },
});

plugins.start();
