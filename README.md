# onefold

A tiny, dependency-free TypeScript UI library: fine-grained reactivity (signals),
real DOM rendering (no virtual DOM), secure-by-default templating, a minimal router,
and a store helper. Ships as plain ESM so it runs anywhere JS runs — browsers,
Node SSR contexts, React Native's JS engine, Electron, etc.

**Measured, not claimed:** 4.3kb minified / ~1.9kb gzipped for the entire library
(reactivity + DOM + router + store), zero runtime dependencies, builds clean under
TypeScript `strict` mode.

## Why this exists / honest scope

"Faster and more secure than everything on the market" isn't a claim any single
library can prove — frameworks make different tradeoffs for different jobs. What
this delivers concretely:

- **Fast**: no virtual DOM diffing. Each signal is wired directly to the exact DOM
  node/attribute that depends on it, so updates are O(1) per change, not O(tree size).
- **Secure by default**: text interpolation always goes through `textContent`, never
  `innerHTML` — so you cannot accidentally write an XSS bug the way you can with
  string-templated HTML. Inserting real markup requires the explicit `raw()` escape
  hatch, which is sanitized and clearly named so it's greppable in code review.
- **Easy to use**: one templating primitive — the `html`\`...\` tagged template —
  plus `createSignal`/`createEffect`/`createComputed`. No CLI, no compiler, no JSX,
  no second "keyed list" API to learn on top of `.map()`. See "Rendering lists"
  below for why that's a deliberate design choice, not a missing feature.
- **AI-agent friendly**: see `AGENTS.md` — explicit rules an assistant can follow
  instead of inferring conventions from scattered examples.

What it deliberately does **not** do: SSR/hydration in the core (see the separate
`renderToString`/`renderToStringAsync` primitives if you need basic SSR), JSX, or
CSS-in-JS beyond the built-in `css`\`...\` scoped-style helper. Those are real
engineering projects in their own right — bolting them on to make a marketing claim
would just make the security/perf guarantees harder to audit.

## Install

```bash
npm install onefold
```

Or, since it's dependency-free and small, drop `dist/onefold.min.js` in directly.

## Quickstart

```ts
import { createSignal, html, mount } from 'onefold';

function Counter() {
  const count = createSignal(0);

  return html`
    <div class="counter">
      <h2>${() => `Count: ${count()}`}</h2>
      <p>${() => `Doubled: ${count() * 2}`}</p>
      <button onclick=${() => count.set((c) => c - 1)}>-</button>
      <button onclick=${() => count.set((c) => c + 1)}>+</button>
      <button onclick=${() => count.set(0)}>Reset</button>
    </div>
  `;
}

mount(Counter(), document.getElementById('app')!);
```

## HTML Templates

The `html` tagged template literal is the one templating primitive — write UI that
looks like regular HTML, with dynamic values interpolated naturally. No hyperscript
nesting, no JSX compiler, no second API to reach for:

```ts
// Reactive class as object
html`<div class=${() => ({ active: isActive(), disabled: isOff() })}>...</div>`

// Spread props
const attrs = { id: 'main', role: 'region' };
html`<section ${attrs}>...</section>`

// Nested templates & lists
html`
  <ul>
    ${() => items().map(item => html`<li>${item.name}</li>`)}
  </ul>
`

// Self-closing tags
html`<input type="text" oninput=${handleInput} />`
```

Text interpolations always go through `textContent` (never `innerHTML`), so XSS
from dynamic data is structurally impossible in the default path.

`html` also supports `ref`, directives (`d-*`), style objects, and reactive
attributes/children generally — see the API table below.

## Rendering lists

There is exactly one pattern for any list up to roughly 500–1000 visible rows:

```ts
html`<ul>${() => items().map((item) => html`<li>${item.name}</li>`)}</ul>`
```

This isn't "the simple option that doesn't scale" — `html`'s reactive-child
binding already diffs at the anchor level, so when `items()` changes, only the
content produced by that one expression is torn down and rebuilt, not the whole
surrounding template. There's no separate keyed-list helper because there's
nothing a second API would buy you below the point where windowing matters.

Above that threshold (or for anything described as a "table", "grid", or "feed"
that could grow large), reach for `VirtualList` — not as a stylistic alternative
to `.map()`, but because mounting one real DOM node per row is the actual
bottleneck at that scale, and only windowing avoids it:

```ts
import { createSignal, VirtualList, html } from 'onefold';

const rows = createSignal(fetchedRows); // could be 100,000+ items

const table = VirtualList({
  items: rows,
  itemHeight: 32,  // fixed row height in px — required for windowing math
  height: 600,     // visible viewport height in px
  renderRow: (row) => html`<div class="row">${row.name} — ${row.value}</div>`,
});
```

## API

| Function | Purpose |
|---|---|
| `createSignal(initial)` | Reactive value: `sig()` reads, `sig.set(v)` writes, `sig.peek()` reads without subscribing |
| `createEffect(fn)` | Re-run `fn` when any signal it reads changes; returns a disposer |
| `createComputed(fn)` | Read-only signal derived from other signals |
| `batch(fn)` | Coalesce multiple `.set()` calls into one effect flush |
| `html\`...\`` | The one templating primitive — real DOM nodes, reactive attributes/children, `ref`, directives |
| `mount(node, container)` | Attach a node to the page (clears the container first) |
| `raw(html)` | Explicit, sanitized opt-in to insert HTML instead of text |
| `VirtualList(options)` | Windowed rendering for large tables/lists — constant DOM node count regardless of row count |
| `lazy(loader, fallback)` | Code-split a component behind `import()`, for route/feature-level bundle splitting |
| `wrapImperative(adapter)` | Mount any imperative npm package (Chart.js, D3, Leaflet, Monaco, ...) with automatic cleanup |
| `embedForeign(adapter)` | Embed a component from another framework (React, Vue) inside a onefold tree |
| `registerDirective(name, handler)` | Add a custom `d-name` attribute behavior, reusable across components |
| `setEffectHook(hook)` | Intercept every effect run — for devtools, logging, time-travel debugging |
| `createStore(initial)` | A signal over an object plus `.update(patch)` for partial merges |
| `Router(routes, notFound)`, `navigate(path)` | Minimal client-side routing via the History API |

onefold ships considerably more than this table (DI, forms, i18n, HTTP client
with interceptors, persisted signals, RBAC guards, theming, observability,
plugins, microfrontend loading, Suspense/ErrorBoundary/Transition, WebSocket/SSE
streams, a11y helpers, SSR primitives) — this table covers only the rendering
core. See `src/index.ts` for the full export list, and `AGENTS.md` for the rules
an AI assistant should follow when writing onefold code.

See `examples/counter.ts`, `examples/todo.ts`, and `examples/bench-virtual-list.ts` for
working code.

## Real DOM vs virtual DOM — and large tables

onefold uses fine-grained signals bound directly to real DOM nodes, not a virtual DOM.
There's no diffing phase: when a signal changes, exactly the DOM node or attribute that
reads it updates — nothing is re-rendered or compared. This is the same architecture
class as Solid.js and Svelte 5 runes, and it's measurably faster than virtual-DOM
reconciliation on update-heavy workloads because it skips the diff step entirely.

That architecture alone does **not** solve large tables — a naive renderer still creates
one DOM node per row, and 50,000 live nodes are slow to lay out no matter which framework
made them. The actual fix is windowing: `VirtualList()` only mounts nodes for rows in the
visible viewport (+ a small overscan buffer), so DOM node count stays constant regardless
of dataset size. `examples/bench-virtual-list.ts` demonstrates this under jsdom: mounting
a 100,000-row list renders ~28 DOM nodes (viewport-sized) in under 20ms, and updating a
single row deep in the array completes in low single-digit milliseconds — because the
signal update only re-runs the one row's binding, not a re-render of the list.

## npm interop and framework embedding

Because a onefold component is just a function returning a real DOM `Node`, any
imperative npm package works via a plain `ref`-style pattern — `wrapImperative()` wraps
this into a reusable shape with automatic teardown when the element is removed from the
DOM (via `MutationObserver`, no dependency on onefold's own lifecycle). `embedForeign()`
does the same for mounting a component from another framework (e.g. a React island) inside
a onefold tree, without onefold taking a hard dependency on that framework.

## Extensibility

- **Directives** (`registerDirective`) — reusable `d-name` attribute behaviors, the same
  shape as Vue directives, so ports from Vue/Alpine are close to mechanical.
- **Effect hook** (`setEffectHook`) — wraps every effect run, e.g. to build a devtools
  timeline or structured logging without modifying the core.
- **Code-splitting** (`lazy`) — defers loading a component's module until it's actually
  rendered, for route-level or feature-level bundles in large apps.


## Security model

All security-relevant code lives in `src/security/sanitize.ts` — one file to audit:

- No `eval`/`new Function` anywhere in the library, so a strict CSP (`script-src 'self'`,
  no `unsafe-eval`) works unmodified.
- Text is never parsed as HTML unless you explicitly call `raw()`.
- `href`/`src`/`action` attributes reject `javascript:`, `vbscript:`, and all `data:` schemes.
- `raw()` runs a minimal allowlist sanitizer (strips `<script>`, `<style>`, `on*`
  handlers, unsafe URL schemes). For HTML that originates from *users* rather than
  your own source code, pipe it through DOMPurify before calling `raw()` — this
  library's sanitizer is a safety net for developer mistakes, not a defense against
  adversarial input.
- **Trusted Types**: on browsers that support it (Chrome/Edge), if your CSP sets
  `require-trusted-types-for 'script'`, onefold registers its own Trusted Types
  policy so `raw()` keeps working instead of being blocked outright — and that
  policy re-runs `minimalSanitize`, so it's a second enforcement layer, not a bypass.

## Build

```bash
npm run build       # tsc, emits dist/ with .d.ts files
npx esbuild src/index.ts --bundle --minify --format=esm --outfile=dist/onefold.min.js
```
