/**
 * Testing utilities — render components, query DOM, fire events, wait for async.
 *
 * Works with any test runner (Vitest, Jest, Node test runner) + jsdom.
 * No dependencies beyond what onefold already uses.
 *
 * Usage:
 * ```ts
 * import { render, fireEvent, waitFor } from 'onefold/testing';
 *
 * test('counter increments', async () => {
 *   const { getByText, getByRole } = render(() => Counter());
 *
 *   expect(getByText('Count: 0')).toBeDefined();
 *
 *   fireEvent.click(getByText('+'));
 *
 *   await waitFor(() => {
 *     expect(getByText('Count: 1')).toBeDefined();
 *   });
 * });
 * ```
 */

/* ────────────────── Render ────────────────── */

export interface RenderResult {
  /** The container element holding the rendered component. */
  container: HTMLElement;
  /** Find an element by its text content (partial match). */
  getByText: (text: string) => HTMLElement;
  /** Find an element by ARIA role. */
  getByRole: (role: string) => HTMLElement;
  /** Find an element by placeholder text. */
  getByPlaceholder: (text: string) => HTMLElement;
  /** Find an element by test ID (data-testid attribute). */
  getByTestId: (id: string) => HTMLElement;
  /** Query (returns null if not found instead of throwing). */
  queryByText: (text: string) => HTMLElement | null;
  queryByRole: (role: string) => HTMLElement | null;
  queryByTestId: (id: string) => HTMLElement | null;
  /** Unmount the component (cleanup). */
  unmount: () => void;
}

/**
 * Render a component into a detached DOM container for testing.
 */
export function render(componentFn: () => Node): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const node = componentFn();
  container.appendChild(node);

  function getByText(text: string): HTMLElement {
    const el = queryByText(text);
    if (!el) throw new Error(`[testing] Element with text "${text}" not found.`);
    return el;
  }

  function queryByText(text: string): HTMLElement | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let current: Node | null;
    while ((current = walker.nextNode())) {
      if (current.textContent?.includes(text)) {
        return (current.parentElement ?? current) as HTMLElement;
      }
    }
    return null;
  }

  function getByRole(role: string): HTMLElement {
    const el = queryByRole(role);
    if (!el) throw new Error(`[testing] Element with role "${role}" not found.`);
    return el;
  }

  function queryByRole(role: string): HTMLElement | null {
    return container.querySelector(`[role="${role}"]`) ??
      container.querySelector(roleToTag(role));
  }

  function getByPlaceholder(text: string): HTMLElement {
    const el = container.querySelector(`[placeholder="${text}"]`) as HTMLElement | null;
    if (!el) throw new Error(`[testing] Element with placeholder "${text}" not found.`);
    return el;
  }

  function getByTestId(id: string): HTMLElement {
    const el = queryByTestId(id);
    if (!el) throw new Error(`[testing] Element with data-testid="${id}" not found.`);
    return el;
  }

  function queryByTestId(id: string): HTMLElement | null {
    return container.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  }

  function unmount(): void {
    container.textContent = '';
    container.remove();
  }

  return { container, getByText, getByRole, getByPlaceholder, getByTestId, queryByText, queryByRole, queryByTestId, unmount };
}

/** Map common ARIA roles to HTML tags for implicit role lookup. */
function roleToTag(role: string): string {
  const map: Record<string, string> = {
    button: 'button',
    textbox: 'input[type="text"],input:not([type]),textarea',
    link: 'a[href]',
    heading: 'h1,h2,h3,h4,h5,h6',
    list: 'ul,ol',
    listitem: 'li',
    navigation: 'nav',
    main: 'main',
    form: 'form',
    img: 'img[alt]',
    checkbox: 'input[type="checkbox"]',
    radio: 'input[type="radio"]',
  };
  return map[role] ?? `[role="${role}"]`;
}

/* ────────────────── Fire Events ────────────────── */

export const fireEvent = {
  click(el: HTMLElement): void {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  },
  input(el: HTMLElement, value: string): void {
    (el as HTMLInputElement).value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  },
  change(el: HTMLElement, value: string): void {
    (el as HTMLInputElement).value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  },
  keydown(el: HTMLElement, key: string, modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }): void {
    el.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      ctrlKey: modifiers?.ctrl ?? false,
      shiftKey: modifiers?.shift ?? false,
      altKey: modifiers?.alt ?? false,
    }));
  },
  keyup(el: HTMLElement, key: string): void {
    el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  },
  focus(el: HTMLElement): void {
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    el.focus();
  },
  blur(el: HTMLElement): void {
    el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    el.blur();
  },
  submit(el: HTMLElement): void {
    el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  },
};

/* ────────────────── Async Utilities ────────────────── */

/**
 * Wait for an assertion to pass. Polls until it doesn't throw or times out.
 */
export async function waitFor(
  assertion: () => void,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const { timeout = 1000, interval = 50 } = options ?? {};
  const start = Date.now();

  while (true) {
    try {
      assertion();
      return;
    } catch (err) {
      if (Date.now() - start >= timeout) throw err;
      await new Promise((r) => setTimeout(r, interval));
    }
  }
}

/**
 * Flush all pending microtasks and signal effects.
 */
export function flushEffects(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
