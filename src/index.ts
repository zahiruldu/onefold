/**
 * onefold — core exports (~5kb gzipped).
 *
 * Everything you need to build a reactive SPA: reactivity, templates,
 * scoped CSS, routing, store, async resources, error boundaries, DI.
 *
 * Enterprise/specialized features via sub-path imports:
 *
 *   import { createSignal, html, mount, Router } from 'onefold';
 *   import { setEffectHook, registerDirective } from 'onefold/extend';
 *   import { VirtualList } from 'onefold/virtual-list';
 *   import { Suspense } from 'onefold/suspense';
 *   import { Transition } from 'onefold/transition';
 *   import { createForm, required } from 'onefold/form';
 *   import { createHttpClient } from 'onefold/http';
 *   import { createI18n } from 'onefold/i18n';
 *   import { createPersisted } from 'onefold/persist';
 *   import { createTheme } from 'onefold/theme';
 *   import { setPermissions, guard } from 'onefold/guard';
 *   import { createObserver } from 'onefold/observe';
 *   import { createPluginHost } from 'onefold/plugin';
 *   import { loadRemote } from 'onefold/remote';
 *   import { createWebSocket } from 'onefold/stream';
 *   import { FocusTrap, announce } from 'onefold/a11y';
 *   import { wrapImperative } from 'onefold/interop';
 *   import { component } from 'onefold/meta';
 *   import { enableDevtools } from 'onefold/devtools';
 *   import { renderHTML } from 'onefold/ssr';
 *   import { formatDate, debounce } from 'onefold/utils';
 */

// ─── Reactivity ──────────────────────────────────────
export { createSignal, createEffect, createComputed, batch } from './core/signal';
export type { Signal } from './core/signal';

// ─── DOM ─────────────────────────────────────────────
export { mount } from './core/dom';

// ─── Templates ───────────────────────────────────────
export { html } from './core/template';

// ─── Security ────────────────────────────────────────
export { raw } from './security/sanitize';

// ─── Scoped CSS ──────────────────────────────────────
export { css, cssValue } from './core/css';
export type { ScopedStyle } from './core/css';

// ─── Routing ─────────────────────────────────────────
export { Router, navigate, currentRoute, Link, configureRouter } from './router/router';
export type { Routes, RouteDefinition, RouteParams } from './router/router';

// ─── Store ───────────────────────────────────────────
export { createStore } from './store/store';
export type { Store } from './store/store';

// ─── Resource (async data fetching) ──────────────────
export { createResource } from './core/resource';
export type { Resource } from './core/resource';

// ─── Lazy loading ────────────────────────────────────
export { lazy } from './core/lazy';

// ─── Error Boundary ──────────────────────────────────
export { ErrorBoundary } from './core/error-boundary';

// ─── Dependency Injection ────────────────────────────
export { createToken, provide, inject, tryInject, runWithProviders } from './core/di';
export type { Token } from './core/di';
