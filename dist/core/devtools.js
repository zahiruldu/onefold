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
/* ────────────────── Implementation ────────────────── */
let devtoolsInstance = null;
/**
 * Enable devtools integration. Call once at app startup (dev mode only).
 * Installs a global `__NANOFRAME_DEVTOOLS__` object and hooks into the
 * effect system to track render performance.
 */
export function enableDevtools() {
    if (devtoolsInstance)
        return devtoolsInstance;
    const renders = [];
    const listeners = new Map();
    let errorCount = 0;
    function emit(event, ...args) {
        const set = listeners.get(event);
        if (set)
            for (const handler of set)
                handler(...args);
    }
    // Hook into the effect system to measure render durations
    setEffectHook((label, fn) => {
        const start = performance.now();
        try {
            fn();
        }
        catch (err) {
            errorCount++;
            emit('error', err, label);
            throw err;
        }
        const duration = performance.now() - start;
        const entry = { label, duration, timestamp: Date.now() };
        renders.push(entry);
        // Keep only last 500 entries
        if (renders.length > 500)
            renders.shift();
        emit('render', entry);
    });
    const api = {
        version: '0.1.0',
        active: true,
        renders,
        inspect: (el) => {
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
                ? renders.reduce((max, r) => r.duration > max.duration ? r : max, renders[0])
                : null;
            return { totalRenders: total, avgDuration: avg, slowestRender: slowest, totalErrors: errorCount };
        },
        clear: () => {
            renders.length = 0;
            errorCount = 0;
        },
        on: (event, handler) => {
            if (!listeners.has(event))
                listeners.set(event, new Set());
            listeners.get(event).add(handler);
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
export function disableDevtools() {
    if (!devtoolsInstance)
        return;
    setEffectHook(null);
    devtoolsInstance.active = false;
    if (typeof window !== 'undefined') {
        delete window.__NANOFRAME_DEVTOOLS__;
    }
    devtoolsInstance = null;
}
