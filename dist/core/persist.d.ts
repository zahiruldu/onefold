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
import { type Signal } from './signal';
export interface StorageAdapter {
    get(key: string): unknown | undefined;
    set(key: string, value: unknown): void;
    remove(key: string): void;
}
/** localStorage adapter (synchronous, 5MB limit, strings only). */
export declare const localStorageAdapter: StorageAdapter;
/** sessionStorage adapter (same API, cleared on tab close). */
export declare const sessionStorageAdapter: StorageAdapter;
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
export declare function createPersisted<T>(key: string, initial: T, options?: PersistOptions): PersistedSignal<T>;
