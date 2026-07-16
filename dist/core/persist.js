/**
 * Persisted signals — automatic state persistence to localStorage or IndexedDB.
 *
 * When the signal changes, the value is saved. On app load, the value is rehydrated.
 * Works offline by default — data lives in the browser.
 *
 * Usage:
 * ```ts
 * const user = createPersisted('user-prefs', { theme: 'dark', lang: 'en' });
 * user.set({ theme: 'light', lang: 'en' }); // Automatically saved
 * // On next page load, user() returns { theme: 'light', lang: 'en' }
 * ```
 */
import { createSignal, createEffect } from './signal';
/* ────────────────── Security: prototype pollution guard ────────────────── */
const POISONED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
/** Recursively strip prototype-polluting keys from parsed JSON. */
function sanitizeParsed(value) {
    if (value === null || typeof value !== 'object')
        return value;
    if (Array.isArray(value))
        return value.map(sanitizeParsed);
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
        if (!POISONED_KEYS.has(k)) {
            clean[k] = sanitizeParsed(v);
        }
    }
    return clean;
}
/** localStorage adapter (synchronous, 5MB limit, strings only). */
export const localStorageAdapter = {
    get(key) {
        if (typeof localStorage === 'undefined')
            return undefined;
        const raw = localStorage.getItem(key);
        if (raw === null)
            return undefined;
        try {
            return sanitizeParsed(JSON.parse(raw));
        }
        catch {
            return undefined;
        }
    },
    set(key, value) {
        if (typeof localStorage === 'undefined')
            return;
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        if (typeof localStorage === 'undefined')
            return;
        localStorage.removeItem(key);
    },
};
/** sessionStorage adapter (same API, cleared on tab close). */
export const sessionStorageAdapter = {
    get(key) {
        if (typeof sessionStorage === 'undefined')
            return undefined;
        const raw = sessionStorage.getItem(key);
        if (raw === null)
            return undefined;
        try {
            return sanitizeParsed(JSON.parse(raw));
        }
        catch {
            return undefined;
        }
    },
    set(key, value) {
        if (typeof sessionStorage === 'undefined')
            return;
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        if (typeof sessionStorage === 'undefined')
            return;
        sessionStorage.removeItem(key);
    },
};
/**
 * Create a signal that persists its value to storage.
 * Rehydrates on creation; auto-saves on every change.
 */
export function createPersisted(key, initial, options) {
    const storage = options?.storage ?? localStorageAdapter;
    const debounceMs = options?.debounce ?? 0;
    // Rehydrate from storage
    const stored = storage.get(key);
    const signal = createSignal(stored !== undefined ? stored : initial);
    // Auto-save on changes
    let timer = null;
    createEffect(() => {
        const value = signal();
        if (debounceMs > 0) {
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(() => storage.set(key, value), debounceMs);
        }
        else {
            storage.set(key, value);
        }
    });
    // Attach clear method. Order matters: setting the signal first re-triggers
    // the auto-save effect (writing `initial` back to storage), so we must
    // remove from storage AFTER the signal reset, not before — otherwise the
    // save effect resurrects the just-cleared entry.
    const persisted = signal;
    persisted.clear = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        signal.set(initial);
        storage.remove(key);
    };
    return persisted;
}
