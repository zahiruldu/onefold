/**
 * Extension points. onefold stays a small closed core (signals + html + mount) but
 * exposes two seams for extending it without forking: an effect scheduler hook (devtools,
 * logging, time-travel debugging) and a directive registry (custom `d-*` attribute
 * behaviors, the same shape as Vue directives / Alpine's `x-*`, so ports from those
 * ecosystems are mechanical).
 */
export type EffectHook = (label: string, fn: () => void) => void;
/** Register a hook that wraps every named effect run — e.g. for a devtools timeline. */
export declare function setEffectHook(hook: EffectHook | null): void;
export declare function runWithHook(label: string, fn: () => void): void;
export type Directive = (el: HTMLElement, value: unknown) => void | (() => void);
/** Register a custom `d-name` attribute handler, e.g. `registerDirective('tooltip', ...)`. */
export declare function registerDirective(name: string, handler: Directive): void;
export declare function getDirective(name: string): Directive | undefined;
