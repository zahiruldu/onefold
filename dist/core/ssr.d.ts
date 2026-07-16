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
export interface SSROptions {
    /** Strip data- attributes used internally (data-remote, data-transition, etc.). Default: true. */
    stripInternalAttrs?: boolean;
    /** Pretty-print the HTML output. Default: false. */
    prettyPrint?: boolean;
}
/**
 * Render a component to an HTML string.
 * Executes the component synchronously and serializes the resulting DOM.
 *
 * Requires a DOM environment (jsdom in Node, or native in browser/Deno).
 */
export declare function renderToString(componentFn: () => Node, options?: SSROptions): string;
/**
 * Render a component to an HTML string (async version).
 * Waits for any top-level promises (Suspense boundaries) to resolve before serializing.
 */
export declare function renderToStringAsync(componentFn: () => Node | Promise<Node>, options?: SSROptions): Promise<string>;
