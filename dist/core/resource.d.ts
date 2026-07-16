/**
 * Reactive async data fetching primitive.
 *
 * `createResource` ties a signal-based source to an async fetcher function.
 * It returns a reactive resource object with `.data()`, `.loading()`, `.error()`,
 * and a `.refetch()` method to manually trigger a reload.
 *
 * @example
 * ```ts
 * const heroId = createSignal(1);
 * const hero = createResource(heroId, (id) => fetch(`/api/heroes/${id}`).then(r => r.json()));
 *
 * // In a template:
 * html`<div>${() => hero.loading() ? 'Loading...' : hero.data()?.name}</div>`
 * ```
 */
import { type Signal } from './signal';
export interface Resource<T> {
    /** The fetched data (or undefined while loading / on error). */
    data: Signal<T | undefined>;
    /** Whether a fetch is currently in flight. */
    loading: Signal<boolean>;
    /** The error from the last failed fetch (or undefined on success). */
    error: Signal<unknown>;
    /** Manually trigger a refetch using the current source value. */
    refetch: () => void;
    /**
     * Stop the auto-fetch-on-source-change effect and ignore any fetch already
     * in flight. `createResource` has no DOM node of its own to key cleanup off
     * of (it returns data, not a Node), so unlike `html`'s bindings this cannot
     * be disposed automatically — call this yourself when whatever created the
     * resource goes away, the same way you'd call a disposer from `createEffect`.
     */
    dispose: () => void;
}
/**
 * Create a reactive resource that fetches data whenever the source signal changes.
 *
 * @param source - A signal or accessor function providing the fetch key/parameter.
 * @param fetcher - An async function that receives the source value and returns data.
 */
export declare function createResource<S, T>(source: Signal<S> | (() => S), fetcher: (sourceValue: S) => Promise<T>): Resource<T>;
