/**
 * Streaming data primitives — WebSocket, Server-Sent Events (SSE), and
 * generic event streams as reactive signals.
 *
 * Usage:
 * ```ts
 * // WebSocket
 * const messages = createWebSocket<ChatMessage>('wss://chat.app.com/room/1');
 * html`<ul>${() => messages.data()?.map(m => html`<li>${m.text}</li>`)}</ul>`
 * messages.send({ text: 'Hello!' });
 *
 * // Server-Sent Events (SSE)
 * const feed = createEventSource<Notification>('/api/notifications');
 * html`<span>${() => feed.latest()?.title}</span>`
 *
 * // Manual close
 * messages.close();
 * feed.close();
 * ```
 */

import { createSignal, type Signal } from './signal';

/* ────────────────── WebSocket ────────────────── */

export interface WebSocketStream<T> {
  /** All received messages (reactive). */
  data: Signal<T[]>;
  /** The most recent message (reactive). */
  latest: Signal<T | null>;
  /** Connection state: 'connecting' | 'open' | 'closed' | 'error'. */
  status: Signal<'connecting' | 'open' | 'closed' | 'error'>;
  /** Send a message. Serializes to JSON automatically. */
  send: (message: unknown) => void;
  /** Close the connection. */
  close: () => void;
  /** Reconnect manually after close/error. */
  reconnect: () => void;
}

export interface WebSocketOptions {
  /** Max messages to keep in the data array. Default: 100. */
  maxMessages?: number;
  /** Auto-reconnect on disconnect. Default: true. */
  autoReconnect?: boolean;
  /** Reconnect delay in ms. Default: 3000. */
  reconnectDelay?: number;
  /** Max reconnect attempts. Default: 5. */
  maxRetries?: number;
  /** Transform raw message before storing. Default: JSON.parse. */
  parse?: (raw: string) => unknown;
}

/**
 * Create a reactive WebSocket connection.
 */
export function createWebSocket<T = unknown>(
  url: string,
  options?: WebSocketOptions
): WebSocketStream<T> {
  const {
    maxMessages = 100,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxRetries = 5,
    parse = (raw: string) => JSON.parse(raw) as unknown,
  } = options ?? {};

  const data = createSignal<T[]>([]);
  const latest = createSignal<T | null>(null);
  const status = createSignal<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  let ws: WebSocket | null = null;
  let retries = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect(): void {
    status.set('connecting');
    ws = new WebSocket(url);

    ws.onopen = () => {
      status.set('open');
      retries = 0;
    };

    ws.onmessage = (event) => {
      try {
        const parsed = parse(event.data as string) as T;
        latest.set(parsed);
        data.set((prev) => {
          const next = [...prev, parsed];
          return next.length > maxMessages ? next.slice(-maxMessages) : next;
        });
      } catch { /* ignore malformed messages */ }
    };

    ws.onerror = () => {
      status.set('error');
    };

    ws.onclose = () => {
      status.set('closed');
      ws = null;
      if (autoReconnect && retries < maxRetries) {
        retries++;
        reconnectTimer = setTimeout(connect, reconnectDelay);
      }
    };
  }

  connect();

  return {
    data,
    latest,
    status,
    send: (message) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof message === 'string' ? message : JSON.stringify(message));
      }
    },
    close: () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      retries = maxRetries; // prevent auto-reconnect
      ws?.close();
    },
    reconnect: () => {
      retries = 0;
      ws?.close();
      connect();
    },
  };
}

/* ────────────────── Server-Sent Events (SSE) ────────────────── */

export interface EventSourceStream<T> {
  /** All received events (reactive). */
  data: Signal<T[]>;
  /** Most recent event (reactive). */
  latest: Signal<T | null>;
  /** Connection state. */
  status: Signal<'connecting' | 'open' | 'closed' | 'error'>;
  /** Close the connection. */
  close: () => void;
}

export interface EventSourceOptions {
  /** Max events to retain. Default: 100. */
  maxEvents?: number;
  /** Custom event name to listen for. Default: 'message'. */
  eventName?: string;
  /** Transform raw data string. Default: JSON.parse. */
  parse?: (raw: string) => unknown;
}

/**
 * Create a reactive Server-Sent Events (SSE) stream.
 */
export function createEventSource<T = unknown>(
  url: string,
  options?: EventSourceOptions
): EventSourceStream<T> {
  const {
    maxEvents = 100,
    eventName = 'message',
    parse = (raw: string) => JSON.parse(raw) as unknown,
  } = options ?? {};

  const data = createSignal<T[]>([]);
  const latest = createSignal<T | null>(null);
  const status = createSignal<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  const source = new EventSource(url);

  source.onopen = () => status.set('open');
  source.onerror = () => status.set('error');

  source.addEventListener(eventName, (event) => {
    try {
      const parsed = parse((event as MessageEvent).data as string) as T;
      latest.set(parsed);
      data.set((prev) => {
        const next = [...prev, parsed];
        return next.length > maxEvents ? next.slice(-maxEvents) : next;
      });
    } catch { /* ignore */ }
  });

  return {
    data,
    latest,
    status,
    close: () => {
      source.close();
      status.set('closed');
    },
  };
}
