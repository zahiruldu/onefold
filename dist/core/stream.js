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
import { createSignal } from './signal.js';
/**
 * Create a reactive WebSocket connection.
 */
export function createWebSocket(url, options) {
    const { maxMessages = 100, autoReconnect = true, reconnectDelay = 3000, maxRetries = 5, parse = (raw) => JSON.parse(raw), } = options ?? {};
    const data = createSignal([]);
    const latest = createSignal(null);
    const status = createSignal('connecting');
    let ws = null;
    let retries = 0;
    let reconnectTimer = null;
    function connect() {
        status.set('connecting');
        ws = new WebSocket(url);
        ws.onopen = () => {
            status.set('open');
            retries = 0;
        };
        ws.onmessage = (event) => {
            try {
                const parsed = parse(event.data);
                latest.set(parsed);
                data.set((prev) => {
                    const next = [...prev, parsed];
                    return next.length > maxMessages ? next.slice(-maxMessages) : next;
                });
            }
            catch { /* ignore malformed messages */ }
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
            if (reconnectTimer)
                clearTimeout(reconnectTimer);
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
/**
 * Create a reactive Server-Sent Events (SSE) stream.
 */
export function createEventSource(url, options) {
    const { maxEvents = 100, eventName = 'message', parse = (raw) => JSON.parse(raw), } = options ?? {};
    const data = createSignal([]);
    const latest = createSignal(null);
    const status = createSignal('connecting');
    const source = new EventSource(url);
    source.onopen = () => status.set('open');
    source.onerror = () => status.set('error');
    source.addEventListener(eventName, (event) => {
        try {
            const parsed = parse(event.data);
            latest.set(parsed);
            data.set((prev) => {
                const next = [...prev, parsed];
                return next.length > maxEvents ? next.slice(-maxEvents) : next;
            });
        }
        catch { /* ignore */ }
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
