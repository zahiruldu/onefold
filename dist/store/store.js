import { createSignal } from '../core/signal.js';
/**
 * A signal that holds an object, plus a convenience `update()` for partial merges.
 * For large or deeply nested state, prefer several small signals over one big store —
 * fine-grained signals only re-run the effects that actually read the field that changed.
 */
export function createStore(initial) {
    const signal = createSignal(initial);
    signal.update = (patch) => {
        signal.set((prev) => ({
            ...prev,
            ...(typeof patch === 'function' ? patch(prev) : patch),
        }));
    };
    return signal;
}
