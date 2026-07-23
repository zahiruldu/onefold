import { createSignal, createEffect } from './signal.js';
import { disposeOnRemove } from './lifecycle.js';
/**
 * Renders only the rows intersecting the scroll viewport (+ overscan), not the full list.
 * DOM node count stays constant regardless of `items.length` — this is what makes 50k-row
 * tables scroll smoothly under both fine-grained-signal and virtual-DOM architectures alike;
 * neither approach avoids the cost of tens of thousands of live DOM nodes without windowing.
 */
export function VirtualList(opts) {
    const { items, itemHeight, height, renderRow, overscan = 6 } = opts;
    const scrollTop = createSignal(0);
    const viewport = document.createElement('div');
    viewport.style.height = `${height}px`;
    viewport.style.overflowY = 'auto';
    viewport.style.position = 'relative';
    viewport.setAttribute('role', 'list');
    const spacer = document.createElement('div');
    spacer.style.position = 'relative';
    viewport.appendChild(spacer);
    const rowPool = new Map();
    viewport.addEventListener('scroll', () => scrollTop.set(viewport.scrollTop), { passive: true });
    const dispose = createEffect(() => {
        const list = items();
        const total = list.length;
        spacer.style.height = `${total * itemHeight}px`;
        const top = scrollTop();
        const first = Math.max(0, Math.floor(top / itemHeight) - overscan);
        const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
        const last = Math.min(total, first + visibleCount);
        const wanted = new Set();
        for (let i = first; i < last; i++)
            wanted.add(i);
        // Drop rows scrolled out of range.
        for (const [i, node] of rowPool) {
            if (!wanted.has(i)) {
                node.remove();
                rowPool.delete(i);
            }
        }
        // Mount any newly-visible rows; existing ones are left untouched (no re-render).
        for (let i = first; i < last; i++) {
            if (rowPool.has(i))
                continue;
            const item = list[i];
            if (item === undefined)
                continue;
            const row = renderRow(item, i);
            const wrapper = row instanceof HTMLElement ? row : (() => {
                const d = document.createElement('div');
                d.appendChild(row);
                return d;
            })();
            wrapper.style.position = 'absolute';
            wrapper.style.top = `${i * itemHeight}px`;
            wrapper.style.left = '0';
            wrapper.style.right = '0';
            wrapper.style.height = `${itemHeight}px`;
            spacer.appendChild(wrapper);
            rowPool.set(i, wrapper);
        }
    });
    // This effect closes over `items` and every mounted row's DOM node. Without
    // disposing it when `viewport` leaves the page (e.g. a route change), the
    // `items` signal keeps the effect — and every row it ever mounted — alive
    // indefinitely. See lifecycle.ts for the full explanation of this leak class.
    disposeOnRemove(viewport, dispose);
    return viewport;
}
