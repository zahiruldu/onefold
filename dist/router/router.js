import { createSignal, createEffect } from '../core/signal';
import { disposeOnRemove } from '../core/lifecycle';
/* ────────────────── Lazy singleton state ────────────────── */
let _currentPath = null;
let _useHash = null;
function useHash() {
    if (_useHash === null) {
        _useHash = typeof window !== 'undefined' && window.location.protocol === 'file:';
    }
    return _useHash;
}
function readPath() {
    if (typeof window === 'undefined')
        return '/';
    if (useHash())
        return window.location.hash.slice(1) || '/';
    return window.location.pathname;
}
/** Initialize the route signal and attach listener on first use. */
function getPathSignal() {
    if (_currentPath)
        return _currentPath;
    _currentPath = createSignal(readPath());
    if (typeof window !== 'undefined') {
        const event = useHash() ? 'hashchange' : 'popstate';
        window.addEventListener(event, () => _currentPath.set(readPath()));
    }
    return _currentPath;
}
/* ────────────────── Public API ────────────────── */
/** Navigate without a full page reload. Updates history and every subscribed route. */
export function navigate(path) {
    if (typeof window === 'undefined')
        return;
    const signal = getPathSignal();
    if (useHash()) {
        window.location.hash = path;
    }
    else {
        window.history.pushState({}, '', path);
        signal.set(path);
    }
}
/** Read the current route path reactively. */
export function currentRoute() {
    return getPathSignal()();
}
/**
 * Match a route pattern (e.g. `/posts/:id`) against a path.
 * Returns params if matched, or null if no match.
 */
function matchRoute(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length)
        return null;
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pat = patternParts[i];
        const val = pathParts[i];
        if (pat.startsWith(':')) {
            params[pat.slice(1)] = decodeURIComponent(val);
        }
        else if (pat !== val) {
            return null;
        }
    }
    return params;
}
/**
 * Mounts the view matching the current path, swapping it reactively on navigate().
 *
 * Supports two route formats:
 * - Simple record: `{ '/': HomeView, '/about': AboutView }`
 * - Route definitions with params: `[{ path: '/posts/:id', view: (params) => ... }]`
 */
export function Router(routes, notFound) {
    const pathSignal = getPathSignal();
    const container = document.createElement('div');
    const dispose = createEffect(() => {
        const path = pathSignal();
        let view = null;
        if (Array.isArray(routes)) {
            for (const route of routes) {
                const params = matchRoute(route.path, path);
                if (params !== null) {
                    view = route.view(params);
                    break;
                }
            }
        }
        else {
            const handler = routes[path];
            if (handler)
                view = handler();
        }
        container.textContent = '';
        container.appendChild(view ?? notFound());
    });
    // `pathSignal` is a module-level singleton that outlives any single Router()
    // call — without disposing on removal, mounting/unmounting a Router region
    // (nested routers, conditional router regions) leaks one effect per mount
    // for the lifetime of the whole app. See lifecycle.ts.
    disposeOnRemove(container, dispose);
    return container;
}
/**
 * A reactive link component that uses client-side navigation.
 * Intercepts clicks and calls navigate() instead of a full page reload.
 */
export function Link(href, child, className) {
    const el = document.createElement('a');
    el.setAttribute('href', useHash() ? `#${href}` : href);
    if (className) {
        if (typeof className === 'function') {
            const dispose = createEffect(() => { el.className = className(); });
            disposeOnRemove(el, dispose);
        }
        else {
            el.className = className;
        }
    }
    el.addEventListener('click', (e) => {
        if (!useHash()) {
            e.preventDefault();
            navigate(href);
        }
    });
    if (typeof child === 'string') {
        el.textContent = child;
    }
    else {
        el.appendChild(child);
    }
    return el;
}
