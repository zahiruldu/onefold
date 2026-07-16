/**
 * Extension points. onefold stays a small closed core (signals + html + mount) but
 * exposes two seams for extending it without forking: an effect scheduler hook (devtools,
 * logging, time-travel debugging) and a directive registry (custom `d-*` attribute
 * behaviors, the same shape as Vue directives / Alpine's `x-*`, so ports from those
 * ecosystems are mechanical).
 */
let effectHook = null;
/** Register a hook that wraps every named effect run — e.g. for a devtools timeline. */
export function setEffectHook(hook) {
    effectHook = hook;
}
export function runWithHook(label, fn) {
    if (effectHook)
        effectHook(label, fn);
    else
        fn();
}
const directives = new Map();
/** Register a custom `d-name` attribute handler, e.g. `registerDirective('tooltip', ...)`. */
export function registerDirective(name, handler) {
    directives.set(name, handler);
}
export function getDirective(name) {
    return directives.get(name);
}
