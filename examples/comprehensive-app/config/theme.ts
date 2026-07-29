/**
 * Theme configuration — light/dark mode via CSS custom properties.
 * Demonstrates: createTheme, persisted signals
 */
import { createTheme } from '../../../src/core/theme';

export const theme = createTheme({
  light: {
    'app-bg': '#f0f4f8',
    'card-bg': '#ffffff',
    'text-primary': '#1f2937',
    'text-secondary': '#6b7280',
    'accent': '#4f46e5',
    'accent-hover': '#4338ca',
    'border': '#e5e7eb',
    'success': '#10b981',
    'warning': '#f59e0b',
    'danger': '#ef4444',
    'sidebar-bg': '#1e293b',
    'sidebar-text': '#f1f5f9',
  },
  dark: {
    'app-bg': '#0f172a',
    'card-bg': '#1e293b',
    'text-primary': '#f1f5f9',
    'text-secondary': '#94a3b8',
    'accent': '#818cf8',
    'accent-hover': '#6366f1',
    'border': '#334155',
    'success': '#34d399',
    'warning': '#fbbf24',
    'danger': '#f87171',
    'sidebar-bg': '#020617',
    'sidebar-text': '#e2e8f0',
  },
}, 'light');
