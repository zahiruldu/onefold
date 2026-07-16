/**
 * Accessibility (a11y) primitives — focus management, screen reader announcements,
 * keyboard shortcuts, and ARIA helpers.
 *
 * Usage:
 * ```ts
 * // Focus trap (for modals/dialogs)
 * const trap = FocusTrap(modalElement);
 * trap.activate();
 * trap.deactivate();
 *
 * // Screen reader announcement
 * announce('Item successfully deleted');
 *
 * // Keyboard shortcuts
 * const shortcuts = useKeyboard({
 *   'Escape': () => closeModal(),
 *   'Ctrl+S': () => save(),
 *   'Ctrl+Shift+P': () => openCommandPalette(),
 * });
 * shortcuts.destroy(); // cleanup
 *
 * // Skip to main content link
 * const skipLink = SkipLink('#main-content');
 * ```
 */
export interface FocusTrapInstance {
    /** Activate the trap — focus moves into the container and can't leave via Tab. */
    activate: () => void;
    /** Deactivate — restore normal tab behavior, return focus to trigger element. */
    deactivate: () => void;
    /** Whether the trap is currently active. */
    active: boolean;
}
/**
 * Create a focus trap for a container element (modals, dialogs, popovers).
 * Focus cycles within the container while active.
 */
export declare function FocusTrap(container: HTMLElement): FocusTrapInstance;
/**
 * Announce a message to screen readers via a live region.
 * @param message - Text to announce.
 * @param priority - 'polite' (default) or 'assertive' (interrupts current speech).
 */
export declare function announce(message: string, priority?: 'polite' | 'assertive'): void;
export type KeyHandler = (e: KeyboardEvent) => void;
export type KeyMap = Record<string, KeyHandler>;
export interface KeyboardShortcuts {
    /** Remove all listeners. */
    destroy: () => void;
    /** Add a shortcut at runtime. */
    add: (combo: string, handler: KeyHandler) => void;
    /** Remove a shortcut. */
    remove: (combo: string) => void;
}
/**
 * Register keyboard shortcuts. Supports modifiers: Ctrl, Shift, Alt, Meta.
 *
 * Key format: "Ctrl+S", "Escape", "Ctrl+Shift+P", "Alt+Enter"
 */
export declare function useKeyboard(keyMap: KeyMap, target?: HTMLElement | Document): KeyboardShortcuts;
/**
 * Create an accessible "Skip to content" link.
 * Visually hidden until focused, then visible at the top of the page.
 */
export declare function SkipLink(targetSelector: string, text?: string): Node;
