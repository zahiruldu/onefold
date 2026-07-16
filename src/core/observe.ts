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

/* ────────────────── Event types ────────────────── */

export interface ObserveEvents {
  /** An error occurred in application code. */
  error: { error: unknown; context?: string; timestamp: number };
  /** A navigation occurred. */
  navigate: { from: string; to: string; timestamp: number };
  /** A component render was tracked. */
  render: { component: string; duration: number; timestamp: number };
  /** A custom metric was recorded. */
  metric: { name: string; value: number; tags?: Record<string, string>; timestamp: number };
  /** A log entry. */
  log: { level: 'debug' | 'info' | 'warn' | 'error'; message: string; data?: unknown; timestamp: number };
  /** A custom event (escape hatch). */
  custom: { type: string; payload: unknown; timestamp: number };
}

export type EventName = keyof ObserveEvents;
export type EventHandler<K extends EventName> = (event: ObserveEvents[K]) => void;

/* ────────────────── Observer ────────────────── */

export interface Observer {
  /** Subscribe to an event type. Returns an unsubscribe function. */
  on: <K extends EventName>(event: K, handler: EventHandler<K>) => () => void;
  /** Emit an event to all subscribers. */
  emit: <K extends EventName>(event: K, data: Omit<ObserveEvents[K], 'timestamp'>) => void;
  /** Track a render: measures duration and emits a 'render' event. */
  trackRender: <T>(component: string, fn: () => T) => T;
  /** Track an error-prone operation: catches errors and emits 'error' event. */
  trackError: <T>(fn: () => T, context?: string) => T | undefined;
  /** Convenience: emit a metric. */
  metric: (name: string, value: number, tags?: Record<string, string>) => void;
  /** Convenience: structured logging. */
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) => void;
  /** Remove all subscribers. */
  clear: () => void;
}

/**
 * Create an observer instance. Lightweight event bus for structured telemetry.
 * No global state — create one per app or per feature boundary.
 */
export function createObserver(): Observer {
  const listeners = new Map<EventName, Set<EventHandler<any>>>();

  function on<K extends EventName>(event: K, handler: EventHandler<K>): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    const set = listeners.get(event)!;
    set.add(handler);
    return () => { set.delete(handler); };
  }

  function emit<K extends EventName>(event: K, data: Omit<ObserveEvents[K], 'timestamp'>): void {
    const fullEvent = { ...data, timestamp: Date.now() } as ObserveEvents[K];
    const set = listeners.get(event);
    if (set) {
      for (const handler of set) handler(fullEvent);
    }
  }

  function trackRender<T>(component: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    emit('render', { component, duration });
    return result;
  }

  function trackError<T>(fn: () => T, context?: string): T | undefined {
    try {
      return fn();
    } catch (error) {
      emit('error', { error, context });
      return undefined;
    }
  }

  function metric(name: string, value: number, tags?: Record<string, string>): void {
    emit('metric', { name, value, tags });
  }

  function log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    emit('log', { level, message, data });
  }

  function clear(): void {
    listeners.clear();
  }

  return { on, emit, trackRender, trackError, metric, log, clear };
}
