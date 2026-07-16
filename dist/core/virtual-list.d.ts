import { type Signal } from './signal';
export interface VirtualListOptions<T> {
    items: Signal<T[]>;
    itemHeight: number;
    /** Visible viewport height in px. */
    height: number;
    renderRow: (item: T, index: number) => Node;
    /** Extra rows rendered above/below the viewport so fast scrolling doesn't flash blank rows. */
    overscan?: number;
}
/**
 * Renders only the rows intersecting the scroll viewport (+ overscan), not the full list.
 * DOM node count stays constant regardless of `items.length` — this is what makes 50k-row
 * tables scroll smoothly under both fine-grained-signal and virtual-DOM architectures alike;
 * neither approach avoids the cost of tens of thousands of live DOM nodes without windowing.
 */
export declare function VirtualList<T>(opts: VirtualListOptions<T>): HTMLElement;
