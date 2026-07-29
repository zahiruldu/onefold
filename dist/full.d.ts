/**
 * onefold/full — all features in a single bundle for CDN/script-tag usage.
 *
 * CDN:
 *   <script type="module" src="https://unpkg.com/onefold/dist/onefold.full.min.js"></script>
 *
 * For bundler-based projects, prefer importing from 'onefold' (core) plus
 * sub-paths like 'onefold/form', 'onefold/http', etc. for tree-shaking.
 */
export * from './index';
export { VirtualList } from './core/virtual-list';
export type { VirtualListOptions } from './core/virtual-list';
export { Suspense, SuspenseAll } from './core/suspense';
export type { SuspenseOptions } from './core/suspense';
export { Transition, animateEnter, animateLeave } from './core/transition';
export type { TransitionOptions } from './core/transition';
export { setEffectHook, registerDirective } from './core/extend';
export type { EffectHook, Directive } from './core/extend';
export { wrapImperative, embedForeign } from './interop/imperative';
export type { ImperativeAdapter, ForeignAdapter } from './interop/imperative';
export { createForm, required, email, minLength, maxLength, pattern, min, max, custom } from './core/form';
export type { Form, FormField, FieldConfig, ValidationRule } from './core/form';
export { createHttpClient } from './core/http';
export type { HttpClient, HttpClientOptions, HttpInterceptor, HttpConfig, HttpResponse, HttpError, RequestOptions } from './core/http';
export { createI18n } from './core/i18n';
export type { I18n, I18nConfig, Messages, LocaleMessages } from './core/i18n';
export { createPersisted, localStorageAdapter, sessionStorageAdapter } from './core/persist';
export type { PersistedSignal, StorageAdapter, PersistOptions } from './core/persist';
export { createTheme } from './core/theme';
export type { Theme, ThemeTokens, ThemeMap } from './core/theme';
export { setPermissions, getPermissions, hasPermission, hasAllPermissions, hasAnyPermission, guard, guardedNode } from './core/guard';
export type { PermissionCheck } from './core/guard';
export { createObserver } from './core/observe';
export type { Observer, ObserveEvents, EventName, EventHandler } from './core/observe';
export { createPluginHost } from './core/plugin';
export type { PluginHost, PluginDefinition, PluginContext, PluginPermission } from './core/plugin';
export { loadRemote, preloadRemote, configureSecurity, clearRemoteCache } from './core/remote';
export type { RemoteOptions, RemoteComponent, SecurityConfig, RemotePermission } from './core/remote';
export { createWebSocket, createEventSource } from './core/stream';
export type { WebSocketStream, WebSocketOptions, EventSourceStream, EventSourceOptions } from './core/stream';
export { FocusTrap, announce, useKeyboard, SkipLink } from './core/a11y';
export type { FocusTrapInstance, KeyMap, KeyboardShortcuts } from './core/a11y';
export { component, getComponentRegistry, getComponentMeta, exportManifest } from './core/meta';
export type { ComponentMeta, PropMeta, RegisteredComponent } from './core/meta';
export { enableDevtools, disableDevtools } from './core/devtools';
export type { DevtoolsAPI, RenderEntry, DevtoolsStats } from './core/devtools';
export { renderHTML } from './core/ssr';
export { formatDate, timeAgo, formatCurrency, formatNumber, truncate, slugify, pluralize, capitalize, debounce, throttle, pipe } from './core/utils';
