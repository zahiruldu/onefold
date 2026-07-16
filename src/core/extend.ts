/**
 * Extension points. onefold stays a small closed core (signals + html + mount) but
 * exposes two seams for extending it without forking: an effect scheduler hook (devtools,
 * logging, time-travel debugging) and a directive registry (custom `d-*` attribute
 * behaviors, the same shape as Vue directives / Alpine's `x-*`, so ports from those
 * ecosystems are mechanical).
 */

export type EffectHook = (label: string, fn: () => void) => void;

let effectHook: EffectHook | null = null;

/** Register a hook that wraps every named effect run — e.g. for a devtools timeline. */
export function setEffectHook(hook: EffectHook | null): void {
  effectHook = hook;
}

export function runWithHook(label: string, fn: () => void): void {
  if (effectHook) effectHook(label, fn);
  else fn();
}

export type Directive = (el: HTMLElement, value: unknown) => void | (() => void);

const directives = new Map<string, Directive>();

/** Register a custom `d-name` attribute handler, e.g. `registerDirective('tooltip', ...)`. */
export function registerDirective(name: string, handler: Directive): void {
  directives.set(name, handler);
}

export function getDirective(name: string): Directive | undefined {
  return directives.get(name);
}
