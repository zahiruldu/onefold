/**
 * Suspense — async boundaries with unified loading states.
 *
 * Wraps async component rendering. Shows a fallback until all promises
 * inside resolve, then swaps to the real content.
 *
 * Usage:
 * ```ts
 * const view = Suspense(
 *   async () => {
 *     const data = await fetchUser();
 *     return html`<div>${data.name}</div>`;
 *   },
 *   { fallback: () => Spinner() }
 * );
 *
 * // Multiple async resources:
 * const view = Suspense(
 *   async () => {
 *     const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
 *     return html`<div>${user.name}: ${posts.length} posts</div>`;
 *   },
 *   { fallback: () => Skeleton(), onError: (err) => ErrorBox(err.message) }
 * );
 * ```
 */
/**
 * Async component boundary. Executes an async render function, shows fallback
 * during loading, and swaps to the result when ready.
 */
export function Suspense(asyncRender, options) {
    const container = document.createElement('div');
    container.setAttribute('data-suspense', '');
    const { fallback, onError, minLoadingMs = 0 } = options ?? {};
    // Show fallback immediately
    if (fallback)
        container.appendChild(fallback());
    const startTime = Date.now();
    asyncRender()
        .then(async (node) => {
        // Respect minimum loading time to avoid flash
        if (minLoadingMs > 0) {
            const elapsed = Date.now() - startTime;
            if (elapsed < minLoadingMs) {
                await delay(minLoadingMs - elapsed);
            }
        }
        container.textContent = '';
        container.appendChild(node);
    })
        .catch((err) => {
        container.textContent = '';
        const error = err instanceof Error ? err : new Error(String(err));
        if (onError) {
            container.appendChild(onError(error));
        }
        else {
            container.textContent = `Error: ${error.message}`;
        }
    });
    return container;
}
/**
 * Suspense for multiple parallel async operations.
 * All promises must resolve before content is shown.
 */
export function SuspenseAll(asyncRenders, options) {
    const combined = async () => {
        const nodes = await Promise.all(asyncRenders.map((fn) => fn()));
        const frag = document.createDocumentFragment();
        for (const node of nodes)
            frag.appendChild(node);
        return frag;
    };
    return Suspense(combined, options);
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
