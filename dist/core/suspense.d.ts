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
export interface SuspenseOptions {
    /** Node to show while the async render is pending. */
    fallback?: () => Node;
    /** Error handler — shown if the async render rejects. */
    onError?: (error: Error) => Node;
    /** Minimum display time for fallback (ms) — prevents flash of loading state. */
    minLoadingMs?: number;
}
/**
 * Async component boundary. Executes an async render function, shows fallback
 * during loading, and swaps to the result when ready.
 */
export declare function Suspense(asyncRender: () => Promise<Node>, options?: SuspenseOptions): Node;
/**
 * Suspense for multiple parallel async operations.
 * All promises must resolve before content is shown.
 */
export declare function SuspenseAll(asyncRenders: (() => Promise<Node>)[], options?: SuspenseOptions): Node;
