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
/** Counter for generating unique scope IDs. */
let scopeCounter = 0;
/** Cache: template string → ScopedStyle (avoids re-injecting the same CSS). */
const cache = new Map();
/**
 * Hash a string into a short alphanumeric ID for use as a CSS class.
 */
function generateScopeId() {
    return `nf-${(scopeCounter++).toString(36)}`;
}
/**
 * Prefix each CSS rule's selectors with the scope class.
 * Handles nested selectors, pseudo-classes, media queries, and keyframes.
 */
function scopeCSS(raw, scopeClass) {
    const prefix = `.${scopeClass}`;
    let result = '';
    let i = 0;
    const len = raw.length;
    while (i < len) {
        // Skip whitespace
        while (i < len && /\s/.test(raw[i])) {
            result += raw[i];
            i++;
        }
        if (i >= len)
            break;
        // Handle @-rules (media queries, keyframes, etc.)
        if (raw[i] === '@') {
            const atStart = i;
            // Find the opening brace
            while (i < len && raw[i] !== '{')
                i++;
            result += raw.slice(atStart, i);
            if (i < len) {
                result += raw[i]; // '{'
                i++;
            }
            // Recursively process the @-rule's body
            const body = extractBlock(raw, i - 1);
            const inner = body.slice(1, -1); // Remove outer { }
            result += scopeCSS(inner, scopeClass);
            result += '}';
            i += body.length - 1;
            continue;
        }
        // Read selector(s) until '{'
        const selStart = i;
        while (i < len && raw[i] !== '{')
            i++;
        const selectors = raw.slice(selStart, i).trim();
        if (!selectors || i >= len)
            break;
        // Scope each selector
        const scopedSelectors = selectors.split(',').map((sel) => {
            sel = sel.trim();
            if (!sel)
                return sel;
            // :root, :host → just the scope class
            if (sel === ':root' || sel === ':host')
                return prefix;
            // If selector starts with & → replace & with scope
            if (sel.startsWith('&'))
                return prefix + sel.slice(1);
            // Otherwise prefix the selector with the scope
            return `${prefix} ${sel}`;
        }).join(', ');
        result += scopedSelectors;
        // Copy the declaration block as-is
        const block = extractBlock(raw, i);
        result += block;
        i += block.length;
    }
    return result;
}
/**
 * Extract a balanced { ... } block starting at position `start` (which should be '{').
 */
function extractBlock(source, start) {
    if (source[start] !== '{')
        return '';
    let depth = 0;
    let i = start;
    while (i < source.length) {
        if (source[i] === '{')
            depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0)
                return source.slice(start, i + 1);
        }
        i++;
    }
    return source.slice(start);
}
/**
 * Inject a `<style>` element into `<head>`. No-op on server.
 */
function injectStyle(cssText, id) {
    if (typeof document === 'undefined')
        return;
    // Avoid duplicates
    if (document.getElementById(id))
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
}
/**
 * Tagged template for component-scoped CSS. Returns a `ScopedStyle` with a `.scope` class
 * to attach to your component root.
 *
 * Styles are automatically prefixed with a unique class so they don't leak.
 * The `<style>` is injected once into `<head>` and deduplicated across renders.
 */
export function css(strings, ...values) {
    // Build the raw CSS string
    let raw = '';
    for (let i = 0; i < strings.length; i++) {
        raw += strings[i];
        if (i < values.length)
            raw += String(values[i]);
    }
    // Check cache
    const cached = cache.get(raw);
    if (cached)
        return cached;
    // Generate scope and process
    const scopeClass = generateScopeId();
    const scopedCSS = scopeCSS(raw, scopeClass);
    // Inject into DOM
    injectStyle(scopedCSS, `style-${scopeClass}`);
    const result = { scope: scopeClass, css: scopedCSS };
    cache.set(raw, result);
    return result;
}
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
export function cssValue(value) {
    return value
        .replace(/[{}<>;]/g, '')
        .replace(/url\s*\(/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/@import/gi, '')
        .trim();
}
