/**
 * Top bar with user controls.
 * Demonstrates: DI (inject), theme toggle, i18n locale switch
 */
import { html, inject } from '../../../src/index';
import { AuthToken } from '../services/auth';
import { theme } from '../config/theme';
import { i18n } from '../config/i18n';
import { sidebarCollapsed, preferredLocale } from '../services/store';

export function TopBar(): Node {
  const auth = inject(AuthToken);

  return html`
    <header class="topbar" role="banner">
      <div class="topbar-left">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => sidebarCollapsed.set(!sidebarCollapsed())}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <span class="topbar-subtitle">${() => i18n.t('app.subtitle')}</span>
      </div>
      <div class="topbar-right">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => theme.toggle()}
          aria-label="Toggle theme"
        >
          ${() => theme.current() === 'dark' ? '☀' : '☾'}
        </button>
        <select
          class="locale-select"
          onchange=${(e: Event) => preferredLocale.set((e.target as HTMLSelectElement).value)}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        ${() => {
          const user = auth.user();
          if (!user) {
            return html`<button class="btn btn-primary btn-sm" onclick=${() => auth.login('Admin', 'admin')}>Login</button>`;
          }
          return html`
            <div class="user-info">
              <div class="user-avatar-sm">${user.name.charAt(0)}</div>
              <span class="user-name">${user.name}</span>
              <button class="btn btn-ghost btn-sm" onclick=${() => auth.logout()}>Logout</button>
            </div>
          `;
        }}
      </div>
    </header>
  `;
}
