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

import { createEffect } from './signal';
import { disposeOnRemove } from './lifecycle';

/* ────────────────── Types ────────────────── */

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

/* ────────────────── Implementation ────────────────── */

/**
 * Wrap a reactive node source with enter/leave transitions.
 * When the source returns a new node, the old one transitions out and the new one transitions in.
 */
export function Transition(
  source: () => Node | null | undefined,
  options?: TransitionOptions
): Node {
  const container = document.createElement('div');
  container.setAttribute('data-transition', '');
  container.style.position = 'relative';

  const { name, duration = 300, enterFrom, enterTo, leaveTo, mode = 'default' } = options ?? {};
  let currentNode: Node | null = null;

  const dispose = createEffect(() => {
    const newNode = source();
    if (newNode === currentNode) return;

    const oldNode = currentNode;

    if (mode === 'out-in' && oldNode && oldNode instanceof HTMLElement) {
      // Wait for leave to complete before entering
      animateLeave(oldNode, { name, duration, leaveTo }, () => {
        container.textContent = '';
        if (newNode) {
          container.appendChild(newNode);
          if (newNode instanceof HTMLElement) {
            animateEnter(newNode, { name, duration, enterFrom, enterTo });
          }
        }
      });
    } else {
      // Simultaneous: leave old, enter new
      if (oldNode && oldNode instanceof HTMLElement) {
        animateLeave(oldNode, { name, duration, leaveTo }, () => {
          oldNode.remove();
        });
      }
      if (newNode) {
        container.appendChild(newNode);
        if (newNode instanceof HTMLElement) {
          animateEnter(newNode, { name, duration, enterFrom, enterTo });
        }
      }
    }

    currentNode = newNode ?? null;
  });
  // Closes over `source` (usually a signal-reading closure) and the current node.
  // Must be disposed when `container` leaves the page, same leak class as
  // template.ts's reactive bindings — see lifecycle.ts.
  disposeOnRemove(container, dispose);

  return container;
}

/**
 * Animate a single node entering the DOM. Can be used standalone.
 */
export function animateEnter(
  el: HTMLElement,
  options: Pick<TransitionOptions, 'name' | 'duration' | 'enterFrom' | 'enterTo'>
): void {
  const { name, duration = 300, enterFrom, enterTo } = options;

  if (name) {
    // CSS class-based transition
    el.classList.add(`${name}-enter`, `${name}-enter-active`);
    requestAnimationFrame(() => {
      el.classList.remove(`${name}-enter`);
      el.classList.add(`${name}-enter-to`);
    });
    setTimeout(() => {
      el.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
    }, duration);
  } else if (enterFrom) {
    // Inline style transition
    Object.assign(el.style, enterFrom);
    el.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
      Object.assign(el.style, enterTo ?? {});
    });
    setTimeout(() => {
      el.style.transition = '';
    }, duration);
  }
}

/**
 * Animate a single node leaving the DOM. Calls `done` when animation completes.
 */
export function animateLeave(
  el: HTMLElement,
  options: Pick<TransitionOptions, 'name' | 'duration' | 'leaveTo'>,
  done: () => void
): void {
  const { name, duration = 300, leaveTo } = options;

  if (name) {
    el.classList.add(`${name}-leave`, `${name}-leave-active`);
    requestAnimationFrame(() => {
      el.classList.remove(`${name}-leave`);
      el.classList.add(`${name}-leave-to`);
    });
    setTimeout(done, duration);
  } else if (leaveTo) {
    el.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
      Object.assign(el.style, leaveTo);
    });
    setTimeout(done, duration);
  } else {
    done();
  }
}
