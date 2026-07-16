/**
 * Transitions — animate elements entering and leaving the DOM.
 *
 * Uses CSS classes for enter/leave animations. No JavaScript animation runtime.
 * Compatible with any CSS animation or transition.
 *
 * Usage:
 * ```ts
 * // Basic fade transition
 * html`<div>${Transition(() => currentView(), { name: 'fade' })}</div>`
 *
 * // CSS needed:
 * // .fade-enter { opacity: 0; }
 * // .fade-enter-active { transition: opacity 0.3s; }
 * // .fade-leave { opacity: 1; }
 * // .fade-leave-active { opacity: 0; transition: opacity 0.3s; }
 *
 * // Or use the built-in inline transitions:
 * html`<div>${Transition(() => view(), {
 *   enterFrom: { opacity: '0', transform: 'translateY(8px)' },
 *   enterTo: { opacity: '1', transform: 'translateY(0)' },
 *   leaveTo: { opacity: '0', transform: 'translateY(-8px)' },
 *   duration: 200,
 * })}</div>`
 * ```
 */
export interface TransitionOptions {
    /** CSS class prefix for enter/leave transitions (e.g., 'fade' → .fade-enter, .fade-leave). */
    name?: string;
    /** Duration in ms (for inline style transitions). Default: 300. */
    duration?: number;
    /** Inline enter-from styles. */
    enterFrom?: Partial<CSSStyleDeclaration>;
    /** Inline enter-to styles (final state). */
    enterTo?: Partial<CSSStyleDeclaration>;
    /** Inline leave-to styles (exit state). */
    leaveTo?: Partial<CSSStyleDeclaration>;
    /** Mode: 'out-in' waits for leave to finish before enter. Default: simultaneous. */
    mode?: 'default' | 'out-in';
}
/**
 * Wrap a reactive node source with enter/leave transitions.
 * When the source returns a new node, the old one transitions out and the new one transitions in.
 */
export declare function Transition(source: () => Node | null | undefined, options?: TransitionOptions): Node;
/**
 * Animate a single node entering the DOM. Can be used standalone.
 */
export declare function animateEnter(el: HTMLElement, options: Pick<TransitionOptions, 'name' | 'duration' | 'enterFrom' | 'enterTo'>): void;
/**
 * Animate a single node leaving the DOM. Calls `done` when animation completes.
 */
export declare function animateLeave(el: HTMLElement, options: Pick<TransitionOptions, 'name' | 'duration' | 'leaveTo'>, done: () => void): void;
