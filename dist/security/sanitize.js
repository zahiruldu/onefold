/**
 * Every security decision in onefold lives in this one file, on purpose —
 * so it's the single place to audit, and the only place `innerHTML` may appear.
 */
const UNSAFE_URL_SCHEME = /^\s*(javascript|data|vbscript):/i;
/** Attributes that execute code and must never be settable from dynamic/user data. */
const EVENT_ATTR_PREFIX = /^on/i;
export function isUnsafeUrl(value) {
    return UNSAFE_URL_SCHEME.test(value);
}
export function isEventAttribute(name) {
    return EVENT_ATTR_PREFIX.test(name);
}
/**
 * Minimal allowlist sanitizer for the explicit `raw()` escape hatch.
 * Strips <script>, <style>, on* handlers, and javascript: URLs.
 * This is NOT a substitute for DOMPurify on untrusted/user-generated HTML —
 * it exists to stop the most common self-inflicted XSS mistakes, nothing more.
 * For any HTML that originates from users, pipe it through DOMPurify first.
 */
export function minimalSanitize(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const walk = (node) => {
        const toRemove = [];
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child;
                const tag = el.tagName.toLowerCase();
                if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'embed' || tag === 'form') {
                    toRemove.push(child);
                    return;
                }
                Array.from(el.attributes).forEach((attr) => {
                    if (isEventAttribute(attr.name)) {
                        el.removeAttribute(attr.name);
                    }
                    else if ((attr.name === 'href' || attr.name === 'src') && isUnsafeUrl(attr.value)) {
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
let trustedPolicy = null;
function getTrustedPolicy() {
    if (trustedPolicy)
        return trustedPolicy;
    if (typeof window !== 'undefined' && window.trustedTypes) {
        trustedPolicy = window.trustedTypes.createPolicy('onefold-sanitized', {
            createHTML: (input) => minimalSanitize(input),
        });
    }
    return trustedPolicy;
}
/** Produces a value safe to assign to `.innerHTML` under a Trusted Types CSP, or a plain string elsewhere. */
export function toTrustedHtml(html) {
    const policy = getTrustedPolicy();
    return policy ? policy.createHTML(html) : minimalSanitize(html);
}
/**
 * Explicitly opt in to inserting HTML instead of text. Sanitized with `minimalSanitize`.
 * Use only for trusted, developer-authored content — never for raw user input.
 */
export function raw(html) {
    return { __onefoldRaw: true, html: minimalSanitize(html) };
}
export function isRawHtml(value) {
    return typeof value === 'object' && value !== null && value.__onefoldRaw === true;
}
