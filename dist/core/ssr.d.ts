/**
 * Token-level string renderer for SSR.
 *
 * Zero dependencies. No jsdom. No DOM API. Pure string output.
 * Reuses the same tokenizer as the client-side `html` template —
 * same parsing, same escaping, different output target.
 *
 * Tree-shakable: if you never import `renderHTML`, this module is
 * completely eliminated from the client bundle.
 *
 * Usage:
 * ```ts
 * // server.ts — only runs on server
 * import { renderHTML } from 'onefold';
 * import { HomePage } from './pages/Home';
 *
 * const html = renderHTML(() => HomePage());
 * res.send(`<div id="app">${html}</div>`);
 *
 * // Async (with data fetching):
 * const html = await renderHTML(async () => {
 *   const data = await fetch('/api/data').then(r => r.json());
 *   return DataPage({ data });
 * });
 * ```
 */
/**
 * Render a component to an HTML string on the server.
 * Zero dependencies — no jsdom, no DOM API required.
 *
 * The component function runs with a special `html` that returns strings
 * instead of DOM nodes. Reactive expressions are evaluated once (snapshot).
 * Event handlers are stripped from output.
 *
 * @example
 * ```ts
 * import { renderHTML } from 'onefold';
 *
 * // Sync
 * const result = renderHTML(() => html`<h1>Hello</h1>`);
 *
 * // Async (with data fetching)
 * const result = await renderHTML(async () => {
 *   const users = await db.getUsers();
 *   return html`<ul>${users.map(u => html`<li>${u.name}</li>`)}</ul>`;
 * });
 * ```
 */
export declare function renderHTML(componentFn: () => unknown | Promise<unknown>): string | Promise<string>;
