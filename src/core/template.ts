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

import { createEffect } from './signal';
import { isEventAttribute, isRawHtml, isUnsafeUrl, toTrustedHtml } from '../security/sanitize';
import { getDirective } from './extend';
import { disposeOnRemove } from './lifecycle';

/* ────────────────────────── Parser types ────────────────────────── */

const enum TokenKind {
  OpenTag,
  CloseTag,
  Attr,
  Text,
  Expr,
}

interface OpenTagToken {
  kind: TokenKind.OpenTag;
  tag: string;
}
interface CloseTagToken {
  kind: TokenKind.CloseTag;
  tag: string;
}
interface AttrToken {
  kind: TokenKind.Attr;
  name: string;
  value: unknown;
}
interface TextToken {
  kind: TokenKind.Text;
  value: string;
}
interface ExprToken {
  kind: TokenKind.Expr;
  value: unknown;
}

type Token = OpenTagToken | CloseTagToken | AttrToken | TextToken | ExprToken;

/* ────────────────────────── Placeholder ────────────────────────── */

const PLACEHOLDER_PREFIX = '\x00nf_';
const PLACEHOLDER_RE = /\x00nf_(\d+)\x00/g;

function placeholder(index: number): string {
  return `${PLACEHOLDER_PREFIX}${index}\x00`;
}

/** Safe char-at that satisfies noUncheckedIndexedAccess by returning '' for out-of-bounds. */
function charAt(s: string, i: number): string {
  return s.charAt(i);
}

/** Extract the capture group index from a placeholder regex match. */
function captureInt(match: RegExpExecArray): number {
  return parseInt(match[1] ?? '0', 10);
}

/* ────────────────────────── Tokenizer ────────────────────────── */

function tokenize(strings: TemplateStringsArray, values: unknown[]): Token[] {
  let source = '';
  for (let i = 0; i < strings.length; i++) {
    source += strings[i];
    if (i < values.length) {
      source += placeholder(i);
    }
  }

  const tokens: Token[] = [];
  let pos = 0;
  const len = source.length;

  while (pos < len) {
    if (charAt(source, pos) === '<') {
      // Skip HTML comments: <!-- ... -->
      if (source.startsWith('<!--', pos)) {
        const commentEnd = source.indexOf('-->', pos + 4);
        pos = commentEnd === -1 ? len : commentEnd + 3;
        continue;
      }

      if (charAt(source, pos + 1) === '/') {
        const end = source.indexOf('>', pos);
        const tag = source.slice(pos + 2, end).trim();
        tokens.push({ kind: TokenKind.CloseTag, tag });
        pos = end + 1;
        continue;
      }

      const tagEnd = findTagEnd(source, pos);
      const selfClosing = charAt(source, tagEnd - 1) === '/';
      const inner = source.slice(pos + 1, selfClosing ? tagEnd - 1 : tagEnd);
      const { tag, attrs } = parseOpenTag(inner, values);
      tokens.push({ kind: TokenKind.OpenTag, tag });
      for (const attr of attrs) tokens.push(attr);
      if (selfClosing) {
        tokens.push({ kind: TokenKind.CloseTag, tag });
      }
      pos = tagEnd + 1;
      continue;
    }

    const nextTag = source.indexOf('<', pos);
    const text = nextTag === -1 ? source.slice(pos) : source.slice(pos, nextTag);
    pos = nextTag === -1 ? len : nextTag;

    if (text.trim() || PLACEHOLDER_RE.test(text)) {
      PLACEHOLDER_RE.lastIndex = 0;
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
        const before = text.slice(lastIdx, match.index);
        if (before) tokens.push({ kind: TokenKind.Text, value: before });
        tokens.push({ kind: TokenKind.Expr, value: values[captureInt(match)] });
        lastIdx = match.index + match[0].length;
      }
      const after = text.slice(lastIdx);
      if (after && after.trim()) tokens.push({ kind: TokenKind.Text, value: after });
    }
  }

  return tokens;
}

function findTagEnd(source: string, start: number): number {
  let inQuote: string | null = null;
  for (let i = start + 1; i < source.length; i++) {
    const ch = charAt(source, i);
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === '>') {
      return i;
    }
  }
  return source.length - 1;
}

function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === '\f';
}

function parseOpenTag(inner: string, values: unknown[]): { tag: string; attrs: AttrToken[] } {
  const firstSpace = inner.search(/[\s/]/);
  const tag = firstSpace === -1 ? inner : inner.slice(0, firstSpace);
  const attrs: AttrToken[] = [];

  if (firstSpace === -1) return { tag, attrs };

  const rest = inner.slice(firstSpace).trim();
  if (!rest) return { tag, attrs };

  let pos = 0;
  const len = rest.length;

  while (pos < len) {
    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;
    if (pos >= len) break;

    // Standalone placeholder (spread props)
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf('\x00', pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      const propsObj = values[idx];
      if (propsObj && typeof propsObj === 'object') {
        for (const [k, v] of Object.entries(propsObj as Record<string, unknown>)) {
          attrs.push({ kind: TokenKind.Attr, name: k, value: v });
        }
      }
      pos = endMarker + 1;
      continue;
    }

    // Attribute name
    const nameStart = pos;
    while (pos < len && charAt(rest, pos) !== '=' && !isWhitespace(charAt(rest, pos))) pos++;
    const name = rest.slice(nameStart, pos);

    if (!name) { pos++; continue; }

    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;

    if (pos >= len || charAt(rest, pos) !== '=') {
      attrs.push({ kind: TokenKind.Attr, name, value: true });
      continue;
    }
    pos++; // skip '='

    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;

    // Value
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf('\x00', pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      attrs.push({ kind: TokenKind.Attr, name, value: values[idx] });
      pos = endMarker + 1;
    } else if (charAt(rest, pos) === '"' || charAt(rest, pos) === "'") {
      const quote = charAt(rest, pos);
      pos++;
      const valStart = pos;
      while (pos < len && charAt(rest, pos) !== quote) pos++;
      const rawVal = rest.slice(valStart, pos);
      pos++; // skip closing quote
      attrs.push({ kind: TokenKind.Attr, name, value: resolveAttrValue(rawVal, values) });
    } else {
      const valStart = pos;
      while (pos < len && !isWhitespace(charAt(rest, pos))) pos++;
      const rawVal = rest.slice(valStart, pos);
      attrs.push({ kind: TokenKind.Attr, name, value: resolveAttrValue(rawVal, values) });
    }
  }

  return { tag, attrs };
}

/** Resolve a raw attribute value string that may contain placeholders. */
function resolveAttrValue(rawVal: string, values: unknown[]): unknown {
  PLACEHOLDER_RE.lastIndex = 0;
  const firstMatch = PLACEHOLDER_RE.exec(rawVal);

  if (!firstMatch) return rawVal;

  // Entire value is a single placeholder — return the raw value (function, object, etc.)
  if (firstMatch.index === 0 && firstMatch[0].length === rawVal.length) {
    return values[captureInt(firstMatch)];
  }

  // Mixed static+dynamic — build a reactive concatenation
  PLACEHOLDER_RE.lastIndex = 0;
  const parts: (string | (() => unknown))[] = [];
  let lastPh = 0;
  let phm: RegExpExecArray | null;
  while ((phm = PLACEHOLDER_RE.exec(rawVal)) !== null) {
    if (phm.index > lastPh) parts.push(rawVal.slice(lastPh, phm.index));
    const val = values[captureInt(phm)];
    parts.push(typeof val === 'function' ? val as () => unknown : () => val);
    lastPh = phm.index + phm[0].length;
  }
  if (lastPh < rawVal.length) parts.push(rawVal.slice(lastPh));
  return () => parts.map(p => typeof p === 'function' ? (p as () => unknown)() : p).join('');
}

/* ────────────────────────── Builder (tokens → DOM) ────────────────────────── */

function buildDom(tokens: Token[]): Node {
  const root: Node = document.createDocumentFragment();
  const stack: Node[] = [root];
  let current: Node = root;

  for (const token of tokens) {
    switch (token.kind) {
      case TokenKind.OpenTag: {
        const el = document.createElement(token.tag);
        current.appendChild(el);
        stack.push(el);
        current = el;
        break;
      }
      case TokenKind.CloseTag: {
        stack.pop();
        current = stack.length > 0 ? stack[stack.length - 1]! : root;
        break;
      }
      case TokenKind.Attr: {
        applyAttr(current as HTMLElement, token.name, token.value);
        break;
      }
      case TokenKind.Text: {
        current.appendChild(document.createTextNode(token.value));
        break;
      }
      case TokenKind.Expr: {
        appendExpr(current, token.value);
        break;
      }
    }
  }

  // Unwrap single-element fragments for convenience
  if (root.childNodes.length === 1 && root.firstChild instanceof HTMLElement) {
    return root.firstChild;
  }
  return root;
}

/* ────────────────────────── Attribute application ────────────────────────── */

function applyAttr(el: HTMLElement, name: string, value: unknown): void {
  if (name === 'ref') {
    if (typeof value === 'function') (value as (el: HTMLElement) => void)(el);
    return;
  }
  if (name === 'class') {
    bindReactive(value, (v) => applyClass(el, v), el);
    return;
  }
  if (name === 'style') {
    bindReactive(value, (v) => {
      if (typeof v === 'string') {
        el.style.cssText = v;
      } else {
        Object.assign(el.style, v ?? {});
      }
    }, el);
    return;
  }
  if (isEventAttribute(name) && typeof value === 'function') {
    el.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
    return;
  }
  if (name.startsWith('d-')) {
    const directive = getDirective(name.slice(2));
    if (directive) {
      bindReactive(value, (v) => directive(el, v), el);
    } else {
      console.warn(`[onefold] No directive registered for "${name}". Call registerDirective() first.`);
    }
    return;
  }
  bindReactive(value, (v) => setAttr(el, name, v), el);
}

/**
 * Bind a possibly-reactive value to an apply function. When `value` is a function this
 * creates an effect, and the disposer MUST be registered against a stable, owned DOM
 * node (`ownerEl`) via `disposeOnRemove` — otherwise the effect (and everything it
 * closes over) is kept alive forever by the signal's subscriber Set even after
 * `ownerEl` leaves the document. See lifecycle.ts for the full explanation.
 */
function bindReactive<T>(value: unknown, apply: (v: T) => void, ownerEl: Node): void {
  if (typeof value === 'function') {
    const dispose = createEffect(() => apply((value as () => T)()));
    disposeOnRemove(ownerEl, dispose);
  } else {
    apply(value as T);
  }
}

function applyClass(el: HTMLElement, value: unknown): void {
  if (!value) {
    el.className = '';
  } else if (typeof value === 'string') {
    el.className = value;
  } else if (typeof value === 'object') {
    el.className = Object.entries(value as Record<string, boolean>)
      .filter(([, on]) => on)
      .map(([n]) => n)
      .join(' ');
  }
}

function setAttr(el: HTMLElement, key: string, value: unknown): void {
  if (value === false || value == null) {
    el.removeAttribute(key);
    return;
  }
  if (value === true) {
    el.setAttribute(key, '');
    return;
  }
  const str = String(value);
  if ((key === 'href' || key === 'src' || key === 'action' || key === 'formaction') && isUnsafeUrl(str)) {
    console.warn(`[onefold] Blocked unsafe "${key}" value:`, str);
    el.removeAttribute(key);
    return;
  }
  el.setAttribute(key, str);
}

/* ────────────────────────── Child expressions ────────────────────────── */

function appendExpr(parent: Node, value: unknown): void {
  if (value == null || value === false || value === true) return;

  if (value instanceof Node) {
    parent.appendChild(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) appendExpr(parent, item);
    return;
  }

  if (typeof value === 'function') {
    const startAnchor = document.createComment('expr-start');
    const endAnchor = document.createComment('expr-end');
    parent.appendChild(startAnchor);
    parent.appendChild(endAnchor);
    const dispose = createEffect(() => {
      const result = (value as () => unknown)();
      // Remove all nodes between the anchors
      const parentEl = startAnchor.parentNode;
      if (!parentEl) return;
      let node = startAnchor.nextSibling;
      while (node && node !== endAnchor) {
        const next = node.nextSibling;
        parentEl.removeChild(node);
        node = next;
      }
      // Insert new content before endAnchor
      const newContent = toNode(result);
      parentEl.insertBefore(newContent, endAnchor);
    });
    // Dispose when the stable `parent` leaves the DOM, not the anchors — content
    // between them is swapped out on every effect run. See bindReactive's doc
    // comment above for why registering this disposer is required at all.
    disposeOnRemove(parent, dispose);
    return;
  }

  if (isRawHtml(value)) {
    const wrapper = document.createElement('span');
    (wrapper as unknown as { innerHTML: unknown }).innerHTML = toTrustedHtml(value.html);
    parent.appendChild(wrapper);
    return;
  }

  parent.appendChild(document.createTextNode(String(value)));
}

function toNode(value: unknown): Node {
  if (value == null || value === false || value === true) return document.createComment('');
  if (value instanceof Node) return value;
  if (isRawHtml(value)) {
    const wrapper = document.createElement('span');
    (wrapper as unknown as { innerHTML: unknown }).innerHTML = toTrustedHtml(value.html);
    return wrapper;
  }
  if (Array.isArray(value)) {
    const frag = document.createDocumentFragment();
    for (const item of value) frag.appendChild(toNode(item));
    return frag;
  }
  return document.createTextNode(String(value));
}

/* ────────────────────────── Public API ────────────────────────── */

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
export function html(strings: TemplateStringsArray, ...values: unknown[]): Node {
  const tokens = tokenize(strings, values);
  return buildDom(tokens);
}
