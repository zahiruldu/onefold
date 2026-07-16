/**
 * Component-scoped CSS.
 *
 * Usage:
 * ```ts
 * const styles = css`
 *   .card { background: white; border-radius: 8px; }
 *   .title { font-size: 18px; }
 *   button { padding: 8px 12px; }
 * `;
 *
 * function MyComponent() {
 *   return html`<div class=${styles.scope}>
 *     <h2 class="title">Hello</h2>
 *     <div class="card">...</div>
 *   </div>`;
 * }
 * ```
 *
 * Every selector in the CSS block gets automatically prefixed with a unique scope class
 * so styles don't leak to other components. The `<style>` element is injected once into
 * `<head>` and deduplicated — calling `css` with the same template produces the same scope.
 */
export interface ScopedStyle {
    /** The scope class to attach to your component's root element. */
    scope: string;
    /** The generated stylesheet text (for SSR or inspection). */
    css: string;
}
/**
 * Tagged template for component-scoped CSS. Returns a `ScopedStyle` with a `.scope` class
 * to attach to your component root.
 *
 * Styles are automatically prefixed with a unique class so they don't leak.
 * The `<style>` is injected once into `<head>` and deduplicated across renders.
 */
export declare function css(strings: TemplateStringsArray, ...values: unknown[]): ScopedStyle;
/**
 * Sanitize a CSS value to prevent injection attacks when interpolating
 * untrusted data into css`` templates.
 *
 * Strips characters that could break out of a CSS declaration: { } ; < >
 * and blocks url() expressions that could exfiltrate data.
 *
 * Usage:
 * ```ts
 * css`.card { background: ${cssValue(userColor)}; }`
 * ```
 */
export declare function cssValue(value: string): string;
