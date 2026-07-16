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
import { type Signal } from './signal';
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
export declare function createWebSocket<T = unknown>(url: string, options?: WebSocketOptions): WebSocketStream<T>;
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
export declare function createEventSource<T = unknown>(url: string, options?: EventSourceOptions): EventSourceStream<T>;
