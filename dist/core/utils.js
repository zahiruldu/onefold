/**
 * Pure utility functions for common formatting and timing operations.
 *
 * Use directly inside html template expressions — no new concept to learn:
 * ```ts
 * html`<span>${() => formatDate(createdAt())}</span>`
 * html`<span>${() => formatCurrency(price(), 'USD')}</span>`
 * html`<span>${() => timeAgo(updatedAt())}</span>`
 * ```
 *
 * All functions are pure, tree-shakeable, and have zero dependencies.
 */
/* ────────────────── Date/Time ────────────────── */
/**
 * Format a date as a human-readable string.
 *
 * @param date - Date object, timestamp, or ISO string.
 * @param format - 'short' (Jul 14, 2026), 'long' (July 14, 2026), 'iso' (2026-07-14), 'datetime' (Jul 14, 2026, 3:45 PM).
 */
export function formatDate(date, format = 'short') {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime()))
        return '';
    switch (format) {
        case 'iso':
            return d.toISOString().slice(0, 10);
        case 'long':
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        case 'datetime':
            return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        case 'short':
        default:
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
/**
 * Relative time description ("3 minutes ago", "in 2 hours", "yesterday").
 */
export function timeAgo(date) {
    const d = date instanceof Date ? date : new Date(date);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const absDiff = Math.abs(diffMs);
    const isPast = diffMs >= 0;
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    let label;
    if (seconds < 10)
        label = 'just now';
    else if (seconds < 60)
        label = `${seconds} seconds`;
    else if (minutes === 1)
        label = '1 minute';
    else if (minutes < 60)
        label = `${minutes} minutes`;
    else if (hours === 1)
        label = '1 hour';
    else if (hours < 24)
        label = `${hours} hours`;
    else if (days === 1)
        label = isPast ? 'yesterday' : 'tomorrow';
    else if (days < 7)
        label = `${days} days`;
    else if (weeks === 1)
        label = '1 week';
    else if (weeks < 5)
        label = `${weeks} weeks`;
    else if (months === 1)
        label = '1 month';
    else if (months < 12)
        label = `${months} months`;
    else if (years === 1)
        label = '1 year';
    else
        label = `${years} years`;
    if (label === 'just now' || label === 'yesterday' || label === 'tomorrow')
        return label;
    return isPast ? `${label} ago` : `in ${label}`;
}
/* ────────────────── Numbers/Currency ────────────────── */
/**
 * Format a number as currency.
 *
 * @param amount - The numeric value.
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR', 'BDT').
 * @param locale - Optional BCP 47 locale string. Defaults to user's locale.
 */
export function formatCurrency(amount, currency, locale) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
/**
 * Format a number with locale-aware grouping (e.g., 1,234,567.89).
 */
export function formatNumber(value, locale, options) {
    return new Intl.NumberFormat(locale, options).format(value);
}
/* ────────────────── Strings ────────────────── */
/**
 * Truncate a string to a maximum length, adding an ellipsis if truncated.
 */
export function truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
}
/**
 * Convert a string to a URL-safe slug.
 * "Hello World! Foo" → "hello-world-foo"
 */
export function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
/**
 * Simple pluralization.
 * pluralize(0, 'item') → "0 items"
 * pluralize(1, 'item') → "1 item"
 * pluralize(5, 'item') → "5 items"
 * pluralize(2, 'child', 'children') → "2 children"
 */
export function pluralize(count, singular, plural) {
    const word = count === 1 ? singular : (plural ?? `${singular}s`);
    return `${count} ${word}`;
}
/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str) {
    if (!str)
        return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/* ────────────────── Timing ────────────────── */
/**
 * Create a debounced version of a function.
 * The function only executes after `ms` milliseconds of no calls.
 */
export function debounce(fn, ms) {
    let timer = null;
    const debounced = ((...args) => {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => { fn(...args); timer = null; }, ms);
    });
    debounced.cancel = () => { if (timer) {
        clearTimeout(timer);
        timer = null;
    } };
    return debounced;
}
/**
 * Create a throttled version of a function.
 * The function executes at most once per `ms` milliseconds.
 */
export function throttle(fn, ms) {
    let lastCall = 0;
    return ((...args) => {
        const now = Date.now();
        if (now - lastCall >= ms) {
            lastCall = now;
            fn(...args);
        }
    });
}
/* ────────────────── Composition ────────────────── */
/**
 * Pipe a value through a chain of transform functions (left to right).
 *
 * Reads naturally as "take value, apply fn1, then fn2, then fn3...":
 * ```ts
 * pipe(name(), capitalize, s => truncate(s, 20))
 * pipe(price(), n => formatCurrency(n, 'USD'))
 * pipe(bio(), s => truncate(s, 100), capitalize)
 * ```
 *
 * Use inside reactive expressions:
 * ```ts
 * html`<span>${() => pipe(name(), capitalize, s => truncate(s, 20))}</span>`
 * ```
 */
export function pipe(value, ...fns) {
    return fns.reduce((acc, fn) => fn(acc), value);
}
