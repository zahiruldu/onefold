/**
 * Notification service.
 * Demonstrates: DI (provide/inject), a11y (announce)
 */
import { createSignal, createToken, provide, announce } from '../../../src/index';

export interface NotificationService {
  notifications: ReturnType<typeof createSignal<string[]>>;
  add: (msg: string) => void;
  clear: () => void;
}

export const NotifyToken = createToken<NotificationService>('NotificationService');

const notifList = createSignal<string[]>([]);

export const notifService: NotificationService = {
  notifications: notifList,
  add: (msg) => {
    notifList.set((prev) => [...prev.slice(-4), msg]);
    announce(msg); // Screen reader announcement
  },
  clear: () => notifList.set([]),
};

provide(NotifyToken, notifService);
