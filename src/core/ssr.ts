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

import { _tokenize, _setSSRMode } from './template';
import { isUnsafeUrl, isEventAttribute } from '../security/sanitize';

/* ────────────────── HTML escaping ────────────────── */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ────────────────── Void elements (self-closing, no </tag>) ────────────────── */

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

/* ────────────────── Token kind constants (mirrors template.ts const enum) ────────────────── */

const TK_OPEN = 0;   // OpenTag
const TK_CLOSE = 1;  // CloseTag
const TK_ATTR = 2;   // Attr
const TK_TEXT = 3;    // Text
const TK_EXPR = 4;   // Expr

/* ────────────────── Core: tokens → HTML string ────────────────── */

function tokensToString(tokens: { kind: number; tag?: string; name?: string; value?: unknown }[]): string {
  let html = '';
  let tagOpen = false; // whether we're inside an opening tag (haven't closed with >)

  for (const token of tokens) {
    switch (token.kind) {
      case TK_OPEN: {
        if (tagOpen) html += '>'; // close previous opening tag
        html += `<${token.tag}`;
        tagOpen = true;
        break;
      }
      case TK_CLOSE: {
        if (tagOpen) {
          // Self-closing or void element
          if (VOID_ELEMENTS.has(token.tag!)) {
            html += ' />';
          } else {
            html += `></${token.tag}>`;
          }
          tagOpen = false;
        } else {
          html += `</${token.tag}>`;
        }
        break;
      }
      case TK_ATTR: {
        const name = token.name!;
        let value = token.value;

        // Skip event handlers — they can't execute in static HTML
        if (isEventAttribute(name)) break;

        // Skip ref — it's a client-side concept
        if (name === 'ref') break;

        // Evaluate reactive values (call functions once)
        if (typeof value === 'function') {
          value = (value as () => unknown)();
        }

        // Skip false/null/undefined attributes
        if (value === false || value == null) break;

        // Boolean true → attribute with no value
        if (value === true) {
          html += ` ${name}`;
          break;
        }

        const str = String(value);

        // Security: block unsafe URL schemes
        if ((name === 'href' || name === 'src' || name === 'action' || name === 'formaction' || name === 'xlink:href') && isUnsafeUrl(str)) {
          break;
        }

        // Style object → CSS string
        if (name === 'style' && typeof value === 'object') {
          const cssStr = Object.entries(value as Record<string, string>)
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v}`)
            .join(';');
          html += ` style="${escapeAttr(cssStr)}"`;
          break;
        }

        // Class object → space-separated string
        if (name === 'class' && typeof value === 'object' && !Array.isArray(value)) {
          const clsStr = Object.entries(value as Record<string, boolean>)
            .filter(([, on]) => on)
            .map(([n]) => n)
            .join(' ');
          html += ` class="${escapeAttr(clsStr)}"`;
          break;
        }

        html += ` ${name}="${escapeAttr(str)}"`;
        break;
      }
      case TK_TEXT: {
        if (tagOpen) { html += '>'; tagOpen = false; }
        html += escapeHtml(token.value as string);
        break;
      }
      case TK_EXPR: {
        if (tagOpen) { html += '>'; tagOpen = false; }
        let value = token.value;

        // Evaluate reactive expressions (call functions once)
        if (typeof value === 'function') {
          value = (value as () => unknown)();
        }

        // Null/undefined/boolean → nothing
        if (value == null || value === false || value === true) break;

        // Array → render each item
        if (Array.isArray(value)) {
          for (const item of value) {
            html += renderValue(item);
          }
          break;
        }

        // Node-like (result of nested html`...` in SSR mode)
        if (typeof value === 'object' && '_ssrHtml' in (value as object)) {
          html += (value as { _ssrHtml: string })._ssrHtml;
          break;
        }

        // String/number → escaped text
        html += escapeHtml(String(value));
        break;
      }
    }
  }

  // Close any remaining open tag
  if (tagOpen) html += '>';

  return html;
}

function renderValue(value: unknown): string {
  if (value == null || value === false || value === true) return '';
  if (typeof value === 'function') value = (value as () => unknown)();
  if (value == null || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (typeof value === 'object' && '_ssrHtml' in (value as object)) {
    return (value as { _ssrHtml: string })._ssrHtml;
  }
  return escapeHtml(String(value));
}

/* ────────────────── SSR-mode html tag ────────────────── */

/**
 * SSR version of the `html` tagged template.
 * Returns a lightweight object with the rendered HTML string.
 * Used internally by renderHTML — same syntax as client html`...`.
 */
function ssrHtml(strings: TemplateStringsArray, ...values: unknown[]): { _ssrHtml: string } {
  const tokens = _tokenize(strings, values);
  return { _ssrHtml: tokensToString(tokens) };
}

/* ────────────────── Public API ────────────────── */

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
export function renderHTML(
  componentFn: () => unknown | Promise<unknown>
): string | Promise<string> {
  _setSSRMode(ssrHtml);

  try {
    const result = componentFn();

    if (result instanceof Promise) {
      return result.then((node) => {
        const output = extractHtml(node);
        _setSSRMode(null);
        return output;
      }).catch((err) => {
        _setSSRMode(null);
        throw err;
      });
    }

    const output = extractHtml(result);
    _setSSRMode(null);
    return output;
  } catch (err) {
    _setSSRMode(null);
    throw err;
  }
}

function extractHtml(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object' && '_ssrHtml' in (value as object)) {
    return (value as { _ssrHtml: string })._ssrHtml;
  }
  if (typeof value === 'string') return escapeHtml(value);
  return '';
}


