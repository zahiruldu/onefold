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
/* ────────────────── Implementation ────────────────── */
/**
 * Create a plugin host. Each host is independent — use one per app
 * or multiple for microfrontend boundaries.
 */
export function createPluginHost() {
    const plugins = new Map();
    const hostListeners = new Map();
    const pluginEventBus = new Map();
    function hostEmit(event, ...args) {
        const set = hostListeners.get(event);
        if (set)
            for (const handler of set)
                handler(...args);
    }
    function register(definition) {
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
    function unregister(name) {
        const instance = plugins.get(name);
        if (!instance)
            return;
        if (instance.status === 'active')
            stopPlugin(name);
        plugins.delete(name);
    }
    function startPlugin(name) {
        const instance = plugins.get(name);
        if (!instance || instance.status === 'active')
            return;
        const def = instance.definition;
        const sandbox = def.sandbox !== false; // default true
        const permissions = new Set(def.permissions ?? []);
        const ctx = {
            name: def.name,
            permissions,
            hasPermission: (perm) => permissions.has(perm),
            on: (event, handler) => {
                const key = `${name}:${event}`;
                if (!pluginEventBus.has(key))
                    pluginEventBus.set(key, new Set());
                const set = pluginEventBus.get(key);
                set.add(handler);
                const disposer = () => { set.delete(handler); };
                instance.disposers.push(disposer);
                return disposer;
            },
            emit: (event, ...args) => {
                // Emit to plugin's own listeners
                const key = `${name}:${event}`;
                const set = pluginEventBus.get(key);
                if (set)
                    for (const handler of set)
                        handler(...args);
                // Also emit to host-level listeners
                hostEmit(`plugin:event:${event}`, name, ...args);
            },
        };
        try {
            const disposer = def.setup(ctx);
            instance.setupDisposer = typeof disposer === 'function' ? disposer : null;
            instance.status = 'active';
            hostEmit('plugin:started', name);
        }
        catch (err) {
            instance.status = 'error';
            hostEmit('plugin:error', name, err);
            if (!sandbox)
                throw err;
        }
    }
    function stopPlugin(name) {
        const instance = plugins.get(name);
        if (!instance || instance.status !== 'active')
            return;
        const sandbox = instance.definition.sandbox !== false;
        try {
            // Run setup disposer
            instance.setupDisposer?.();
            // Run teardown
            instance.definition.teardown?.();
            // Cleanup event subscriptions
            for (const disposer of instance.disposers)
                disposer();
            instance.disposers.length = 0;
        }
        catch (err) {
            hostEmit('plugin:error', name, err);
            if (!sandbox)
                throw err;
        }
        instance.status = 'stopped';
        hostEmit('plugin:stopped', name);
    }
    function start() {
        for (const [name, instance] of plugins) {
            if (instance.status === 'registered' || instance.status === 'stopped') {
                startPlugin(name);
            }
        }
    }
    function stop() {
        for (const [name, instance] of plugins) {
            if (instance.status === 'active')
                stopPlugin(name);
        }
    }
    function getStatus(name) {
        return plugins.get(name)?.status ?? null;
    }
    function list() {
        return [...plugins.keys()];
    }
    function on(event, handler) {
        if (!hostListeners.has(event))
            hostListeners.set(event, new Set());
        const set = hostListeners.get(event);
        set.add(handler);
        return () => { set.delete(handler); };
    }
    return { register, unregister, start, startPlugin, stop, stopPlugin, getStatus, list, on };
}
