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
/**
 * Format a date as a human-readable string.
 *
 * @param date - Date object, timestamp, or ISO string.
 * @param format - 'short' (Jul 14, 2026), 'long' (July 14, 2026), 'iso' (2026-07-14), 'datetime' (Jul 14, 2026, 3:45 PM).
 */
export declare function formatDate(date: Date | number | string, format?: 'short' | 'long' | 'iso' | 'datetime'): string;
/**
 * Relative time description ("3 minutes ago", "in 2 hours", "yesterday").
 */
export declare function timeAgo(date: Date | number | string): string;
/**
 * Format a number as currency.
 *
 * @param amount - The numeric value.
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR', 'BDT').
 * @param locale - Optional BCP 47 locale string. Defaults to user's locale.
 */
export declare function formatCurrency(amount: number, currency: string, locale?: string): string;
/**
 * Format a number with locale-aware grouping (e.g., 1,234,567.89).
 */
export declare function formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string;
/**
 * Truncate a string to a maximum length, adding an ellipsis if truncated.
 */
export declare function truncate(str: string, maxLength: number, suffix?: string): string;
/**
 * Convert a string to a URL-safe slug.
 * "Hello World! Foo" → "hello-world-foo"
 */
export declare function slugify(str: string): string;
/**
 * Simple pluralization.
 * pluralize(0, 'item') → "0 items"
 * pluralize(1, 'item') → "1 item"
 * pluralize(5, 'item') → "5 items"
 * pluralize(2, 'child', 'children') → "2 children"
 */
export declare function pluralize(count: number, singular: string, plural?: string): string;
/**
 * Capitalize the first letter of a string.
 */
export declare function capitalize(str: string): string;
/**
 * Create a debounced version of a function.
 * The function only executes after `ms` milliseconds of no calls.
 */
export declare function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T & {
    cancel: () => void;
};
/**
 * Create a throttled version of a function.
 * The function executes at most once per `ms` milliseconds.
 */
export declare function throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number): T;
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
export declare function pipe<T>(value: T, ...fns: ((v: any) => any)[]): any;
