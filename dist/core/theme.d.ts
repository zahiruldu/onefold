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
import { type Signal } from './signal';
/** A theme is a flat record of CSS custom property names → values. */
export type ThemeTokens = Record<string, string>;
/** All themes keyed by name. */
export type ThemeMap = Record<string, ThemeTokens>;
export interface Theme {
    /** Current theme name (reactive signal). */
    current: Signal<string>;
    /** Switch to a specific theme. */
    set: (name: string) => void;
    /** Toggle/cycle through available themes. */
    toggle: () => void;
    /** List available theme names. */
    themes: () => string[];
    /** Get the current theme's tokens. */
    tokens: () => ThemeTokens;
}
/**
 * Create a reactive theme system. Applies CSS custom properties to
 * `document.documentElement` so they cascade to all elements.
 */
export declare function createTheme(themes: ThemeMap, defaultTheme?: string): Theme;
