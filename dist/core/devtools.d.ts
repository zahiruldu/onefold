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
/**
 * Register a signal for devtools tracking. Called internally by createSignal
 * when devtools are enabled. No-op when devtools are disabled.
 */
export declare function _devRegisterSignal(label: string, getValue: () => unknown, getSubscriberCount: () => number): number;
/**
 * Notify devtools that a signal value changed.
 */
export declare function _devSignalUpdated(id: number): void;
/**
 * Register an effect for devtools tracking.
 */
export declare function _devRegisterEffect(label: string, getDependencyCount: () => number): number;
/**
 * Notify devtools that an effect ran.
 */
export declare function _devEffectRan(id: number): void;
/**
 * Mark an effect as disposed.
 */
export declare function _devEffectDisposed(id: number): void;
/**
 * Register a store for devtools inspection.
 */
export declare function _devRegisterStore(label: string, getState: () => unknown): void;
/**
 * Notify devtools of a route change.
 */
export declare function _devRouteChanged(path: string): void;
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
export declare function enableDevtools(): DevtoolsAPI;
/**
 * Disable devtools and remove the global hook.
 */
export declare function disableDevtools(): void;
