# AGENTS.md — Conventions for AI coding assistants

This file exists so any AI assistant (Claude, Copilot, Cursor, etc.) can generate
correct onefold code on the first try, without re-deriving the framework's rules
from examples. Read this before writing onefold code.

## Mental model

There is no virtual DOM and no compiler step. The `html`\`...\` tagged template
literal (from `onefold`) parses its template string once and builds real DOM
nodes directly. Reactivity is per-binding: a signal read inside a closure passed
as a child, attribute, or class/style value creates one `effect` that updates
only that binding when the signal changes. Nothing else re-runs.

**`html` is the only templating primitive.** There is no separate hyperscript
function, no JSX, and no second "keyed list" API — see "Rendering lists" below
for why one function (`.map()`) covers every list size that isn't already large
enough to need windowing.

## Hard rules (violating these breaks security or reactivity guarantees)

1. **Never use `innerHTML` directly.** Text interpolated by `html` always goes
   through `textContent`/`createTextNode`. The only sanctioned way to insert
   markup is `raw()` from `onefold`, and only for developer-authored,
   non-user-controlled HTML.
2. **Never use `eval`, `new Function`, or string-based `setTimeout`/`setInterval`.**
   The library has none; keep it that way so CSP with no `unsafe-eval` always works.
3. **Wrap dynamic values in a closure to make them reactive.** `html\`<p>${count}</p>\``
   renders once, frozen at whatever `count` was when the template ran.
   `html\`<p>${() => count()}</p>\`` updates whenever `count` changes. This is
   the single most common mistake — if a UI "isn't updating," this is why.
4. **Event handler attributes start with `on` and take a plain function**, e.g.
   `` html`<button onclick=${() => ...}>` ``. Do not pass strings.
5. **Never build a URL attribute (`href`, `src`, `action`) by concatenating raw
   user input.** `html` already blocks `javascript:`/`data:` schemes on those
   attributes, but treat that as a last-resort net, not a design choice.
6. **Do not mutate arrays/objects in place and expect updates.** Signals compare
   by reference (`Object.is`). Always call `.set()` with a new array/object:
   `items.set(prev => [...prev, next])`, not `items.peek().push(next)`.
7. **To integrate a non-onefold npm package** (charts, editors, maps, video, or
   a component from another framework), use `wrapImperative()` or
   `embedForeign()` from `onefold` instead of manually calling
   `document.createElement` and managing its lifecycle by hand. These give you
   automatic cleanup when the node is removed.
8. **To add a custom reusable DOM behavior**, register a directive with
   `registerDirective(name, handler)` and use it as a `d-name` attribute in
   `html`, rather than writing one-off imperative code inside a component body.
9. **`createResource()` returns a `dispose()` you must call yourself** if the
   component that created it can be torn down while a fetch could still be
   pending (e.g. it's created outside of a template's reactive scope, or kept
   in module-level state). Unlike `html`'s own bindings, a resource has no DOM
   node for the framework to key automatic cleanup off of.

## Rendering lists

There is exactly one pattern below the windowing threshold, and exactly one
above it — do not reach for anything else:

```ts
// Any list, any size up to roughly 500–1000 visible rows:
html`
  <ul>
    ${() => items().map((item) => html`<li>${item.name}</li>`)}
  </ul>
`
```

This is not "the simple but slow option." `html`'s reactive-child binding
already diffs at the anchor level — when `items()` changes, only the content
between that expression's start/end anchor comments is torn down and rebuilt,
not the whole surrounding template. For lists that reorder, filter, or grow
below the windowing threshold, this is the correct default, full stop.

**Above ~500–1000 rows** (or whenever a list is described as a "table",
"grid", or "feed" that could grow large), reach for `VirtualList` instead —
not because `.map()` is "slow" at that point, but because *any* approach that
mounts one real DOM node per row is the bottleneck, and only windowing avoids
that cost:

```ts
import { createSignal, VirtualList, html } from 'onefold';

const rows = createSignal(fetchedRows); // could be 100,000+ items

const table = VirtualList({
  items: rows,
  itemHeight: 32,       // fixed row height in px — required for windowing math
  height: 600,          // visible viewport height in px
  renderRow: (row) => html`<div class="row">${row.name} — ${row.value}</div>`,
});
```

`VirtualList` only mounts nodes for rows in the visible viewport (+ overscan),
so DOM node count stays constant regardless of dataset size — this is the
actual fix for large tables, not a stylistic alternative to `.map()`.

## File/folder layout to follow in consumer apps

```
src/
  components/   one file per component, named export, PascalCase filename
  state/        signals and stores shared across components
  routes/       one file per route, default export is `() => Node`
  main.ts       calls mount() once
```

Component functions are plain functions returning `Node`. No classes, no decorators,
no lifecycle methods to remember — a component's "lifecycle" is just the closures and
`createEffect` calls made while building the node. `html`'s own bindings clean
themselves up automatically when their element leaves the document; if you call
`createEffect` yourself outside of `html` (rare — most components never need to),
capture its disposer and call it when the parent removes the node.

## Idiomatic component template

```ts
import { createSignal, html, type Signal } from 'onefold';

interface Props {
  label: string;
}

export function Toggle({ label }: Props): Node {
  const on: Signal<boolean> = createSignal(false);

  return html`
    <button
      onclick=${() => on.set((v) => !v)}
      class=${() => (on() ? 'active' : '')}
    >${() => `${label}: ${on() ? 'On' : 'Off'}`}</button>
  `;
}
```

## Type-checking

The library builds under `strict: true` with `noUncheckedIndexedAccess: true`. Match
that in consumer `tsconfig.json` — onefold's types are written to make illegal
states (e.g. writing to a computed signal) fail at compile time, and loosening strict
mode throws that away.

## What not to add

Don't reach for a virtual DOM diffing layer, a compiler/JSX transform, or a global
store singleton to "extend" this framework — those are different architectures with
different tradeoffs. If a task needs them, say so explicitly rather than bolting them
on; grafting a vdom onto a fine-grained-signals renderer produces double-updates and
is the most likely way an AI-generated PR against this repo goes subtly wrong.

Don't reintroduce a second element-construction API (a hyperscript function, JSX,
etc.) or a second list-rendering API (a keyed-diff helper) alongside `html` and
`.map()`/`VirtualList`. onefold deliberately has exactly one way to build a node
and exactly two ways to render a list (by size, not by preference) — adding a third
option to either is the "multiple ways to do the same thing" problem this framework
exists to avoid, even if the new option is individually reasonable in isolation.
