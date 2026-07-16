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

import { createSignal, createEffect, type Signal } from './signal';

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
export function createResource<S, T>(
  source: Signal<S> | (() => S),
  fetcher: (sourceValue: S) => Promise<T>
): Resource<T> {
  const data = createSignal<T | undefined>(undefined);
  const loading = createSignal(false);
  const error = createSignal<unknown>(undefined);

  let fetchId = 0; // Guards against stale responses from earlier fetches

  const doFetch = (sourceValue: S) => {
    const id = ++fetchId;
    loading.set(true);
    error.set(undefined);

    fetcher(sourceValue)
      .then((result) => {
        if (id !== fetchId) return; // Stale response, ignore
        data.set(result);
        loading.set(false);
      })
      .catch((err) => {
        if (id !== fetchId) return;
        error.set(err);
        loading.set(false);
      });
  };

  // Auto-fetch whenever source changes
  let currentSource: S;
  const disposeEffect = createEffect(() => {
    const val = (source as () => S)();
    currentSource = val;
    doFetch(val);
  });

  return {
    data: data as Signal<T | undefined>,
    loading,
    error,
    refetch: () => doFetch(currentSource),
    dispose: () => {
      disposeEffect();
      fetchId++; // invalidate any in-flight fetch so its .then/.catch become no-ops
    },
  };
}
