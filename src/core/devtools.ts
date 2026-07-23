/**
 * onefold DevTools — enhanced console-based debugging API.
 *
 * Exposes `window.__ONEFOLD_DEVTOOLS__` with signal tracking, dependency
 * graph inspection, render performance profiling, and store state viewing.
 *
 * Usage:
 * ```ts
 * if (import.meta.env?.DEV) {
 *   enableDevtools();
 * }
 * ```
 *
 * Console API:
 * ```
 * __ONEFOLD_DEVTOOLS__.signals()        — list all tracked signals with values
 * __ONEFOLD_DEVTOOLS__.effects()        — list all active effects with dependencies
 * __ONEFOLD_DEVTOOLS__.renders          — render performance timeline
 * __ONEFOLD_DEVTOOLS__.stats()          — { totalRenders, avgDuration, slowestRender }
 * __ONEFOLD_DEVTOOLS__.inspect(el)      — inspect a DOM element's bindings
 * __ONEFOLD_DEVTOOLS__.highlight(el)    — flash-highlight an element
 * __ONEFOLD_DEVTOOLS__.trace(label)     — log when a named signal/effect runs
 * __ONEFOLD_DEVTOOLS__.stores()         — snapshot of all registered stores
 * __ONEFOLD_DEVTOOLS__.routes()         — current route + navigation history
 * __ONEFOLD_DEVTOOLS__.clear()          — reset all collected data
 * __ONEFOLD_DEVTOOLS__.on(event, fn)    — subscribe to devtools events
 * ```
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
  /** List all tracked signals with current values and subscriber counts. */
  signals: () => SignalInfo[];
  /** List all active effects with their labels and dependency count. */
  effects: () => EffectInfo[];
  /** Get all registered stores with current state. */
  stores: () => StoreInfo[];
  /** Get current route and navigation history. */
  routes: () => RouteInfo;
  /** Inspect a DOM element for signal bindings. */
  inspect: (el: HTMLElement) => void;
  /** Flash-highlight an element to visualize re-renders. */
  highlight: (el: HTMLElement) => void;
  /** Trace a signal or effect by label — logs when it fires. */
  trace: (label: string) => () => void;
  /** Get render performance stats. */
  stats: () => DevtoolsStats;
  /** Clear all collected data. */
  clear: () => void;
  /** Subscribe to devtools events (render, error, signal, navigate). */
  on: (event: DevtoolsEvent, handler: (...args: unknown[]) => void) => () => void;
  /** Log a snapshot of all devtools state to console. */
  dump: () => void;
}

export interface RenderEntry {
  label: string;
  duration: number;
  timestamp: number;
  /** Source stack trace (first meaningful frame) — helps identify which component triggered the render. */
  source: string;
}

export interface DevtoolsStats {
  totalRenders: number;
  avgDuration: number;
  slowestRender: RenderEntry | null;
  fastestRender: RenderEntry | null;
  totalErrors: number;
  activeSignals: number;
  activeEffects: number;
}

export interface SignalInfo {
  id: number;
  label: string;
  value: unknown;
  subscribers: number;
  lastUpdated: number;
}

export interface EffectInfo {
  id: number;
  label: string;
  dependencies: number;
  runCount: number;
  lastRun: number;
  active: boolean;
}

export interface StoreInfo {
  label: string;
  state: unknown;
}

export interface RouteInfo {
  current: string;
  history: string[];
}

export type DevtoolsEvent = 'render' | 'error' | 'signal' | 'navigate';

/* ────────────────── Internal tracking state ────────────────── */

interface TrackedSignal {
  id: number;
  label: string;
  getValue: () => unknown;
  getSubscriberCount: () => number;
  lastUpdated: number;
}

interface TrackedEffect {
  id: number;
  label: string;
  getDependencyCount: () => number;
  runCount: number;
  lastRun: number;
  active: boolean;
}

let nextSignalId = 1;
let nextEffectId = 1;
const trackedSignals = new Map<number, TrackedSignal>();
const trackedEffects = new Map<number, TrackedEffect>();
const trackedStores: StoreInfo[] = [];
const routeHistory: string[] = [];
const traceLabels = new Set<string>();

/* ────────────────── Public registration hooks ────────────────── */

/**
 * Register a signal for devtools tracking. Called internally by createSignal
 * when devtools are enabled. No-op when devtools are disabled.
 */
export function _devRegisterSignal(
  label: string,
  getValue: () => unknown,
  getSubscriberCount: () => number
): number {
  if (!devtoolsInstance) return 0;
  const id = nextSignalId++;
  trackedSignals.set(id, { id, label, getValue, getSubscriberCount, lastUpdated: Date.now() });
  return id;
}

/**
 * Notify devtools that a signal value changed.
 */
export function _devSignalUpdated(id: number): void {
  if (!devtoolsInstance) return;
  const entry = trackedSignals.get(id);
  if (entry) {
    entry.lastUpdated = Date.now();
    emit('signal', { id, label: entry.label, value: entry.getValue() });
    if (traceLabels.has(entry.label)) {
      console.log(
        `%c[onefold trace]%c ${entry.label} →`,
        'color:#4338CA;font-weight:bold',
        'color:inherit',
        entry.getValue()
      );
    }
  }
}

/**
 * Register an effect for devtools tracking.
 */
export function _devRegisterEffect(
  label: string,
  getDependencyCount: () => number
): number {
  if (!devtoolsInstance) return 0;
  const id = nextEffectId++;
  trackedEffects.set(id, { id, label, getDependencyCount, runCount: 0, lastRun: Date.now(), active: true });
  return id;
}

/**
 * Notify devtools that an effect ran.
 */
export function _devEffectRan(id: number): void {
  if (!devtoolsInstance) return;
  const entry = trackedEffects.get(id);
  if (entry) {
    entry.runCount++;
    entry.lastRun = Date.now();
    if (traceLabels.has(entry.label)) {
      console.log(
        `%c[onefold trace]%c effect "${entry.label}" ran (${entry.runCount}x)`,
        'color:#4338CA;font-weight:bold',
        'color:inherit'
      );
    }
  }
}

/**
 * Mark an effect as disposed.
 */
export function _devEffectDisposed(id: number): void {
  if (!devtoolsInstance) return;
  const entry = trackedEffects.get(id);
  if (entry) entry.active = false;
}

/**
 * Register a store for devtools inspection.
 */
export function _devRegisterStore(label: string, getState: () => unknown): void {
  if (!devtoolsInstance) return;
  trackedStores.push({ label, get state() { return getState(); } });
}

/**
 * Notify devtools of a route change.
 */
export function _devRouteChanged(path: string): void {
  if (!devtoolsInstance) return;
  routeHistory.push(path);
  if (routeHistory.length > 50) routeHistory.shift();
  emit('navigate', { from: routeHistory[routeHistory.length - 2] ?? '/', to: path });
}

/* ────────────────── Implementation ────────────────── */

let devtoolsInstance: DevtoolsAPI | null = null;
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

function emit(event: string, ...args: unknown[]): void {
  const set = listeners.get(event);
  if (set) for (const handler of set) handler(...args);
}

declare global {
  interface Window {
    __ONEFOLD_DEVTOOLS__?: DevtoolsAPI;
  }
}

/**
 * Enable devtools integration. Call once at app startup (dev mode only).
 * Installs `window.__ONEFOLD_DEVTOOLS__` and hooks into the effect system.
 *
 * Zero overhead when not called — all tracking functions are no-ops
 * until enableDevtools() creates the instance.
 */
export function enableDevtools(): DevtoolsAPI {
  if (devtoolsInstance) return devtoolsInstance;

  const renders: RenderEntry[] = [];
  let errorCount = 0;

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

    // Capture a meaningful source location from the stack trace.
    // Skip internal frames (devtools.ts, signal.ts, template.ts, extend.ts)
    let source = '';
    try {
      const stack = new Error().stack ?? '';
      const lines = stack.split('\n');
      const internalPatterns = /devtools|signal|template|extend|lifecycle|runWithHook/i;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim() ?? '';
        if (line && !internalPatterns.test(line)) {
          // Extract "at FunctionName (file:line:col)" or "at file:line:col"
          const match = line.match(/at\s+(\S+)\s+\((.+)\)/) ?? line.match(/at\s+(.+)/);
          if (match) {
            source = match[1] ?? line;
            // Clean up long paths — keep just filename:line
            const pathMatch = source.match(/([^/\\]+\.\w+:\d+)/);
            if (pathMatch) source = pathMatch[1]!;
          }
          break;
        }
      }
    } catch { /* stack trace not available in all environments */ }

    const entry: RenderEntry = { label, duration, timestamp: Date.now(), source };
    renders.push(entry);
    if (renders.length > 1000) renders.shift();
    emit('render', entry);
  });

  const api: DevtoolsAPI = {
    version: '0.1.1',
    active: true,
    renders,

    signals: () => {
      const result: SignalInfo[] = [];
      for (const [, s] of trackedSignals) {
        result.push({
          id: s.id,
          label: s.label,
          value: s.getValue(),
          subscribers: s.getSubscriberCount(),
          lastUpdated: s.lastUpdated,
        });
      }
      return result;
    },

    effects: () => {
      const result: EffectInfo[] = [];
      for (const [, e] of trackedEffects) {
        result.push({
          id: e.id,
          label: e.label,
          dependencies: e.getDependencyCount(),
          runCount: e.runCount,
          lastRun: e.lastRun,
          active: e.active,
        });
      }
      return result;
    },

    stores: () => [...trackedStores],

    routes: () => ({
      current: routeHistory[routeHistory.length - 1] ?? '/',
      history: [...routeHistory],
    }),

    inspect: (el: HTMLElement) => {
      console.group('%c[onefold] Inspect Element', 'color:#4338CA;font-weight:bold');
      console.log('Element:', el);
      console.log('Tag:', el.tagName.toLowerCase());
      console.log('Classes:', el.className || '(none)');
      console.log('Attributes:', Object.fromEntries(
        Array.from(el.attributes).map(a => [a.name, a.value])
      ));
      console.log('Children:', el.childNodes.length);
      console.log('Text:', el.textContent?.substring(0, 100) ?? '');
      console.log('Parent:', el.parentElement?.tagName.toLowerCase() ?? '(none)');
      console.log('Data attrs:', Object.fromEntries(
        Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value])
      ));
      console.groupEnd();
    },

    highlight: (el: HTMLElement) => {
      const prev = el.style.outline;
      const prevTransition = el.style.transition;
      el.style.transition = 'outline 0.1s';
      el.style.outline = '2px solid #4338CA';
      setTimeout(() => {
        el.style.outline = '2px solid transparent';
        setTimeout(() => {
          el.style.outline = prev;
          el.style.transition = prevTransition;
        }, 300);
      }, 600);
    },

    trace: (label: string) => {
      traceLabels.add(label);
      console.log(`%c[onefold] Tracing "${label}" — changes will be logged`, 'color:#4338CA');
      return () => { traceLabels.delete(label); };
    },

    stats: () => {
      const total = renders.length;
      const avg = total > 0 ? renders.reduce((s, r) => s + r.duration, 0) / total : 0;
      const sorted = [...renders].sort((a, b) => a.duration - b.duration);
      return {
        totalRenders: total,
        avgDuration: Math.round(avg * 100) / 100,
        slowestRender: sorted.length > 0 ? sorted[sorted.length - 1]! : null,
        fastestRender: sorted.length > 0 ? sorted[0]! : null,
        totalErrors: errorCount,
        activeSignals: trackedSignals.size,
        activeEffects: [...trackedEffects.values()].filter(e => e.active).length,
      };
    },

    clear: () => {
      renders.length = 0;
      errorCount = 0;
      trackedSignals.clear();
      trackedEffects.clear();
      trackedStores.length = 0;
      routeHistory.length = 0;
      traceLabels.clear();
      nextSignalId = 1;
      nextEffectId = 1;
    },

    on: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return () => { listeners.get(event)?.delete(handler); };
    },

    dump: () => {
      const s = api.stats();
      console.group('%c[onefold devtools] State Dump', 'color:#4338CA;font-weight:bold;font-size:14px');
      console.log('Version:', api.version);
      console.log('');
      console.log('%cSignals (%d)', 'font-weight:bold', s.activeSignals);
      console.table(api.signals().map(sig => ({
        id: sig.id,
        label: sig.label,
        value: typeof sig.value === 'object' ? JSON.stringify(sig.value) : sig.value,
        subscribers: sig.subscribers,
      })));
      console.log('');
      console.log('%cEffects (%d active)', 'font-weight:bold', s.activeEffects);
      console.table(api.effects().filter(e => e.active).map(eff => ({
        id: eff.id,
        label: eff.label,
        deps: eff.dependencies,
        runs: eff.runCount,
      })));
      console.log('');
      console.log('%cPerformance', 'font-weight:bold');
      console.log(`  Renders: ${s.totalRenders}`);
      console.log(`  Avg duration: ${s.avgDuration}ms`);
      console.log(`  Slowest: ${s.slowestRender ? `${s.slowestRender.label} (${s.slowestRender.duration.toFixed(2)}ms) @ ${s.slowestRender.source}` : 'N/A'}`);
      console.log(`  Errors: ${s.totalErrors}`);
      if (renders.length > 0) {
        console.log('');
        console.log('%cRecent Renders (last 10)', 'font-weight:bold');
        console.table(renders.slice(-10).map(r => ({
          label: r.label,
          duration: r.duration.toFixed(3) + 'ms',
          source: r.source || '(internal)',
          time: new Date(r.timestamp).toLocaleTimeString(),
        })));
      }
      console.log('');
      if (trackedStores.length > 0) {
        console.log('%cStores', 'font-weight:bold');
        for (const store of trackedStores) {
          console.log(`  ${store.label}:`, store.state);
        }
        console.log('');
      }
      const r = api.routes();
      console.log('%cRouting', 'font-weight:bold');
      console.log(`  Current: ${r.current}`);
      console.log(`  History: ${r.history.join(' → ')}`);
      console.groupEnd();
    },
  };

  devtoolsInstance = api;

  if (typeof window !== 'undefined') {
    window.__ONEFOLD_DEVTOOLS__ = api;
    console.log(
      '%c🔷 onefold devtools enabled %cv' + api.version + '%c — type __ONEFOLD_DEVTOOLS__.dump() for full state',
      'background:#4338CA;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
      'background:#818CF8;color:#fff;padding:2px 6px;border-radius:3px;margin-left:4px',
      'color:#64748b;margin-left:8px'
    );
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
  listeners.clear();
  trackedSignals.clear();
  trackedEffects.clear();
  trackedStores.length = 0;
  routeHistory.length = 0;
  traceLabels.clear();
  if (typeof window !== 'undefined') {
    delete window.__ONEFOLD_DEVTOOLS__;
  }
  devtoolsInstance = null;
}
