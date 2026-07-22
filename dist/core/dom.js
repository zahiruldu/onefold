/**
 * DOM mounting. `html`\`...\`` (template.ts) is the only element-construction API —
 * this file just attaches a built node to the page.
 */
/** Replace a container's contents with a node. The one place a framework user calls "render". */
export function mount(node, container) {
    container.replaceChildren(node);
}
export { raw } from '../security/sanitize.js';
