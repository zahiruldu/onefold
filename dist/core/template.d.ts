/**
 * Tagged template literal API for writing HTML-like templates with reactive bindings.
 *
 * Usage:
 *   html`<div class=${cls}><p>${() => count()}</p></div>`
 *
 * This parses the template string at runtime into real DOM nodes using the same
 * secure path as `h()` — text interpolations go through `textContent`, never
 * `innerHTML`, so XSS is structurally impossible in the default path.
 *
 * Reactive values (signals or closures) are bound via `createEffect` just like `h()`.
 */
/**
 * Tagged template literal for writing HTML templates with reactive data binding.
 *
 * Text interpolations are always safe (textContent, never innerHTML).
 * Reactive values (signals/closures) auto-update the DOM when they change.
 *
 * @example
 * ```ts
 * const count = createSignal(0);
 *
 * const view = html`
 *   <div class="counter">
 *     <h2>${() => `Count: ${count()}`}</h2>
 *     <button onclick=${() => count.set(c => c + 1)}>+</button>
 *   </div>
 * `;
 * ```
 */
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): Node;
