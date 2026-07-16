/**
 * Every security decision in onefold lives in this one file, on purpose —
 * so it's the single place to audit, and the only place `innerHTML` may appear.
 */
export declare function isUnsafeUrl(value: string): boolean;
export declare function isEventAttribute(name: string): boolean;
/**
 * Minimal allowlist sanitizer for the explicit `raw()` escape hatch.
 * Strips <script>, <style>, on* handlers, and javascript: URLs.
 * This is NOT a substitute for DOMPurify on untrusted/user-generated HTML —
 * it exists to stop the most common self-inflicted XSS mistakes, nothing more.
 * For any HTML that originates from users, pipe it through DOMPurify first.
 */
export declare function minimalSanitize(html: string): string;
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
            createPolicy: (name: string, rules: {
                createHTML: (input: string) => string;
            }) => {
                createHTML: (input: string) => unknown;
            };
        };
    }
}
/** Produces a value safe to assign to `.innerHTML` under a Trusted Types CSP, or a plain string elsewhere. */
export declare function toTrustedHtml(html: string): unknown;
/** Marker type returned by `raw()` so the renderer knows this string was explicitly opted in. */
export interface RawHtml {
    readonly __onefoldRaw: true;
    readonly html: string;
}
/**
 * Explicitly opt in to inserting HTML instead of text. Sanitized with `minimalSanitize`.
 * Use only for trusted, developer-authored content — never for raw user input.
 */
export declare function raw(html: string): RawHtml;
export declare function isRawHtml(value: unknown): value is RawHtml;
