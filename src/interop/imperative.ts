import { createEffect } from '../core/signal';
import { disposeOnRemove } from '../core/lifecycle';

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

export function wrapImperative<TInstance, TElement extends HTMLElement = HTMLElement>(
  adapter: ImperativeAdapter<TInstance, TElement>
): TElement {
  const el = document.createElement(adapter.tag) as TElement;
  const instance = adapter.mount(el);

  if (adapter.update) {
    // If `watch` reads a signal, this effect is kept alive by that signal for as
    // long as it lives, independent of `el`'s DOM connectivity — dispose it when
    // `el` is removed, same leak class documented in lifecycle.ts. This is on top
    // of (not instead of) the `destroy` MutationObserver below, which handles the
    // adapter's own imperative teardown (e.g. chart.destroy()), not this effect.
    const dispose = createEffect(() => {
      adapter.watch?.();
      adapter.update!(instance, el);
    });
    disposeOnRemove(el, dispose);
  }

  if (adapter.destroy) {
    // MutationObserver-based cleanup: fires once the node is actually removed from the DOM.
    const observer = new MutationObserver(() => {
      if (!el.isConnected) {
        adapter.destroy!(instance, el);
        observer.disconnect();
      }
    });
    // Defer observing until the node has a chance to be attached by the caller.
    queueMicrotask(() => {
      if (el.parentNode) observer.observe(el.parentNode, { childList: true });
    });
  }

  return el;
}

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

export function embedForeign<TRoot>(adapter: ForeignAdapter<TRoot>): HTMLElement {
  const el = document.createElement(adapter.tag ?? 'div');
  const root = adapter.render(el);

  if (adapter.unrender) {
    const observer = new MutationObserver(() => {
      if (!el.isConnected) {
        adapter.unrender!(root, el);
        observer.disconnect();
      }
    });
    queueMicrotask(() => {
      if (el.parentNode) observer.observe(el.parentNode, { childList: true });
    });
  }

  return el;
}
