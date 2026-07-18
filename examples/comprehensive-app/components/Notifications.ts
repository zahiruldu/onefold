/**
 * Toast notifications.
 * Demonstrates: inject (DI), reactive list rendering
 */
import { html, inject } from '../../../src/index';
import { NotifyToken } from '../services/notifications';

export function NotificationToasts(): Node {
  const notif = inject(NotifyToken);
  return html`
    <div class="notification-toast">
      ${() => notif.notifications().map((msg) => html`
        <div class="toast-item">${msg}</div>
      `)}
    </div>
  `;
}
