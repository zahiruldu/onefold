/**
 * Fine-grained reactivity core.
 *
 * No virtual DOM, no compiler. Signals track exactly which effects read them;
 * effects unsubscribe from stale dependencies on every run so there are no
 * leaks and no wasted re-computation (same model class as Solid/Preact Signals).
 */
type EffectFn = () => void;
export interface Signal<T> {
    (): T;
    set(value: T | ((prev: T) => T)): void;
    peek(): T;
}
/** Create a reactive value. Reading it (`count()`) inside an effect subscribes that effect. */
export declare function createSignal<T>(initial: T): Signal<T>;
/**
 * Run `fn` immediately and re-run it whenever any signal it read changes. Returns a disposer.
 *
 * @param label - Optional name for devtools/effect-hook attribution (see extend.ts).
 *   Purely diagnostic — has no effect on scheduling or dependency tracking.
 */
export declare function createEffect(fn: EffectFn, label?: string): () => void;
/** A read-only signal derived from other signals. Recomputes lazily-eagerly via an internal effect. */
export declare function createComputed<T>(fn: () => T): Signal<T>;
/** Group multiple signal writes into a single effect flush. */
export declare function batch(fn: () => void): void;
export {};
