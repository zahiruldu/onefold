/**
 * Component Metadata Registry — structured metadata for AI tools,
 * visual builders, and documentation generators.
 *
 * Usage:
 * ```ts
 * const UserCard = component({
 *   name: 'UserCard',
 *   description: 'Displays user profile with avatar and stats',
 *   props: {
 *     user: { type: 'User', required: true, description: 'User object' },
 *     compact: { type: 'boolean', default: false },
 *   },
 *   render: ({ user, compact }) => html`...`,
 * });
 *
 * // AI/tooling can query the registry:
 * getComponentRegistry() → all registered components with full metadata
 * ```
 */
/* ────────────────── Registry ────────────────── */
const registry = new Map();
/**
 * Define a component with metadata. Registers it in the global registry
 * so AI tools and visual builders can discover it.
 *
 * Returns a callable function (same as a plain component).
 */
export function component(meta) {
    const { render, ...metaOnly } = meta;
    registry.set(meta.name, {
        meta: metaOnly,
        factory: render,
    });
    // Return the render function as the component callable
    return render;
}
/**
 * Get all registered components with their metadata.
 * Used by AI tools, devtools, and manifest generators.
 */
export function getComponentRegistry() {
    return registry;
}
/**
 * Get a specific component's metadata by name.
 */
export function getComponentMeta(name) {
    return registry.get(name);
}
/**
 * Export the registry as a plain JSON-serializable manifest.
 * This is what gets written to .onefold/manifest.json at build time.
 */
export function exportManifest() {
    const components = [];
    for (const [, entry] of registry) {
        components.push(entry.meta);
    }
    return { version: '1.0', framework: 'onefold', components };
}
