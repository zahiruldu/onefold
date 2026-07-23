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
import { createSignal } from './signal.js';
/* ────────────────── Implementation ────────────────── */
/**
 * Create an i18n instance. Lightweight, no global state — you can have
 * multiple instances for different parts of your app if needed.
 */
export function createI18n(config) {
    const locale = createSignal(config.defaultLocale);
    const messages = { ...config.messages };
    const fallback = config.fallbackLocale ?? config.defaultLocale;
    // Bumped by addMessages() so t() re-runs for newly-added keys even when the
    // locale itself hasn't changed. Without this, lazy-loading translations
    // (the documented use case for addMessages) would silently NOT update any
    // already-mounted `${() => i18n.t(...)}` binding — messages is a plain
    // object mutated in place, not a signal, so it can't drive reactivity on
    // its own.
    const messagesVersion = createSignal(0);
    function t(key, params) {
        // Read both signals to establish reactive dependencies: locale changes
        // AND newly-added messages must each be able to trigger a re-run.
        const currentLocale = locale();
        messagesVersion();
        const dict = messages[currentLocale];
        let template = dict?.[key] ?? messages[fallback]?.[key] ?? key;
        // Interpolate {param} placeholders
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                template = template.split(`{${k}}`).join(String(v));
            }
        }
        return template;
    }
    function setLocale(newLocale) {
        locale.set(newLocale);
    }
    function addMessages(loc, msgs) {
        messages[loc] = { ...messages[loc], ...msgs };
        messagesVersion.set((v) => v + 1);
    }
    function availableLocales() {
        return Object.keys(messages);
    }
    return { locale, setLocale, t, addMessages, availableLocales };
}
