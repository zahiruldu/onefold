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
/**
 * Render a component into a detached DOM container for testing.
 */
export function render(componentFn) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const node = componentFn();
    container.appendChild(node);
    function getByText(text) {
        const el = queryByText(text);
        if (!el)
            throw new Error(`[testing] Element with text "${text}" not found.`);
        return el;
    }
    function queryByText(text) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let current;
        while ((current = walker.nextNode())) {
            if (current.textContent?.includes(text)) {
                return (current.parentElement ?? current);
            }
        }
        return null;
    }
    function getByRole(role) {
        const el = queryByRole(role);
        if (!el)
            throw new Error(`[testing] Element with role "${role}" not found.`);
        return el;
    }
    function queryByRole(role) {
        return container.querySelector(`[role="${role}"]`) ??
            container.querySelector(roleToTag(role));
    }
    function getByPlaceholder(text) {
        const el = container.querySelector(`[placeholder="${text}"]`);
        if (!el)
            throw new Error(`[testing] Element with placeholder "${text}" not found.`);
        return el;
    }
    function getByTestId(id) {
        const el = queryByTestId(id);
        if (!el)
            throw new Error(`[testing] Element with data-testid="${id}" not found.`);
        return el;
    }
    function queryByTestId(id) {
        return container.querySelector(`[data-testid="${id}"]`);
    }
    function unmount() {
        container.textContent = '';
        container.remove();
    }
    return { container, getByText, getByRole, getByPlaceholder, getByTestId, queryByText, queryByRole, queryByTestId, unmount };
}
/** Map common ARIA roles to HTML tags for implicit role lookup. */
function roleToTag(role) {
    const map = {
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
    click(el) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    },
    input(el, value) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    change(el, value) {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    keydown(el, key, modifiers) {
        el.dispatchEvent(new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            ctrlKey: modifiers?.ctrl ?? false,
            shiftKey: modifiers?.shift ?? false,
            altKey: modifiers?.alt ?? false,
        }));
    },
    keyup(el, key) {
        el.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    },
    focus(el) {
        el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        el.focus();
    },
    blur(el) {
        el.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
        el.blur();
    },
    submit(el) {
        el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    },
};
/* ────────────────── Async Utilities ────────────────── */
/**
 * Wait for an assertion to pass. Polls until it doesn't throw or times out.
 */
export async function waitFor(assertion, options) {
    const { timeout = 1000, interval = 50 } = options ?? {};
    const start = Date.now();
    while (true) {
        try {
            assertion();
            return;
        }
        catch (err) {
            if (Date.now() - start >= timeout)
                throw err;
            await new Promise((r) => setTimeout(r, interval));
        }
    }
}
/**
 * Flush all pending microtasks and signal effects.
 */
export function flushEffects() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}
