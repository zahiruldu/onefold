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
export declare function enableDevtools(): DevtoolsAPI;
/**
 * Disable devtools and remove the global hook.
 */
export declare function disableDevtools(): void;
