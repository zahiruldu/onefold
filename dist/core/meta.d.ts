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
export interface PropMeta {
    /** TypeScript type as string (for documentation/AI). */
    type?: string;
    /** Whether the prop is required. */
    required?: boolean;
    /** Default value. */
    default?: unknown;
    /** Human-readable description (for AI/docs). */
    description?: string;
}
export interface ComponentMeta<P = Record<string, unknown>> {
    /** Component name (PascalCase). */
    name: string;
    /** Human-readable description of what the component does. */
    description?: string;
    /** Prop definitions with metadata. */
    props?: Record<string, PropMeta>;
    /** Events this component can emit (for documentation). */
    events?: string[];
    /** Named slots/children this component accepts. */
    slots?: string[];
    /** Tags for categorization (e.g., ['form', 'input']). */
    tags?: string[];
    /** The render function. */
    render: (props: P) => Node;
}
export interface RegisteredComponent {
    meta: Omit<ComponentMeta, 'render'>;
    factory: (props: Record<string, unknown>) => Node;
}
/**
 * Define a component with metadata. Registers it in the global registry
 * so AI tools and visual builders can discover it.
 *
 * Returns a callable function (same as a plain component).
 */
export declare function component<P extends Record<string, unknown>>(meta: ComponentMeta<P>): (props: P) => Node;
/**
 * Get all registered components with their metadata.
 * Used by AI tools, devtools, and manifest generators.
 */
export declare function getComponentRegistry(): Map<string, RegisteredComponent>;
/**
 * Get a specific component's metadata by name.
 */
export declare function getComponentMeta(name: string): RegisteredComponent | undefined;
/**
 * Export the registry as a plain JSON-serializable manifest.
 * This is what gets written to .onefold/manifest.json at build time.
 */
export declare function exportManifest(): object;
