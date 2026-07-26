<p align="center">
  <a href="https://onefoldjs.com">
    <img src="https://onefoldjs.com/images/logo.svg" alt="onefold" width="128" height="128" />
  </a>
</p>

<h1 align="center">onefold</h1>

<p align="center">
  A reactive UI framework for building web applications<br>using TypeScript with fine-grained signals and real DOM rendering.
</p>

<p align="center">
  <a href="https://onefoldjs.com"><strong>Documentation</strong></a>
  &middot;
  <a href="https://github.com/zahiruldu/onefold/issues">Report a Bug</a>
  &middot;
  <a href="https://www.npmjs.com/package/create-onefold">Scaffold a Project</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/onefold"><img src="https://img.shields.io/npm/v/onefold.svg?style=flat" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/onefold"><img src="https://img.shields.io/bundlephobia/minzip/onefold" alt="bundle size" /></a>
  <a href="https://github.com/zahiruldu/onefold/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" /></a>
</p>

<hr>

- **Fine-grained reactivity:** Each signal update touches only the exact DOM node that depends on it. No virtual DOM, no tree diffing, no reconciliation pass. Updates are O(1) per change.
- **Secure by default:** Text interpolation uses `textContent`, never `innerHTML`. XSS from dynamic data is structurally impossible in the default path. No `eval` anywhere — strict CSP works unmodified.
- **Complete toolkit:** Routing, state, forms, i18n, theming, HTTP client, SSR, accessibility, microfrontend security, and more — all in one 3kb package with zero dependencies.
- **TypeScript-first:** Full strict mode, no `any` escape hatches, illegal states fail at compile time.

[Learn how to use onefold in your project](https://onefoldjs.com).

## Getting Started

Create a new project:

```bash
npm create onefold@latest my-app
cd my-app
npm install
npm run dev
```

Or add to an existing project:

```bash
npm install onefold
```

## Documentation

You can find the onefold documentation [on the website](https://onefoldjs.com).

The documentation covers:

- [Installation](https://onefoldjs.com/#/getting-started/install)
- [Quick Start](https://onefoldjs.com/#/getting-started/quickstart)
- [Signals (Reactivity)](https://onefoldjs.com/#/core/signals)
- [Templates](https://onefoldjs.com/#/core/templates)
- [Routing](https://onefoldjs.com/#/routing/router)
- [Router Configuration](https://onefoldjs.com/#/routing/configure)
- [State Management](https://onefoldjs.com/#/state/store)
- [Forms & Validation](https://onefoldjs.com/#/forms/create-form)
- [HTTP Client](https://onefoldjs.com/#/data/http-client)
- [Microfrontends](https://onefoldjs.com/#/microfrontends/load-remote)
- [Server-Side Rendering](https://onefoldjs.com/#/ssr)
- [Deployment](https://onefoldjs.com/#/deployment/github-pages)
- [CLI (create-onefold)](https://onefoldjs.com/#/cli)
- [Playground](https://onefoldjs.com/#/playground)

## Examples

Here is a basic example to get you started:

```ts
import { createSignal, html, mount } from 'onefold';

function Counter(): Node {
  const count = createSignal(0);

  return html`
    <div>
      <h1>Count: ${() => count()}</h1>
      <button onclick=${() => count.set(n => n - 1)}>-</button>
      <button onclick=${() => count.set(n => n + 1)}>+</button>
    </div>
  `;
}

mount(Counter(), document.getElementById('app')!);
```

You'll notice we use a tagged template literal called `html`. It builds real DOM nodes with reactive bindings — no compiler, no JSX transform, no build step required for development.

More examples are available in the repository:

- **blog-app** — Multi-page SPA with routing and pages
- **hero-app** — Full-stack app with auth, forms, and API integration
- **comprehensive-app** — Feature showcase across the full API surface
- **microfrontend** — Host shell with independently-deployed remote widgets
- **ssr-app** — Server-side rendering with Express, selective hydration, async data

## Contributing

The main purpose of this repository is to continue evolving onefold, making it faster, smaller, and easier to use. Development happens in the open on GitHub, and we welcome contributions of all kinds.

Read [AGENTS.md](./AGENTS.md) to learn about coding conventions that apply to both human and AI contributors.

### Good First Issues

To help you get started, look for issues labeled [`good first issue`](https://github.com/zahiruldu/onefold/labels/good%20first%20issue).

## Ecosystem

- [onefold](https://www.npmjs.com/package/onefold) — The framework
- [create-onefold](https://www.npmjs.com/package/create-onefold) — Project scaffolding CLI
- [onefoldjs.com](https://onefoldjs.com) — Official documentation site

## License

onefold is [MIT licensed](./LICENSE).
