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

import { createSignal, createEffect, type Signal } from './signal';

/* ────────────────── Security: prototype pollution guard ────────────────── */

const POISONED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Recursively strip prototype-polluting keys from parsed JSON. */
function sanitizeParsed(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeParsed);
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (!POISONED_KEYS.has(k)) {
      clean[k] = sanitizeParsed(v);
    }
  }
  return clean;
}

/* ────────────────── Storage adapters ────────────────── */

export interface StorageAdapter {
  get(key: string): unknown | undefined;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

/** localStorage adapter (synchronous, 5MB limit, strings only). */
export const localStorageAdapter: StorageAdapter = {
  get(key: string): unknown | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    const raw = localStorage.getItem(key);
    if (raw === null) return undefined;
    try { return sanitizeParsed(JSON.parse(raw)); } catch { return undefined; }
  },
  set(key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },
};

/** sessionStorage adapter (same API, cleared on tab close). */
export const sessionStorageAdapter: StorageAdapter = {
  get(key: string): unknown | undefined {
    if (typeof sessionStorage === 'undefined') return undefined;
    const raw = sessionStorage.getItem(key);
    if (raw === null) return undefined;
    try { return sanitizeParsed(JSON.parse(raw)); } catch { return undefined; }
  },
  set(key: string, value: unknown): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

/* ────────────────── Persisted signal ────────────────── */

export interface PersistedSignal<T> extends Signal<T> {
  /** Remove the persisted value from storage. */
  clear: () => void;
}

export interface PersistOptions {
  /** Storage backend. Default: localStorageAdapter. */
  storage?: StorageAdapter;
  /** Debounce writes (ms). Default: 0 (immediate). */
  debounce?: number;
}

/**
 * Create a signal that persists its value to storage.
 * Rehydrates on creation; auto-saves on every change.
 */
export function createPersisted<T>(
  key: string,
  initial: T,
  options?: PersistOptions
): PersistedSignal<T> {
  const storage = options?.storage ?? localStorageAdapter;
  const debounceMs = options?.debounce ?? 0;

  // Rehydrate from storage
  const stored = storage.get(key);
  const signal = createSignal<T>(stored !== undefined ? stored as T : initial);

  // Auto-save on changes
  let timer: ReturnType<typeof setTimeout> | null = null;
  createEffect(() => {
    const value = signal();
    if (debounceMs > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => storage.set(key, value), debounceMs);
    } else {
      storage.set(key, value);
    }
  });

  // Attach clear method. Order matters: setting the signal first re-triggers
  // the auto-save effect (writing `initial` back to storage), so we must
  // remove from storage AFTER the signal reset, not before — otherwise the
  // save effect resurrects the just-cleared entry.
  const persisted = signal as PersistedSignal<T>;
  persisted.clear = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    signal.set(initial);
    storage.remove(key);
  };

  return persisted;
}
