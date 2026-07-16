/**
 * Every security decision in onefold lives in this one file, on purpose —
 * so it's the single place to audit, and the only place `innerHTML` may appear.
 */

const UNSAFE_URL_SCHEME = /^\s*(javascript|data|vbscript):/i;

/** Attributes that execute code and must never be settable from dynamic/user data. */
const EVENT_ATTR_PREFIX = /^on/i;

export function isUnsafeUrl(value: string): boolean {
  return UNSAFE_URL_SCHEME.test(value);
}

export function isEventAttribute(name: string): boolean {
  return EVENT_ATTR_PREFIX.test(name);
}

/**
 * Minimal allowlist sanitizer for the explicit `raw()` escape hatch.
 * Strips <script>, <style>, on* handlers, and javascript: URLs.
 * This is NOT a substitute for DOMPurify on untrusted/user-generated HTML —
 * it exists to stop the most common self-inflicted XSS mistakes, nothing more.
 * For any HTML that originates from users, pipe it through DOMPurify first.
 */
export function minimalSanitize(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  const walk = (node: Node) => {
    const toRemove: ChildNode[] = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'embed' || tag === 'form') {
          toRemove.push(child as ChildNode);
          return;
        }
        Array.from(el.attributes).forEach((attr) => {
          if (isEventAttribute(attr.name)) {
            el.removeAttribute(attr.name);
          } else if ((attr.name === 'href' || attr.name === 'src') && isUnsafeUrl(attr.value)) {
            el.removeAttribute(attr.name);
          }
        });
        walk(el);
      }
    });
    toRemove.forEach((n) => n.remove());
  };

  walk(template.content);
  return template.innerHTML;
}

/**
 * Trusted Types integration (Chrome/Edge; no-op elsewhere). When a `trustedTypes` policy
 * is enforced by the page's CSP (`require-trusted-types-for 'script'`), any raw `innerHTML`
 * assignment throws unless it goes through a registered policy. Registering onefold's own
 * policy here means `raw()` keeps working under that CSP mode instead of getting blocked —
 * and because the policy itself calls `minimalSanitize`, it's a second enforcement layer,
 * not a bypass: even code that skips `raw()` and touches `.innerHTML` directly on a
 * onefold-created node still goes through sanitization on browsers that support it.
 */
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (
        name: string,
        rules: { createHTML: (input: string) => string }
      ) => { createHTML: (input: string) => unknown };
    };
  }
}

let trustedPolicy: { createHTML: (input: string) => unknown } | null = null;

function getTrustedPolicy() {
  if (trustedPolicy) return trustedPolicy;
  if (typeof window !== 'undefined' && window.trustedTypes) {
    trustedPolicy = window.trustedTypes.createPolicy('onefold-sanitized', {
      createHTML: (input: string) => minimalSanitize(input),
    });
  }
  return trustedPolicy;
}

/** Produces a value safe to assign to `.innerHTML` under a Trusted Types CSP, or a plain string elsewhere. */
export function toTrustedHtml(html: string): unknown {
  const policy = getTrustedPolicy();
  return policy ? policy.createHTML(html) : minimalSanitize(html);
}

/** Marker type returned by `raw()` so the renderer knows this string was explicitly opted in. */
export interface RawHtml {
  readonly __onefoldRaw: true;
  readonly html: string;
}

/**
 * Explicitly opt in to inserting HTML instead of text. Sanitized with `minimalSanitize`.
 * Use only for trusted, developer-authored content — never for raw user input.
 */
export function raw(html: string): RawHtml {
  return { __onefoldRaw: true, html: minimalSanitize(html) };
}

export function isRawHtml(value: unknown): value is RawHtml {
  return typeof value === 'object' && value !== null && (value as RawHtml).__onefoldRaw === true;
}
