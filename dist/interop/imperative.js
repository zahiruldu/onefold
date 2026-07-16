import { createEffect } from '../core/signal';
import { disposeOnRemove } from '../core/lifecycle';
export function wrapImperative(adapter) {
    const el = document.createElement(adapter.tag);
    const instance = adapter.mount(el);
    if (adapter.update) {
        // If `watch` reads a signal, this effect is kept alive by that signal for as
        // long as it lives, independent of `el`'s DOM connectivity — dispose it when
        // `el` is removed, same leak class documented in lifecycle.ts. This is on top
        // of (not instead of) the `destroy` MutationObserver below, which handles the
        // adapter's own imperative teardown (e.g. chart.destroy()), not this effect.
        const dispose = createEffect(() => {
            adapter.watch?.();
            adapter.update(instance, el);
        });
        disposeOnRemove(el, dispose);
    }
    if (adapter.destroy) {
        // MutationObserver-based cleanup: fires once the node is actually removed from the DOM.
        const observer = new MutationObserver(() => {
            if (!el.isConnected) {
                adapter.destroy(instance, el);
                observer.disconnect();
            }
        });
        // Defer observing until the node has a chance to be attached by the caller.
        queueMicrotask(() => {
            if (el.parentNode)
                observer.observe(el.parentNode, { childList: true });
        });
    }
    return el;
}
export function embedForeign(adapter) {
    const el = document.createElement(adapter.tag ?? 'div');
    const root = adapter.render(el);
    if (adapter.unrender) {
        const observer = new MutationObserver(() => {
            if (!el.isConnected) {
                adapter.unrender(root, el);
                observer.disconnect();
            }
        });
        queueMicrotask(() => {
            if (el.parentNode)
                observer.observe(el.parentNode, { childList: true });
        });
    }
    return el;
}
