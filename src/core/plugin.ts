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

/* ────────────────── Types ────────────────── */

/** Permissions a plugin can request. */
export type PluginPermission =
  | 'observe'     // Can subscribe to observer events
  | 'navigate'    // Can call navigate()
  | 'state'       // Can read/write global state
  | 'dom'         // Can access DOM directly
  | 'network'     // Can make network requests
  | 'storage';    // Can access localStorage/sessionStorage

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

/* ────────────────── Implementation ────────────────── */

/**
 * Create a plugin host. Each host is independent — use one per app
 * or multiple for microfrontend boundaries.
 */
export function createPluginHost(): PluginHost {
  const plugins = new Map<string, PluginInstance>();
  const hostListeners = new Map<string, Set<(...args: unknown[]) => void>>();
  const pluginEventBus = new Map<string, Set<(...args: unknown[]) => void>>();

  function hostEmit(event: string, ...args: unknown[]): void {
    const set = hostListeners.get(event);
    if (set) for (const handler of set) handler(...args);
  }

  function register(definition: PluginDefinition): void {
    if (plugins.has(definition.name)) {
      throw new Error(`[onefold] Plugin "${definition.name}" is already registered.`);
    }
    plugins.set(definition.name, {
      definition,
      status: 'registered',
      disposers: [],
      setupDisposer: null,
    });
    hostEmit('plugin:registered', definition.name, definition.version);
  }

  function unregister(name: string): void {
    const instance = plugins.get(name);
    if (!instance) return;
    if (instance.status === 'active') stopPlugin(name);
    plugins.delete(name);
  }

  function startPlugin(name: string): void {
    const instance = plugins.get(name);
    if (!instance || instance.status === 'active') return;

    const def = instance.definition;
    const sandbox = def.sandbox !== false; // default true
    const permissions = new Set<PluginPermission>(def.permissions ?? []);

    const ctx: PluginContext = {
      name: def.name,
      permissions,
      hasPermission: (perm) => permissions.has(perm),
      on: (event, handler) => {
        const key = `${name}:${event}`;
        if (!pluginEventBus.has(key)) pluginEventBus.set(key, new Set());
        const set = pluginEventBus.get(key)!;
        set.add(handler);
        const disposer = () => { set.delete(handler); };
        instance.disposers.push(disposer);
        return disposer;
      },
      emit: (event, ...args) => {
        // Emit to plugin's own listeners
        const key = `${name}:${event}`;
        const set = pluginEventBus.get(key);
        if (set) for (const handler of set) handler(...args);
        // Also emit to host-level listeners
        hostEmit(`plugin:event:${event}`, name, ...args);
      },
    };

    try {
      const disposer = def.setup(ctx);
      instance.setupDisposer = typeof disposer === 'function' ? disposer : null;
      instance.status = 'active';
      hostEmit('plugin:started', name);
    } catch (err) {
      instance.status = 'error';
      hostEmit('plugin:error', name, err);
      if (!sandbox) throw err;
    }
  }

  function stopPlugin(name: string): void {
    const instance = plugins.get(name);
    if (!instance || instance.status !== 'active') return;

    const sandbox = instance.definition.sandbox !== false;
    try {
      // Run setup disposer
      instance.setupDisposer?.();
      // Run teardown
      instance.definition.teardown?.();
      // Cleanup event subscriptions
      for (const disposer of instance.disposers) disposer();
      instance.disposers.length = 0;
    } catch (err) {
      hostEmit('plugin:error', name, err);
      if (!sandbox) throw err;
    }
    instance.status = 'stopped';
    hostEmit('plugin:stopped', name);
  }

  function start(): void {
    for (const [name, instance] of plugins) {
      if (instance.status === 'registered' || instance.status === 'stopped') {
        startPlugin(name);
      }
    }
  }

  function stop(): void {
    for (const [name, instance] of plugins) {
      if (instance.status === 'active') stopPlugin(name);
    }
  }

  function getStatus(name: string): PluginInstance['status'] | null {
    return plugins.get(name)?.status ?? null;
  }

  function list(): string[] {
    return [...plugins.keys()];
  }

  function on(event: string, handler: (...args: unknown[]) => void): () => void {
    if (!hostListeners.has(event)) hostListeners.set(event, new Set());
    const set = hostListeners.get(event)!;
    set.add(handler);
    return () => { set.delete(handler); };
  }

  return { register, unregister, start, startPlugin, stop, stopPlugin, getStatus, list, on };
}
