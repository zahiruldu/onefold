import { createSignal, type Signal } from '../core/signal';

export type Store<T extends object> = Signal<T> & {
  update: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void;
};

/**
 * A signal that holds an object, plus a convenience `update()` for partial merges.
 * For large or deeply nested state, prefer several small signals over one big store —
 * fine-grained signals only re-run the effects that actually read the field that changed.
 */
export function createStore<T extends object>(initial: T): Store<T> {
  const signal = createSignal(initial) as Store<T>;
  signal.update = (patch) => {
    signal.set((prev) => ({
      ...prev,
      ...(typeof patch === 'function' ? patch(prev) : patch),
    }));
  };
  return signal;
}
