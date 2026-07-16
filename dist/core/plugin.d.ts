/**
 * Plugin system with lifecycle management, isolation, and permissions.
 *
 * Plugins extend onefold without modifying the core. Each plugin declares
 * what it needs (permissions), gets lifecycle hooks, and runs in isolation
 * so a broken plugin can't crash the host app.
 *
 * Usage:
 * ```ts
 * const plugins = createPluginHost();
 *
 * plugins.register({
 *   name: 'analytics',
 *   version: '1.0.0',
 *   permissions: ['observe', 'navigate'],
 *   setup: (ctx) => {
 *     ctx.on('navigate', (e) => track(e));
 *   },
 *   teardown: () => { ... },
 * });
 *
 * plugins.start(); // Calls setup() on all registered plugins
 * plugins.stop();  // Calls teardown() on all
 * ```
 */
/** Permissions a plugin can request. */
export type PluginPermission = 'observe' | 'navigate' | 'state' | 'dom' | 'network' | 'storage';
/** The context passed to a plugin's setup function. */
export interface PluginContext {
    /** Plugin name. */
    name: string;
    /** Subscribe to lifecycle events within the plugin's scope. */
    on: (event: string, handler: (...args: unknown[]) => void) => () => void;
    /** Emit an event visible to other plugins and the host. */
    emit: (event: string, ...args: unknown[]) => void;
    /** Permissions granted to this plugin. */
    permissions: ReadonlySet<PluginPermission>;
    /** Check if a permission is granted. */
    hasPermission: (perm: PluginPermission) => boolean;
}
/** Plugin definition. */
export interface PluginDefinition {
    /** Unique plugin identifier. */
    name: string;
    /** Semantic version string. */
    version: string;
    /** Permissions this plugin requires. */
    permissions?: PluginPermission[];
    /** Called when the plugin is started. Receives the plugin context. */
    setup: (ctx: PluginContext) => void | (() => void);
    /** Called when the plugin is stopped. */
    teardown?: () => void;
    /** If true, errors in this plugin don't propagate to the host. Default: true. */
    sandbox?: boolean;
}
/** Represents a registered and running plugin instance. */
interface PluginInstance {
    definition: PluginDefinition;
    status: 'registered' | 'active' | 'stopped' | 'error';
    disposers: (() => void)[];
    setupDisposer: (() => void) | null;
}
/** The plugin host manages all plugins. */
export interface PluginHost {
    /** Register a plugin. Does not start it. */
    register: (plugin: PluginDefinition) => void;
    /** Unregister a plugin by name. Stops it first if active. */
    unregister: (name: string) => void;
    /** Start all registered (but not yet active) plugins. */
    start: () => void;
    /** Start a specific plugin by name. */
    startPlugin: (name: string) => void;
    /** Stop all active plugins. */
    stop: () => void;
    /** Stop a specific plugin by name. */
    stopPlugin: (name: string) => void;
    /** Get the status of a plugin. */
    getStatus: (name: string) => PluginInstance['status'] | null;
    /** List all registered plugin names. */
    list: () => string[];
    /** Subscribe to host-level events (plugin:registered, plugin:started, plugin:stopped, plugin:error). */
    on: (event: string, handler: (...args: unknown[]) => void) => () => void;
}
/**
 * Create a plugin host. Each host is independent — use one per app
 * or multiple for microfrontend boundaries.
 */
export declare function createPluginHost(): PluginHost;
export {};
