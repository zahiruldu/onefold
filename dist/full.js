/**
 * onefold/full — all features in a single bundle for CDN/script-tag usage.
 *
 * CDN:
 *   <script type="module" src="https://unpkg.com/onefold/dist/onefold.full.min.js"></script>
 *
 * For bundler-based projects, prefer importing from 'onefold' (core) plus
 * sub-paths like 'onefold/form', 'onefold/http', etc. for tree-shaking.
 */
// Core (same as 'onefold')
export * from './index.js';
// Sub-path modules
export { VirtualList } from './core/virtual-list.js';
export { Suspense, SuspenseAll } from './core/suspense.js';
export { Transition, animateEnter, animateLeave } from './core/transition.js';
export { setEffectHook, registerDirective } from './core/extend.js';
export { wrapImperative, embedForeign } from './interop/imperative.js';
export { createForm, required, email, minLength, maxLength, pattern, min, max, custom } from './core/form.js';
export { createHttpClient } from './core/http.js';
export { createI18n } from './core/i18n.js';
export { createPersisted, localStorageAdapter, sessionStorageAdapter } from './core/persist.js';
export { createTheme } from './core/theme.js';
export { setPermissions, getPermissions, hasPermission, hasAllPermissions, hasAnyPermission, guard, guardedNode } from './core/guard.js';
export { createObserver } from './core/observe.js';
export { createPluginHost } from './core/plugin.js';
export { loadRemote, preloadRemote, configureSecurity, clearRemoteCache } from './core/remote.js';
export { createWebSocket, createEventSource } from './core/stream.js';
export { FocusTrap, announce, useKeyboard, SkipLink } from './core/a11y.js';
export { component, getComponentRegistry, getComponentMeta, exportManifest } from './core/meta.js';
export { enableDevtools, disableDevtools } from './core/devtools.js';
export { renderHTML } from './core/ssr.js';
export { formatDate, timeAgo, formatCurrency, formatNumber, truncate, slugify, pluralize, capitalize, debounce, throttle, pipe } from './core/utils.js';
