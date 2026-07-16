/**
 * Internal disposal registry — the fix for the framework's core memory-leak class.
 *
 * PROBLEM: `html`, `VirtualList`, and `Transition` each call `createEffect()` to bind
 * reactive attributes/children/rows, but discard the disposer `createEffect` returns.
 * A signal's `subscribers` Set holds a strong reference to the effect, which closes
 * over the DOM node it updates. If that node is later removed from the document
 * (a route change, a conditional re-render, a list item deletion), the *signal* still
 * references the *effect*, which still references the *detached node* — so neither
 * the effect nor the node subtree is ever eligible for garbage collection as long as
 * the signal lives. In a long-running SPA this leaks the entire replaced component
 * tree on every navigation/update.
 *
 * FIX: Register each binding's disposer against the stable DOM node that "owns" it.
 * A single shared MutationObserver (same pattern already used by
 * `interop/imperative.ts` for `wrapImperative`/`embedForeign`) watches the document
 * for removed subtrees and runs the disposers for every node in a removed subtree
 * that has one registered. This requires no API change — existing `html` call sites
 * keep working exactly as before, they just stop leaking.
 *
 * This is intentionally DOM-connectivity-based rather than an explicit ownership
 * tree (unlike Solid/React): it matches onefold's "a component is just a function
 * returning a real DOM Node" model — disposal follows the DOM, not a parallel
 * bookkeeping structure.
 */
const disposersByNode = new WeakMap();
let observer = null;
function ensureObserver() {
    if (observer || typeof MutationObserver === 'undefined' || typeof document === 'undefined')
        return;
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.removedNodes.forEach(runDisposersForSubtree);
        }
    });
    const root = document.documentElement ?? document;
    observer.observe(root, { childList: true, subtree: true });
}
function runDisposersForSubtree(node) {
    const disposers = disposersByNode.get(node);
    if (disposers) {
        for (const dispose of disposers) {
            try {
                dispose();
            }
            catch (err) {
                console.error('[onefold] Error while disposing a reactive binding:', err);
            }
        }
        disposersByNode.delete(node);
    }
    // Removal only reports the direct child that left its parent; descendants that
    // also had bindings (nested html`` calls) need to be walked explicitly.
    node.childNodes.forEach(runDisposersForSubtree);
}
/**
 * Register a disposer to run when `node` is removed from the document
 * (as part of any ancestor subtree removal, not just direct removal).
 *
 * Registering against a node that is never attached to the document will never
 * fire — this mirrors the existing behavior of `wrapImperative`'s cleanup, which
 * only starts observing once the element has a parent.
 */
export function disposeOnRemove(node, dispose) {
    ensureObserver();
    let set = disposersByNode.get(node);
    if (!set) {
        set = new Set();
        disposersByNode.set(node, set);
    }
    set.add(dispose);
}
