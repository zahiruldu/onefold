/**
 * Wrap any imperative library (Chart.js, D3, Leaflet, Monaco, video players, ...) as a
 * onefold node. This is the general escape hatch for "just use any npm package":
 * you get a plain DOM element ref, mount/update/destroy hooks, and automatic cleanup
 * wiring via createEffect's disposer — no adapter package needed per library.
 *
 * Example (Chart.js):
 *   wrapImperative({
 *     tag: 'canvas',
 *     mount: (el) => new Chart(el, config),
 *     update: (chart, el) => chart.update(),
 *     destroy: (chart) => chart.destroy(),
 *   })
 */
export interface ImperativeAdapter<TInstance, TElement extends HTMLElement = HTMLElement> {
    tag: string;
    mount: (el: TElement) => TInstance;
    update?: (instance: TInstance, el: TElement) => void;
    destroy?: (instance: TInstance, el: TElement) => void;
    /** Reactive dependency — when this closure's tracked signals change, `update` runs. */
    watch?: () => unknown;
}
export declare function wrapImperative<TInstance, TElement extends HTMLElement = HTMLElement>(adapter: ImperativeAdapter<TInstance, TElement>): TElement;
/**
 * Thin adapter pattern for embedding components from other frameworks (React, Vue, etc.)
 * without taking a hard dependency on them. Pass the framework's own render/unmount calls;
 * onefold only owns the container element and the mount point in its own tree.
 *
 * Example (React 18+):
 *   embedForeign({
 *     tag: 'div',
 *     render: (el) => { const root = ReactDOM.createRoot(el); root.render(<MyComp />); return root; },
 *     unrender: (root) => root.unmount(),
 *   })
 */
export interface ForeignAdapter<TRoot> {
    tag?: string;
    render: (el: HTMLElement) => TRoot;
    unrender?: (root: TRoot, el: HTMLElement) => void;
}
export declare function embedForeign<TRoot>(adapter: ForeignAdapter<TRoot>): HTMLElement;
