/**
 * Fine-grained reactivity core.
 *
 * No virtual DOM, no compiler. Signals track exactly which effects read them;
 * effects unsubscribe from stale dependencies on every run so there are no
 * leaks and no wasted re-computation (same model class as Solid/Preact Signals).
 */

import { runWithHook } from './extend';

type EffectFn = () => void;

let activeEffect: ReactiveEffect | null = null;
let batchDepth = 0;
const pendingEffects = new Set<ReactiveEffect>();

class ReactiveEffect {
  fn: EffectFn;
  label: string;
  deps: Set<SignalImpl<unknown>> = new Set();
  active = true;

  constructor(fn: EffectFn, label: string) {
    this.fn = fn;
    this.label = label;
  }

  run(): void {
    if (!this.active) return;
    this.cleanup();
    const prevEffect = activeEffect;
    activeEffect = this;
    try {
      // Routed through the effect hook (see extend.ts) so setEffectHook()/
      // enableDevtools() can observe every run — a no-op passthrough when no
      // hook is registered, so this costs one extra function call otherwise.
      runWithHook(this.label, this.fn);
    } finally {
      activeEffect = prevEffect;
    }
  }

  cleanup(): void {
    for (const dep of this.deps) dep.subscribers.delete(this);
    this.deps.clear();
  }

  dispose(): void {
    this.active = false;
    this.cleanup();
  }
}

class SignalImpl<T> {
  subscribers: Set<ReactiveEffect> = new Set();

  constructor(private value: T) {}

  get(): T {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
      activeEffect.deps.add(this as SignalImpl<unknown>);
    }
    return this.value;
  }

  set(next: T | ((prev: T) => T)): void {
    const newValue = typeof next === 'function' ? (next as (prev: T) => T)(this.value) : next;
    if (Object.is(newValue, this.value)) return;
    this.value = newValue;
    this.notify();
  }

  peek(): T {
    return this.value;
  }

  private notify(): void {
    if (batchDepth > 0) {
      for (const e of this.subscribers) pendingEffects.add(e);
    } else {
      // Copy to array to avoid issues if a subscriber modifies the set during iteration
      const subs = Array.from(this.subscribers);
      for (let i = 0; i < subs.length; i++) subs[i]!.run();
    }
  }
}

export interface Signal<T> {
  (): T;
  set(value: T | ((prev: T) => T)): void;
  peek(): T;
}

/** Create a reactive value. Reading it (`count()`) inside an effect subscribes that effect. */
export function createSignal<T>(initial: T): Signal<T> {
  const impl = new SignalImpl(initial);
  const accessor = (() => impl.get()) as Signal<T>;
  accessor.set = (v) => impl.set(v);
  accessor.peek = () => impl.peek();
  return accessor;
}

/**
 * Run `fn` immediately and re-run it whenever any signal it read changes. Returns a disposer.
 *
 * @param label - Optional name for devtools/effect-hook attribution (see extend.ts).
 *   Purely diagnostic — has no effect on scheduling or dependency tracking.
 */
export function createEffect(fn: EffectFn, label = 'effect'): () => void {
  const effect = new ReactiveEffect(fn, label);
  effect.run();
  return () => effect.dispose();
}

/** A read-only signal derived from other signals. Recomputes lazily-eagerly via an internal effect. */
export function createComputed<T>(fn: () => T): Signal<T> {
  const internal = createSignal<T>(undefined as unknown as T);
  createEffect(() => internal.set(fn()), 'computed');
  const accessor = (() => internal()) as Signal<T>;
  accessor.peek = internal.peek;
  accessor.set = () => {
    throw new Error('[onefold] Cannot write to a computed signal.');
  };
  return accessor;
}

/** Group multiple signal writes into a single effect flush. */
export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const effects = [...pendingEffects];
      pendingEffects.clear();
      for (const e of effects) e.run();
    }
  }
}
