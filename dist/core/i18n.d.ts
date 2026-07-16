/**
 * Reactive internationalization (i18n).
 *
 * Zero dependencies, signal-driven. When the locale changes, every `t()` binding
 * in the UI updates automatically — no manual re-render, no context wrappers.
 *
 * Usage:
 * ```ts
 * const i18n = createI18n({
 *   defaultLocale: 'en',
 *   messages: {
 *     en: { greeting: 'Hello, {name}!', items: '{count} item(s)' },
 *     es: { greeting: '¡Hola, {name}!', items: '{count} elemento(s)' },
 *   },
 * });
 *
 * // In a template (reactive — updates when locale changes):
 * html`<h1>${() => i18n.t('greeting', { name: user() })}</h1>`
 *
 * // Switch language:
 * i18n.setLocale('es');
 * ```
 */
import { type Signal } from './signal';
/** A flat dictionary of translation key → message template. */
export type Messages = Record<string, string>;
/** All locale dictionaries keyed by locale code. */
export type LocaleMessages = Record<string, Messages>;
export interface I18nConfig {
    /** The locale to start with. */
    defaultLocale: string;
    /** All translation dictionaries. Can be extended later with `addMessages`. */
    messages: LocaleMessages;
    /** Optional fallback locale when a key is missing in the active locale. */
    fallbackLocale?: string;
}
export interface I18n {
    /** Current locale (reactive signal). */
    locale: Signal<string>;
    /** Change the active locale. All `t()` calls update reactively. */
    setLocale: (locale: string) => void;
    /** Translate a key with optional interpolation params. Reads `locale()` so it's reactive. */
    t: (key: string, params?: Record<string, string | number>) => string;
    /** Add or merge messages for a locale (lazy-load translations). */
    addMessages: (locale: string, messages: Messages) => void;
    /** Get list of available locale codes. */
    availableLocales: () => string[];
}
/**
 * Create an i18n instance. Lightweight, no global state — you can have
 * multiple instances for different parts of your app if needed.
 */
export declare function createI18n(config: I18nConfig): I18n;
