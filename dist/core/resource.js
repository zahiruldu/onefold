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
import { createSignal, createEffect } from './signal';
/**
 * Create a reactive resource that fetches data whenever the source signal changes.
 *
 * @param source - A signal or accessor function providing the fetch key/parameter.
 * @param fetcher - An async function that receives the source value and returns data.
 */
export function createResource(source, fetcher) {
    const data = createSignal(undefined);
    const loading = createSignal(false);
    const error = createSignal(undefined);
    let fetchId = 0; // Guards against stale responses from earlier fetches
    const doFetch = (sourceValue) => {
        const id = ++fetchId;
        loading.set(true);
        error.set(undefined);
        fetcher(sourceValue)
            .then((result) => {
            if (id !== fetchId)
                return; // Stale response, ignore
            data.set(result);
            loading.set(false);
        })
            .catch((err) => {
            if (id !== fetchId)
                return;
            error.set(err);
            loading.set(false);
        });
    };
    // Auto-fetch whenever source changes
    let currentSource;
    const disposeEffect = createEffect(() => {
        const val = source();
        currentSource = val;
        doFetch(val);
    });
    return {
        data: data,
        loading,
        error,
        refetch: () => doFetch(currentSource),
        dispose: () => {
            disposeEffect();
            fetchId++; // invalidate any in-flight fetch so its .then/.catch become no-ops
        },
    };
}
