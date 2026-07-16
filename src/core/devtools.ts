/**
 * DevTools protocol — exposes the signal graph, component tree, and render
 * performance data to a browser devtools extension.
 *
 * Usage:
 * ```ts
 * if (import.meta.env?.DEV) {
 *   enableDevtools();
 * }
 * ```
 *
 * Once enabled, the devtools extension (or console) can access:
 * - `__NANOFRAME_DEVTOOLS__.signals` — list of active signals with values
 * - `__NANOFRAME_DEVTOOLS__.components` — component tree with metadata
 * - `__NANOFRAME_DEVTOOLS__.renders` — recent render performance data
 * - `__NANOFRAME_DEVTOOLS__.inspect(el)` — inspect a DOM element's bindings
 */

import { setEffectHook } from './extend';

/* ────────────────── Types ────────────────── */

export interface DevtoolsAPI {
  /** Framework version. */
  version: string;
  /** Whether devtools are currently active. */
  active: boolean;
  /** Render performance history. */
  renders: RenderEntry[];
  /** Inspect an element for signal bindings (placeholder for extension). */
  inspect: (el: HTMLElement) => void;
  /** Get render stats summary. */
  stats: () => DevtoolsStats;
  /** Clear all collected data. */
  clear: () => void;
  /** Subscribe to devtools events. */
  on: (event: 'render' | 'error', handler: (...args: unknown[]) => void) => () => void;
}

export interface RenderEntry {
  label: string;
  duration: number;
  timestamp: number;
}

export interface DevtoolsStats {
  totalRenders: number;
  avgDuration: number;
  slowestRender: RenderEntry | null;
  totalErrors: number;
}

/* ────────────────── Implementation ────────────────── */

let devtoolsInstance: DevtoolsAPI | null = null;

declare global {
  interface Window {
    __NANOFRAME_DEVTOOLS__?: DevtoolsAPI;
  }
}

/**
 * Enable devtools integration. Call once at app startup (dev mode only).
 * Installs a global `__NANOFRAME_DEVTOOLS__` object and hooks into the
 * effect system to track render performance.
 */
export function enableDevtools(): DevtoolsAPI {
  if (devtoolsInstance) return devtoolsInstance;

  const renders: RenderEntry[] = [];
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  let errorCount = 0;

  function emit(event: string, ...args: unknown[]): void {
    const set = listeners.get(event);
    if (set) for (const handler of set) handler(...args);
  }

  // Hook into the effect system to measure render durations
  setEffectHook((label: string, fn: () => void) => {
    const start = performance.now();
    try {
      fn();
    } catch (err) {
      errorCount++;
      emit('error', err, label);
      throw err;
    }
    const duration = performance.now() - start;
    const entry: RenderEntry = { label, duration, timestamp: Date.now() };
    renders.push(entry);
    // Keep only last 500 entries
    if (renders.length > 500) renders.shift();
    emit('render', entry);
  });

  const api: DevtoolsAPI = {
    version: '0.1.0',
    active: true,
    renders,
    inspect: (el: HTMLElement) => {
      console.group('[onefold devtools] Inspect:', el);
      console.log('Tag:', el.tagName.toLowerCase());
      console.log('Attributes:', Array.from(el.attributes).map((a) => `${a.name}="${a.value}"`));
      console.log('Children:', el.childNodes.length);
      console.log('Data-remote:', el.getAttribute('data-remote') ?? 'none');
      console.groupEnd();
    },
    stats: () => {
      const total = renders.length;
      const avg = total > 0 ? renders.reduce((s, r) => s + r.duration, 0) / total : 0;
      const slowest = total > 0
        ? renders.reduce((max, r) => r.duration > max.duration ? r : max, renders[0]!)
        : null;
      return { totalRenders: total, avgDuration: avg, slowestRender: slowest, totalErrors: errorCount };
    },
    clear: () => {
      renders.length = 0;
      errorCount = 0;
    },
    on: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return () => { listeners.get(event)?.delete(handler); };
    },
  };

  devtoolsInstance = api;

  // Expose globally for browser devtools extension
  if (typeof window !== 'undefined') {
    window.__NANOFRAME_DEVTOOLS__ = api;
  }

  return api;
}

/**
 * Disable devtools and remove the global hook.
 */
export function disableDevtools(): void {
  if (!devtoolsInstance) return;
  setEffectHook(null);
  devtoolsInstance.active = false;
  if (typeof window !== 'undefined') {
    delete window.__NANOFRAME_DEVTOOLS__;
  }
  devtoolsInstance = null;
}
