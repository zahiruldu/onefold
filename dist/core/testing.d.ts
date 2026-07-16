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
export declare function render(componentFn: () => Node): RenderResult;
export declare const fireEvent: {
    click(el: HTMLElement): void;
    input(el: HTMLElement, value: string): void;
    change(el: HTMLElement, value: string): void;
    keydown(el: HTMLElement, key: string, modifiers?: {
        ctrl?: boolean;
        shift?: boolean;
        alt?: boolean;
    }): void;
    keyup(el: HTMLElement, key: string): void;
    focus(el: HTMLElement): void;
    blur(el: HTMLElement): void;
    submit(el: HTMLElement): void;
};
/**
 * Wait for an assertion to pass. Polls until it doesn't throw or times out.
 */
export declare function waitFor(assertion: () => void, options?: {
    timeout?: number;
    interval?: number;
}): Promise<void>;
/**
 * Flush all pending microtasks and signal effects.
 */
export declare function flushEffects(): Promise<void>;
