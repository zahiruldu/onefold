# AGENTS.md

Coding conventions for AI assistants (Claude, Copilot, Cursor, etc.) working with onefold. Read this before generating onefold code.

Full API documentation: [onefoldjs.com](https://onefoldjs.com)

Key documentation pages:
- [Signals](https://onefoldjs.com/#/core/signals)
- [Templates](https://onefoldjs.com/#/core/templates)
- [Routing](https://onefoldjs.com/#/routing/router)
- [configureRouter](https://onefoldjs.com/#/routing/configure)
- [State Management](https://onefoldjs.com/#/state/store)
- [Forms](https://onefoldjs.com/#/forms/create-form)
- [HTTP Client](https://onefoldjs.com/#/data/http-client)
- [Microfrontends](https://onefoldjs.com/#/microfrontends/load-remote)
- [Security](https://onefoldjs.com/#/microfrontends/security)
- [SSR](https://onefoldjs.com/#/ssr)
- [Deployment](https://onefoldjs.com/#/deployment/github-pages)

## Architecture

onefold has no virtual DOM and no compiler. The `html` tagged template literal parses its template string at runtime and builds real DOM nodes directly. Reactivity is per-binding: a signal read inside a closure creates one effect that updates only that specific DOM node when the signal changes. Nothing else re-renders.

## Imports

The core package exports rendering primitives. Enterprise features use sub-path imports:

```ts
import { createSignal, html, mount, Router, createStore } from 'onefold';       // core
import { createForm, required } from 'onefold/form';                             // forms
import { createHttpClient } from 'onefold/http';                                 // http
import { createI18n } from 'onefold/i18n';                                       // i18n
import { createPersisted } from 'onefold/persist';                               // persistence
import { createTheme } from 'onefold/theme';                                     // theming
import { setPermissions, guard } from 'onefold/guard';                           // RBAC
import { VirtualList } from 'onefold/virtual-list';                              // windowing
import { Suspense } from 'onefold/suspense';                                     // async
import { Transition } from 'onefold/transition';                                 // animations
import { enableDevtools } from 'onefold/devtools';                               // dev tools
import { renderHTML } from 'onefold/ssr';                                        // server
import { setEffectHook, registerDirective } from 'onefold/extend';               // extensibility
```

Do NOT import enterprise features from `'onefold'` — they are not exported there.

## Rules

These are non-negotiable. Violating them breaks security or reactivity guarantees.

### Reactivity

1. **Wrap dynamic values in a closure to make them reactive.**
   ```ts
   // Static (renders once, never updates)
   html`<p>${count}</p>`

   // Reactive (updates when count changes)
   html`<p>${() => count()}</p>`
   ```
   This is the single most common mistake. If the UI "isn't updating," this is why.

2. **Never mutate arrays or objects in place.** Signals compare by reference (`Object.is`). Always produce a new reference:
   ```ts
   // Wrong
   items.peek().push(newItem);

   // Correct
   items.set(prev => [...prev, newItem]);
   ```

3. **Use `batch()` for multiple signal writes** that should trigger effects only once:
   ```ts
   batch(() => {
     name.set('Alice');
     age.set(30);
   });
   ```

### Security

4. **Never use `innerHTML` directly.** The only sanctioned way to insert markup is `raw()` from onefold, and only for developer-authored content — never for user input. For user-generated HTML (comments, rich text editors, markdown output), pipe through [DOMPurify](https://github.com/cure53/DOMPurify) before calling `raw()`.

5. **Never use `eval`, `new Function`, or string-based timers.** The library uses none; keep it that way so CSP with no `unsafe-eval` always works.

6. **Never concatenate user input into URL attributes** (`href`, `src`, `action`). The framework blocks `javascript:` and `data:` schemes, but treat that as a safety net, not a design choice.

### Events

7. **Event handlers start with `on` and take a function**, not a string:
   ```ts
   html`<button onclick=${() => save()}>Save</button>`
   ```

### Integration

8. **Use `wrapImperative()` for imperative libraries** (Chart.js, D3, Leaflet, etc.) instead of manual `document.createElement` and lifecycle management. It provides automatic cleanup when the node leaves the DOM.

9. **Use `embedForeign()` for other frameworks** (React, Vue components) instead of manual mounting/unmounting.

10. **Use `registerDirective()` for reusable DOM behaviors** instead of one-off imperative code inside components:
    ```ts
    registerDirective('tooltip', (el, value) => { /* ... */ });
    // Then in templates:
    html`<button d-tooltip="Save changes">Save</button>`
    ```

### Cleanup

11. **`createResource()` requires manual disposal** if the component can be torn down while a fetch is pending. Call `.dispose()` yourself — resources have no DOM node for automatic cleanup.

## Templates

`html` is the only templating primitive. There is no JSX, no hyperscript function, and no separate list API.

```ts
// Text (reactive)
html`<p>${() => message()}</p>`

// Attributes (reactive)
html`<div class=${() => active() ? 'on' : 'off'}>...</div>`

// Style (object)
html`<div style=${{ color: 'red', fontSize: '16px' }}>...</div>`

// Events
html`<button onclick=${handleClick}>Click</button>`

// Refs
html`<input ref=${(el) => el.focus()} />`

// Two-way input binding (value reads signal, oninput writes signal)
// Required for form.reset() or signal.set('') to visually clear the input
html`<input value=${() => name()} oninput=${(e) => name.set(e.target.value)} />`

// Lists
html`<ul>${() => items().map(item => html`<li>${item.name}</li>`)}</ul>`

// Directives
html`<div d-tooltip="Hello">Hover me</div>`

// Spread props
html`<div ${{ id: 'main', role: 'region' }}>...</div>`
```

## Rendering Lists

Two patterns. Choose by size:

**Below ~1000 visible rows** — use `.map()`:
```ts
html`<ul>${() => items().map(item => html`<li>${item.name}</li>`)}</ul>`
```

This is not "the simple option." The reactive binding already diffs at the anchor level — only the content produced by that expression is replaced, not the surrounding template.

**Above ~1000 rows** — use `VirtualList`:
```ts
VirtualList({
  items: rows,
  itemHeight: 40,
  height: 600,
  renderRow: (row) => html`<div>${row.name}</div>`,
});
```

Do not introduce a third list API. These two cover every case.

## Component Pattern

Components are plain functions returning `Node`. No classes, no decorators, no lifecycle methods.

```ts
import { createSignal, html, type Signal } from 'onefold';

interface Props {
  label: string;
}

export function Toggle({ label }: Props): Node {
  const on: Signal<boolean> = createSignal(false);

  return html`
    <button
      onclick=${() => on.set(v => !v)}
      class=${() => on() ? 'active' : ''}
    >${() => `${label}: ${on() ? 'On' : 'Off'}`}</button>
  `;
}
```

## Project Structure

```
src/
  components/    One file per component, PascalCase filename
  state/         Signals and stores shared across components
  routes/        One file per route, default export is () => Node
  main.ts        Calls mount() once
```

## TypeScript

The library builds under `strict: true` with `noUncheckedIndexedAccess: true`. Match this in consumer `tsconfig.json`. The types are designed to make illegal states fail at compile time — loosening strict mode defeats that.

## What Not To Do

- Do not add a virtual DOM diffing layer or JSX transform. These are different architectures with different tradeoffs.
- Do not introduce a second element-construction API (hyperscript, JSX) alongside `html`.
- Do not add a keyed-list helper alongside `.map()` and `VirtualList`.
- Do not create global store singletons. Use signals, `createStore`, or the DI system (`provide`/`inject`).

onefold deliberately has one way to build nodes and two ways to render lists (by size threshold, not preference). Adding alternatives creates the "multiple ways to do the same thing" problem this framework exists to avoid.
