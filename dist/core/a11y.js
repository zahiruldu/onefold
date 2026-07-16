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
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
/**
 * Create a focus trap for a container element (modals, dialogs, popovers).
 * Focus cycles within the container while active.
 */
export function FocusTrap(container) {
    let previousFocus = null;
    let active = false;
    function getFocusableElements() {
        return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    }
    function handleKeyDown(e) {
        if (e.key !== 'Tab')
            return;
        const focusable = getFocusableElements();
        if (focusable.length === 0)
            return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    return {
        get active() { return active; },
        activate() {
            previousFocus = document.activeElement;
            active = true;
            container.addEventListener('keydown', handleKeyDown);
            // Focus the first focusable element
            const focusable = getFocusableElements();
            if (focusable.length > 0)
                focusable[0].focus();
            else
                container.focus();
        },
        deactivate() {
            active = false;
            container.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus();
            previousFocus = null;
        },
    };
}
/* ────────────────── Live Region Announcements ────────────────── */
let liveRegion = null;
function ensureLiveRegion() {
    if (liveRegion && liveRegion.isConnected)
        return liveRegion;
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    // Visually hidden but accessible to screen readers
    Object.assign(liveRegion.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
    });
    document.body.appendChild(liveRegion);
    return liveRegion;
}
/**
 * Announce a message to screen readers via a live region.
 * @param message - Text to announce.
 * @param priority - 'polite' (default) or 'assertive' (interrupts current speech).
 */
export function announce(message, priority = 'polite') {
    const region = ensureLiveRegion();
    region.setAttribute('aria-live', priority);
    // Clear and re-set to trigger announcement
    region.textContent = '';
    setTimeout(() => { region.textContent = message; }, 50);
}
/**
 * Register keyboard shortcuts. Supports modifiers: Ctrl, Shift, Alt, Meta.
 *
 * Key format: "Ctrl+S", "Escape", "Ctrl+Shift+P", "Alt+Enter"
 */
export function useKeyboard(keyMap, target) {
    const map = new Map(Object.entries(keyMap));
    const el = target ?? document;
    function normalizeEvent(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey)
            parts.push('Ctrl');
        if (e.shiftKey)
            parts.push('Shift');
        if (e.altKey)
            parts.push('Alt');
        // Normalize key name
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        parts.push(key);
        return parts.join('+');
    }
    function handleKeyDown(e) {
        const combo = normalizeEvent(e);
        const handler = map.get(combo);
        if (handler) {
            e.preventDefault();
            handler(e);
        }
    }
    el.addEventListener('keydown', handleKeyDown);
    return {
        destroy: () => el.removeEventListener('keydown', handleKeyDown),
        add: (combo, handler) => map.set(combo, handler),
        remove: (combo) => map.delete(combo),
    };
}
/* ────────────────── Skip Link ────────────────── */
/**
 * Create an accessible "Skip to content" link.
 * Visually hidden until focused, then visible at the top of the page.
 */
export function SkipLink(targetSelector, text = 'Skip to main content') {
    const link = document.createElement('a');
    link.href = targetSelector;
    link.textContent = text;
    link.className = 'nf-skip-link';
    Object.assign(link.style, {
        position: 'absolute',
        top: '-100%',
        left: '0',
        padding: '8px 16px',
        background: '#1f2937',
        color: '#fff',
        fontSize: '14px',
        zIndex: '99999',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        transition: 'top 0.2s',
    });
    link.addEventListener('focus', () => { link.style.top = '0'; });
    link.addEventListener('blur', () => { link.style.top = '-100%'; });
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(targetSelector);
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    });
    return link;
}
