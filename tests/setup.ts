/**
 * Test setup — provides a jsdom environment for DOM-dependent tests.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

// Expose DOM globals
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).Node = dom.window.Node;
(globalThis as any).NodeFilter = dom.window.NodeFilter;
(globalThis as any).DocumentFragment = dom.window.DocumentFragment;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).Event = dom.window.Event;
(globalThis as any).MouseEvent = dom.window.MouseEvent;
(globalThis as any).KeyboardEvent = dom.window.KeyboardEvent;
(globalThis as any).FocusEvent = dom.window.FocusEvent;
(globalThis as any).WebSocket = class MockWebSocket {
  static OPEN = 1;
  readyState = 1;
  onopen: (() => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  send(_data: any) {}
  close() { this.onclose?.(); }
};
(globalThis as any).EventSource = class MockEventSource {
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, Function[]>();
  addEventListener(event: string, handler: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }
  close() {}
};
(globalThis as any).performance = globalThis.performance ?? dom.window.performance;
(globalThis as any).localStorage = dom.window.localStorage;
(globalThis as any).sessionStorage = dom.window.sessionStorage;
(globalThis as any).URL = dom.window.URL;
(globalThis as any).URLSearchParams = dom.window.URLSearchParams;
(globalThis as any).Blob = dom.window.Blob ?? class Blob {};
(globalThis as any).fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '', headers: new Map() });
(globalThis as any).AbortController = dom.window.AbortController;
(globalThis as any).ResizeObserver = class { observe() {} disconnect() {} };
// crypto is already available in Node 22 — don't override
(globalThis as any).btoa = (s: string) => Buffer.from(s).toString('base64');
(globalThis as any).requestAnimationFrame = (fn: Function) => setTimeout(fn, 0);

export { dom };
