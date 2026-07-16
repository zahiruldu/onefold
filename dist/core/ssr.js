/**
 * SSR Primitives — renderToString for server-side rendering.
 *
 * Converts a onefold component tree into an HTML string for sending
 * from a server to the client. This enables SEO, faster initial paint,
 * and works with any Node.js server framework (Express, Fastify, Hono, etc.).
 *
 * Note: Requires a DOM implementation in Node (jsdom). The framework already
 * uses jsdom for testing, so this adds no new dependency.
 *
 * Usage:
 * ```ts
 * // server.ts
 * import { renderToString } from 'onefold/ssr';
 * import { App } from './App';
 *
 * const html = renderToString(() => App());
 * res.send(`<!DOCTYPE html><html><body><div id="app">${html}</div></body></html>`);
 *
 * // For components with async data (Suspense boundaries), use the async variant:
 * const html = await renderToStringAsync(async () => { ...; return App(); });
 * ```
 *
 * Streaming SSR (renderToStream) is not implemented in core — it requires a
 * Node/Web Streams integration that belongs in a platform-specific adapter
 * package, not the zero-dependency core.
 *
 * Hydration: The client picks up where SSR left off by calling mount()
 * on the same container — signals bind to the existing DOM nodes.
 */
/* ────────────────── Implementation ────────────────── */
/**
 * Render a component to an HTML string.
 * Executes the component synchronously and serializes the resulting DOM.
 *
 * Requires a DOM environment (jsdom in Node, or native in browser/Deno).
 */
export function renderToString(componentFn, options) {
    const { stripInternalAttrs = true } = options ?? {};
    const node = componentFn();
    let html = serializeNode(node);
    if (stripInternalAttrs) {
        html = html.replace(/\s*data-(remote|transition|suspense|error-boundary)="[^"]*"/g, '');
        html = stripReactiveAnchors(html);
    }
    return html;
}
/**
 * Render a component to an HTML string (async version).
 * Waits for any top-level promises (Suspense boundaries) to resolve before serializing.
 */
export async function renderToStringAsync(componentFn, options) {
    const result = componentFn();
    const node = result instanceof Promise ? await result : result;
    const { stripInternalAttrs = true } = options ?? {};
    let html = serializeNode(node);
    if (stripInternalAttrs) {
        html = html.replace(/\s*data-(remote|transition|suspense|error-boundary)="[^"]*"/g, '');
        html = stripReactiveAnchors(html);
    }
    return html;
}
/**
 * Remove the paired `<!--expr-start-->...<!--expr-end-->` anchor comments that
 * `html`'s reactive bindings use to know where to patch the DOM on the client.
 * They carry no meaning in a server-rendered string (there is currently no
 * hydration step that reads them back), so leaving them in only bloats the
 * payload — this collapses each pair down to its inner content.
 */
function stripReactiveAnchors(fragment) {
    return fragment
        .replace(/<!--expr-start-->/g, '')
        .replace(/<!--expr-end-->/g, '');
}
/**
 * Serialize a DOM node to HTML string.
 */
function serializeNode(node) {
    if (node.nodeType === 3 /* TEXT */) {
        return escapeHtml(node.textContent ?? '');
    }
    if (node.nodeType === 8 /* COMMENT */) {
        // Strip -- sequences to prevent comment breakout attacks
        const safe = (node.textContent ?? '').replace(/--/g, '');
        return `<!--${safe}-->`;
    }
    if (node.nodeType === 11 /* DOCUMENT_FRAGMENT */) {
        let html = '';
        node.childNodes.forEach((child) => { html += serializeNode(child); });
        return html;
    }
    if (node.nodeType !== 1 /* ELEMENT */) {
        return '';
    }
    const el = node;
    const tag = el.tagName.toLowerCase();
    // Self-closing tags
    const VOID_ELEMENTS = new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr',
    ]);
    // Build attributes string
    let attrs = '';
    for (const attr of Array.from(el.attributes)) {
        attrs += ` ${attr.name}="${escapeAttr(attr.value)}"`;
    }
    // Inline styles (if any were set via style property, not attribute)
    if (el.style.cssText && !el.getAttribute('style')) {
        attrs += ` style="${escapeAttr(el.style.cssText)}"`;
    }
    if (VOID_ELEMENTS.has(tag)) {
        return `<${tag}${attrs} />`;
    }
    // Serialize children
    let children = '';
    el.childNodes.forEach((child) => { children += serializeNode(child); });
    return `<${tag}${attrs}>${children}</${tag}>`;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function escapeAttr(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
