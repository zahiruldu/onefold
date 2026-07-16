/**
 * Observability hooks — structured event system for monitoring, logging,
 * error reporting, and performance tracking.
 *
 * Zero dependencies. Hooks are opt-in: if you never call `observe()`,
 * zero overhead at runtime and fully tree-shaken from the bundle.
 *
 * Usage:
 * ```ts
 * const obs = createObserver();
 *
 * // Subscribe to events
 * obs.on('error', (e) => sendToSentry(e.error));
 * obs.on('navigate', (e) => analytics.pageView(e.to));
 * obs.on('render', (e) => perfMonitor.record(e.component, e.duration));
 *
 * // Emit from your app code
 * obs.emit('navigate', { from: '/', to: '/about' });
 *
 * // Or use the built-in helpers
 * obs.trackRender('UserList', () => renderUserList());
 * obs.trackError(() => riskyOperation());
 * ```
 */
/**
 * Create an observer instance. Lightweight event bus for structured telemetry.
 * No global state — create one per app or per feature boundary.
 */
export function createObserver() {
    const listeners = new Map();
    function on(event, handler) {
        if (!listeners.has(event))
            listeners.set(event, new Set());
        const set = listeners.get(event);
        set.add(handler);
        return () => { set.delete(handler); };
    }
    function emit(event, data) {
        const fullEvent = { ...data, timestamp: Date.now() };
        const set = listeners.get(event);
        if (set) {
            for (const handler of set)
                handler(fullEvent);
        }
    }
    function trackRender(component, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        emit('render', { component, duration });
        return result;
    }
    function trackError(fn, context) {
        try {
            return fn();
        }
        catch (error) {
            emit('error', { error, context });
            return undefined;
        }
    }
    function metric(name, value, tags) {
        emit('metric', { name, value, tags });
    }
    function log(level, message, data) {
        emit('log', { level, message, data });
    }
    function clear() {
        listeners.clear();
    }
    return { on, emit, trackRender, trackError, metric, log, clear };
}
