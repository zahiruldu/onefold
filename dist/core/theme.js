/**
 * Reactive theming via CSS custom properties.
 *
 * Themes are just objects of key-value CSS variables. Switching themes
 * updates the custom properties on the root element — all components using
 * `var(--key)` update instantly without re-rendering.
 *
 * Usage:
 * ```ts
 * const theme = createTheme({
 *   light: { bg: '#ffffff', text: '#1f2937', accent: '#4f46e5' },
 *   dark:  { bg: '#0f172a', text: '#f1f5f9', accent: '#818cf8' },
 * }, 'light'); // default theme
 *
 * // In css:
 * css`
 *   .card { background: var(--bg); color: var(--text); }
 *   button { background: var(--accent); }
 * `
 *
 * // Switch theme reactively:
 * theme.set('dark');
 * theme.toggle(); // cycles between themes
 * theme.current() // 'dark' (reactive)
 * ```
 */
import { createSignal, createEffect } from './signal';
/* ────────────────── Implementation ────────────────── */
/**
 * Create a reactive theme system. Applies CSS custom properties to
 * `document.documentElement` so they cascade to all elements.
 */
export function createTheme(themes, defaultTheme) {
    const names = Object.keys(themes);
    const initial = defaultTheme ?? names[0] ?? '';
    const current = createSignal(initial);
    // Apply theme tokens as CSS custom properties
    createEffect(() => {
        const name = current();
        const tokens = themes[name];
        if (!tokens || typeof document === 'undefined')
            return;
        const root = document.documentElement;
        for (const [key, value] of Object.entries(tokens)) {
            root.style.setProperty(`--${key}`, value);
        }
    });
    return {
        current,
        set: (name) => {
            if (themes[name])
                current.set(name);
        },
        toggle: () => {
            const idx = names.indexOf(current());
            current.set(names[(idx + 1) % names.length]);
        },
        themes: () => names,
        tokens: () => themes[current()] ?? {},
    };
}
