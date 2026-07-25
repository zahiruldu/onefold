import { createSignal, createEffect } from '../core/signal.js';
import { disposeOnRemove } from '../core/lifecycle.js';
import { isUnsafeUrl } from '../security/sanitize.js';
/* ────────────────── Lazy singleton state ────────────────── */
let _currentPath = null;
let _useHash = null;
/**
 * Configure the router mode. Call BEFORE creating any Router or calling navigate().
 *
 * By default, the router uses **path-based** routing (history.pushState),
 * falling back to hash routing automatically on `file:` protocol.
 *
 * Set `hash: true` for static hosting (GitHub Pages, S3, Netlify without redirects)
 * where the server can't handle SPA fallback.
 *
 * @example
 * // Hash-based — for static hosting without server config
 * configureRouter({ hash: true });
 */
export function configureRouter(opts) {
    if (opts.hash !== undefined)
        _useHash = opts.hash;
}
/** @internal Reset router state for testing. Not part of the public API. */
export function _resetRouter() {
    _currentPath = null;
    _useHash = null;
}
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
/** Navigate without a full page reload. */
export function navigate(path) {
    if (typeof window === 'undefined')
        return;
    const signal = getPathSignal();
    if (useHash()) {
        window.location.hash = path;
        signal.set(path);
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
/* ────────────────── Route matching ────────────────── */
/**
 * Match a route pattern against a path (exact match).
 * Supports dynamic segments: `/posts/:id`
 */
function matchExact(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length)
        return null;
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pat = patternParts[i];
        const val = pathParts[i];
        if (pat.startsWith(':')) {
            try {
                params[pat.slice(1)] = decodeURIComponent(val);
            }
            catch {
                params[pat.slice(1)] = val;
            }
        }
        else if (pat !== val) {
            return null;
        }
    }
    return params;
}
/**
 * Match a route pattern as a prefix of a path (for parent routes with children).
 * Returns params if the path starts with the pattern.
 */
function matchPrefix(pattern, path) {
    if (pattern === '/') {
        // Root prefix matches everything
        return {};
    }
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length < patternParts.length)
        return null;
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pat = patternParts[i];
        const val = pathParts[i];
        if (pat.startsWith(':')) {
            try {
                params[pat.slice(1)] = decodeURIComponent(val);
            }
            catch {
                params[pat.slice(1)] = val;
            }
        }
        else if (pat !== val) {
            return null;
        }
    }
    return params;
}
/**
 * Resolve nested routes recursively against the current path.
 * Child route paths are RELATIVE to their parent — the router prepends the parent prefix automatically.
 *
 * Example:
 *   { path: '/settings', children: [
 *     { path: '/profile', ... },   ← matches /settings/profile
 *     { path: '/billing', ... },   ← matches /settings/billing
 *   ]}
 */
function resolveRoutes(routes, path, notFound, parentPath = '') {
    for (const route of routes) {
        const fullPath = joinPaths(parentPath, route.path);
        if (route.children && route.children.length > 0) {
            // Parent route — use prefix matching
            const params = matchPrefix(fullPath, path);
            if (params !== null) {
                // Try to match a child route (children are relative to this parent's full path)
                const childView = resolveRoutes(route.children, path, notFound, fullPath);
                const outlet = childView ?? notFound();
                return route.view(params, outlet);
            }
        }
        else {
            // Leaf route — exact match
            const params = matchExact(fullPath, path);
            if (params !== null) {
                return route.view(params);
            }
        }
    }
    return null;
}
/** Join parent and child path segments, avoiding double slashes. */
function joinPaths(parent, child) {
    if (!parent || parent === '/')
        return child;
    if (child === '/')
        return parent;
    const base = parent.endsWith('/') ? parent.slice(0, -1) : parent;
    const segment = child.startsWith('/') ? child : '/' + child;
    return base + segment;
}
/* ────────────────── Router component ────────────────── */
/**
 * Mounts the view matching the current path, swapping reactively on navigate().
 *
 * Supports:
 * - Simple record: `{ '/': HomeView, '/about': AboutView }`
 * - Route definitions with params: `[{ path: '/posts/:id', view: (params) => ... }]`
 * - Nested routes with children:
 *   ```ts
 *   Router([
 *     { path: '/', view: () => HomePage() },
 *     { path: '/settings', view: (params, outlet) => SettingsLayout(outlet), children: [
 *       { path: '/settings/profile', view: () => ProfilePage() },
 *       { path: '/settings/billing', view: () => BillingPage() },
 *     ]},
 *   ], NotFound);
 *   ```
 */
export function Router(routes, notFound) {
    const pathSignal = getPathSignal();
    const container = document.createElement('div');
    const dispose = createEffect(() => {
        const path = pathSignal();
        let view = null;
        if (Array.isArray(routes)) {
            view = resolveRoutes(routes, path, notFound, '');
        }
        else {
            const handler = routes[path];
            if (handler)
                view = handler();
        }
        container.textContent = '';
        container.appendChild(view ?? notFound());
    });
    disposeOnRemove(container, dispose);
    return container;
}
/**
 * A reactive link component that uses client-side navigation.
 */
export function Link(href, child, className) {
    const el = document.createElement('a');
    if (isUnsafeUrl(href)) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.warn(`[onefold] Blocked unsafe URL in Link: "${href}"`);
        }
    }
    else {
        el.setAttribute('href', useHash() ? `#${href}` : href);
    }
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
        e.preventDefault();
        navigate(href);
    });
    if (typeof child === 'string') {
        el.textContent = child;
    }
    else {
        el.appendChild(child);
    }
    return el;
}
