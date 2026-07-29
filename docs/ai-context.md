# onefold AI Context

This file teaches AI coding assistants how to write correct onefold code. It contains
every pattern, idiom, and rule needed to generate working onefold applications.

Import: `import { ... } from 'onefold'`
Core: `import { ... } from 'onefold'`
Enterprise features via sub-paths: `import { ... } from 'onefold/form'`, `'onefold/http'`, etc.

---

## Quick Reference

| Task           | API                                          |
| ----------------| ----------------------------------------------|
| Reactive state | `createSignal(value)`                        |
| Derived state  | `createComputed(() => expr)`                 |
| Side effects   | `createEffect(() => { ... })`                |
| Batch updates  | `batch(() => { ... })`                       |
| Build UI       | `` html`<div>...</div>` ``                   |
| Mount to DOM   | `mount(node, container)`                     |
| Routing        | `Router(routes, notFound)`                   |
| Navigation     | `navigate('/path')`                          |
| Current route  | `currentRoute()`                             |
| Nav link       | `Link('/path', 'Label')`                     |
| Hash routing   | `configureRouter({ hash: true })`            |
| Store          | `createStore({ key: value })`                |
| Persisted      | `createPersisted('key', initial)`            |
| Forms          | `createForm({ field: { initial, rules } })`  |
| HTTP           | `createHttpClient({ baseUrl })`              |
| i18n           | `createI18n({ defaultLocale, messages })`    |
| Theme          | `createTheme({ light: {...}, dark: {...} })` |
| Remote load    | `loadRemote({ url, fallback })`              |
| SSR            | `renderHTML(() => component)`                |
| WebSocket      | `createWebSocket(url)`                       |
| SSE            | `createEventSource(url)`                     |
| Scoped CSS     | `` css`selector { ... }` ``                  |
| Virtual list   | `VirtualList({ items, renderRow })`          |
| Lazy load      | `lazy(() => import('./Page'))`               |
| Suspense       | `Suspense(node, fallback)`                   |
| Error catch    | `ErrorBoundary(render, fallback)`            |
| Focus trap     | `FocusTrap(element)`                         |
| Announce       | `announce('message')`                        |
| DI token       | `createToken<T>('name')`                     |
| DI provide     | `provide(token, value)`                      |
| DI inject      | `inject(token)`                              |

---

## The #1 Mistake

**Forgetting the closure.** If the UI is not updating, this is why:

```ts
// WRONG — renders once, never updates
html`<p>${count()}</p>`

// CORRECT — updates when count changes
html`<p>${() => count()}</p>`
```

The `() =>` wrapper creates an effect that re-runs when any signal inside changes.

---

## Complete Component Example

```ts
import { createSignal, createComputed, html, mount } from 'onefold';

function TodoApp(): Node {
  const items = createSignal<string[]>([]);
  const input = createSignal('');
  const count = createComputed(() => items().length);

  const addItem = () => {
    const text = input().trim();
    if (!text) return;
    items.set(prev => [...prev, text]);
    input.set('');
  };

  return html`
    <div>
      <h1>Todos (${() => count()})</h1>
      <form onsubmit=${(e: Event) => { e.preventDefault(); addItem(); }}>
        <input
          value=${() => input()}
          oninput=${(e: Event) => input.set((e.target as HTMLInputElement).value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        ${() => items().map((item, i) => html`
          <li>
            ${item}
            <button onclick=${() => items.set(prev => prev.filter((_, idx) => idx !== i))}>×</button>
          </li>
        `)}
      </ul>
    </div>
  `;
}

mount(TodoApp(), document.getElementById('app')!);
```

---

## Routing — Full Example

```ts
import { Router, navigate, currentRoute, Link, configureRouter, html, mount } from 'onefold';

// Optional: for static hosting
// configureRouter({ hash: true });

function Nav(): Node {
  return html`
    <nav>
      ${Link('/', 'Home', () => currentRoute() === '/' ? 'active' : '')}
      ${Link('/about', 'About', () => currentRoute() === '/about' ? 'active' : '')}
      ${Link('/users', 'Users', () => currentRoute().startsWith('/users') ? 'active' : '')}
    </nav>
  `;
}

function Home(): Node { return html`<h1>Home</h1>`; }
function About(): Node { return html`<h1>About</h1>`; }
function UserProfile(id: string): Node { return html`<h1>User ${id}</h1>`; }
function NotFound(): Node { return html`<h1>404</h1>`; }

function App(): Node {
  return html`
    <div>
      ${Nav()}
      ${Router([
        { path: '/', view: () => Home() },
        { path: '/about', view: () => About() },
        { path: '/users/:id', view: (params) => UserProfile(params.id) },
      ], () => NotFound())}
    </div>
  `;
}

mount(App(), document.getElementById('app')!);
```

---

## Nested Routes (Layouts)

```ts
function SettingsLayout(outlet: Node): Node {
  return html`
    <div class="settings">
      <aside>
        ${Link('/settings/profile', 'Profile')}
        ${Link('/settings/billing', 'Billing')}
      </aside>
      <main>${outlet}</main>
    </div>
  `;
}

const routes = [
  { path: '/', view: () => Home() },
  { path: '/settings', view: (_params, outlet) => SettingsLayout(outlet!), children: [
    { path: '/profile', view: () => ProfilePage() },
    { path: '/billing', view: () => BillingPage() },
  ]},
];
```

---

## Forms — Full Example

```ts
import { html } from 'onefold';
import { createForm, required, email, minLength } from 'onefold/form';

function LoginForm(): Node {
  const form = createForm({
    email: { initial: '', rules: [required('Email is required'), email()] },
    password: { initial: '', rules: [required(), minLength(8, 'At least 8 chars')] },
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    console.log('Login:', values);
  };

  return html`
    <form onsubmit=${(e: Event) => { e.preventDefault(); form.submit(handleSubmit); }}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value=${() => form.fields.email.value()}
          oninput=${form.fields.email.handle}
        />
        <span class="error">${() => form.fields.email.error()}</span>
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value=${() => form.fields.password.value()}
          oninput=${form.fields.password.handle}
        />
        <span class="error">${() => form.fields.password.error()}</span>
      </div>

      <button type="submit" disabled=${() => !form.valid()}>Log In</button>
    </form>
  `;
}
```

---

## HTTP Client — Full Example

```ts
import { createSignal, html } from 'onefold';
import { createHttpClient } from 'onefold/http';

interface User { id: number; name: string; email: string; }

const http = createHttpClient({
  baseUrl: 'https://api.example.com',
  headers: { 'Accept': 'application/json' },
  interceptors: [{
    request: (config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    error: (err) => {
      if (err.status === 401) navigate('/login');
      throw err;
    },
  }],
});

function UserList(): Node {
  const users = createSignal<User[]>([]);
  const loading = createSignal(true);

  (async () => {
    const res = await http.get<User[]>('/users');
    users.set(res.data);
    loading.set(false);
  })();

  return html`
    <div>
      ${() => loading()
        ? html`<p>Loading...</p>`
        : html`<ul>${() => users().map(u => html`<li>${u.name} (${u.email})</li>`)}</ul>`
      }
    </div>
  `;
}
```

---

## Store — Shared State

```ts
import { createStore } from 'onefold';

interface AppState {
  user: { name: string; role: string } | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

export const appStore = createStore<AppState>({
  user: null,
  theme: 'light',
  sidebarOpen: true,
});

// Read
appStore().theme  // 'light'

// Update (partial merge)
appStore.update({ theme: 'dark' });
appStore.update(prev => ({ sidebarOpen: !prev.sidebarOpen }));

// In templates
html`<div class=${() => appStore().theme}>...</div>`
```

---

## i18n — Multilingual App

```ts
import { html } from 'onefold';
import { createI18n } from 'onefold/i18n';

const i18n = createI18n({
  defaultLocale: 'en',
  messages: {
    en: {
      welcome: 'Welcome, {name}!',
      items: '{count} items in cart',
      nav: { home: 'Home', settings: 'Settings' },
    },
    es: {
      welcome: '¡Bienvenido, {name}!',
      items: '{count} artículos en el carrito',
      nav: { home: 'Inicio', settings: 'Configuración' },
    },
  },
});

function Header(): Node {
  return html`
    <header>
      <h1>${() => i18n.t('welcome', { name: 'Alice' })}</h1>
      <nav>
        <a href="/">${() => i18n.t('nav.home')}</a>
        <a href="/settings">${() => i18n.t('nav.settings')}</a>
      </nav>
      <select onchange=${(e: Event) => i18n.setLocale((e.target as HTMLSelectElement).value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </header>
  `;
}
```

---

## Theming

```ts
import { css, html } from 'onefold';
import { createTheme } from 'onefold/theme';

const theme = createTheme({
  light: { bg: '#ffffff', fg: '#1f2937', accent: '#4f46e5', border: '#e5e7eb' },
  dark: { bg: '#0f172a', fg: '#f1f5f9', accent: '#818cf8', border: '#334155' },
}, 'light');

function ThemeToggle(): Node {
  return html`
    <button onclick=${() => theme.toggle()}>
      ${() => theme.current() === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  `;
}

// Use CSS variables in styles
const styles = css`
  .app { background: var(--bg); color: var(--fg); }
  .card { border: 1px solid var(--border); }
  .btn { background: var(--accent); color: white; }
`;
```

---

## Microfrontends

```ts
import { html } from 'onefold';
import { loadRemote, configureSecurity } from 'onefold/remote';

// At app startup
configureSecurity({
  trustedOrigins: ['https://widgets.company.com'],
  requireIntegrity: true,
});

function Dashboard(): Node {
  return html`
    <div>
      <h1>Dashboard</h1>
      ${loadRemote({
        url: 'https://widgets.company.com/billing.js',
        integrity: 'sha384-abc123...',
        isolate: 'shadow',
        props: { userId: '42' },
        fallback: () => html`<p>Loading billing...</p>`,
        onError: (err) => html`<p>Widget unavailable</p>`,
      })({ userId: '42' })}
    </div>
  `;
}
```

---

## SSR (Server-Side Rendering)

```ts
// server.ts
import express from 'express';
import { renderHTML } from 'onefold/ssr';

const app = express();

app.get('*', async (req, res) => {
  const body = await renderHTML(async () => {
    // Same components as client — html`...` works identically
    const data = await fetch('http://localhost:3000/api/page').then(r => r.json());
    return PageComponent({ data });
  });

  res.send(`<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body>
  <div id="app">${body}</div>
  <script type="module" src="/app.js"></script>
</body>
</html>`);
});
```

---

## WebSocket (Real-time)

```ts
import { createSignal, html } from 'onefold';
import { createWebSocket } from 'onefold/stream';

interface ChatMessage { user: string; text: string; time: number; }

function Chat(): Node {
  const ws = createWebSocket<ChatMessage>('wss://chat.example.com/room/1', {
    maxMessages: 200,
    autoReconnect: true,
  });

  const input = createSignal('');

  const sendMessage = () => {
    ws.send({ user: 'Me', text: input(), time: Date.now() });
    input.set('');
  };

  return html`
    <div>
      <div class="status">${() => ws.status()}</div>
      <ul>
        ${() => ws.data().map(m => html`<li><b>${m.user}:</b> ${m.text}</li>`)}
      </ul>
      <input value=${() => input()} oninput=${(e: Event) => input.set((e.target as HTMLInputElement).value)} />
      <button onclick=${sendMessage} disabled=${() => ws.status() !== 'open'}>Send</button>
    </div>
  `;
}
```

---

## Persisted State

```ts
import { createPersisted, sessionStorageAdapter } from 'onefold/persist';

// Persists to localStorage automatically
const userPrefs = createPersisted('prefs', { theme: 'light', fontSize: 14 });

// Session-only (cleared on tab close)
const draftEmail = createPersisted('draft', '', { storage: sessionStorageAdapter });

// Debounced save (avoids excessive writes)
const editorContent = createPersisted('editor', '', { debounce: 1000 });

// Clear persisted data
userPrefs.clear();
```

---

## Lazy Loading & Code Splitting

```ts
import { lazy, Router } from 'onefold';
import { Suspense } from 'onefold/suspense';

const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const SettingsPage = lazy(() => import('./pages/Settings'));

const app = Router([
  { path: '/', view: () => Home() },
  { path: '/analytics', view: () => Suspense(AnalyticsPage(), () => html`<p>Loading...</p>`) },
  { path: '/settings', view: () => Suspense(SettingsPage(), () => html`<p>Loading...</p>`) },
], () => NotFound());
```

---

## Dependency Injection

```ts
import { createToken, provide, inject, runWithProviders, html } from 'onefold';

// Define tokens
const ApiClient = createToken<HttpClient>('api');
const Logger = createToken<Console>('logger');

// Provide at app level
provide(ApiClient, createHttpClient({ baseUrl: '/api' }));
provide(Logger, console);

// Consume in any component
function UserList(): Node {
  const api = inject(ApiClient);
  // use api.get('/users')...
}
```

---

## Accessibility

```ts
import { html } from 'onefold';
import { FocusTrap, announce, useKeyboard, SkipLink } from 'onefold/a11y';

function Modal(content: Node, onClose: () => void): Node {
  return html`
    <div class="modal" ref=${(el) => {
      const trap = FocusTrap(el);
      trap.activate();
    }}>
      ${content}
      <button onclick=${onClose}>Close</button>
    </div>
  `;
}

// Screen reader announcement
announce('Item saved successfully');
announce('Error occurred', 'assertive');

// Keyboard shortcuts
useKeyboard({
  'ctrl+s': () => save(),
  'ctrl+z': () => undo(),
  'escape': () => closeModal(),
});

// Skip link (place at top of page)
function App(): Node {
  return html`<div>${SkipLink('main-content')}<main id="main-content">...</main></div>`;
}
```

---

## Error Boundaries

```ts
import { ErrorBoundary, html } from 'onefold';

function App(): Node {
  return html`
    <div>
      ${ErrorBoundary(
        () => DangerousWidget(),
        (error, retry) => html`
          <div class="error-panel">
            <p>Something went wrong: ${error.message}</p>
            <button onclick=${retry}>Try Again</button>
          </div>
        `
      )}
    </div>
  `;
}
```

---

## Directives (Custom Behaviors)

```ts
import { html } from 'onefold';
import { registerDirective } from 'onefold/extend';

// Register once at app startup
registerDirective('tooltip', (el, value) => {
  el.title = String(value);
  el.style.cursor = 'help';
});

registerDirective('autofocus', (el, value) => {
  if (value) requestAnimationFrame(() => (el as HTMLInputElement).focus());
});

// Use in templates
html`
  <span d-tooltip="Click to edit">Edit</span>
  <input d-autofocus=${true} />
`
```

---

## Imperative Library Integration

```ts
import { html } from 'onefold';
import { wrapImperative } from 'onefold/interop';

function ChartComponent(data: Signal<number[]>): Node {
  return wrapImperative({
    mount: (container) => {
      const chart = new Chart(container, { type: 'bar', data: { datasets: [{ data: data() }] } });
      return chart;
    },
    update: (chart, container) => {
      chart.data.datasets[0].data = data();
      chart.update();
    },
    destroy: (chart) => {
      chart.destroy();
    },
  });
}
```

---

## Rules

1. Components are plain functions returning `Node`.
2. Wrap signal reads in `() =>` closures for reactive updates in templates.
3. Never mutate arrays/objects in place — produce a new reference: `signal.set(prev => [...prev, item])`.
4. Use `batch()` when writing multiple signals that should trigger one update.
5. Never use `innerHTML` directly — use `raw()` only for developer-authored content.
6. Event handlers use `on` prefix: `onclick`, `oninput`, `onsubmit`.
7. Use the built-in router, forms, HTTP client, i18n — do not install external libraries for these.
8. Use `wrapImperative()` for imperative libraries (Chart.js, D3, etc.).
9. Use `VirtualList` for lists over ~1000 items; use `.map()` for smaller lists.
10. There is no JSX. There are no React hooks. There is no virtual DOM. Do not use patterns from other frameworks.
11. `configureRouter({ hash: true })` must be called BEFORE any Router or navigate call.
12. Forms require two-way binding: `value=${() => signal()} oninput=${handler}`.
13. `createResource()` requires manual `.dispose()` if the component can be torn down during fetch.

## DO

- Use `createSignal()` for local reactive state
- Use `createComputed()` for derived values
- Use `createEffect()` for side effects
- Use `() =>` closures in templates for reactive bindings
- Use `batch()` for multiple signal updates
- Keep components small and focused
- Use TypeScript strict mode
- Use `createStore()` for shared state across components
- Use `createPersisted()` for data that survives page reload
- Use `configureRouter({ hash: true })` for GitHub Pages / static hosting

## DO NOT

- Use React hooks (useState, useEffect, useMemo, etc.)
- Use virtual DOM patterns or JSX syntax
- Use `document.createElement` directly for UI (use `html` template instead)
- Mutate signal values in place
- Use `innerHTML` or string concatenation for DOM construction
- Use `eval`, `new Function`, or `setTimeout` with strings
- Install separate npm packages for routing, state management, or forms
- Create global store singletons (use signals, stores, or the DI system)
- Add keyed-list helpers alongside `.map()` and `VirtualList`
- Introduce a second element-construction API alongside `html`
