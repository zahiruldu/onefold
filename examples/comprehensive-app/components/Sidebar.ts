/**
 * Sidebar navigation.
 * Demonstrates: Router (navigate, currentRoute), persisted signals, i18n, a11y
 */
import { html, navigate, currentRoute } from '../../../src/index';
import { i18n } from '../config/i18n';
import { sidebarCollapsed } from '../services/store';
import { observer } from '../services/observer';

export function Sidebar(): Node {
  const navItems = [
    { path: '/', icon: '◉', label: () => i18n.t('nav.home') },
    { path: '/tasks', icon: '☰', label: () => i18n.t('nav.tasks') },
    { path: '/users', icon: '◎', label: () => i18n.t('nav.users') },
    { path: '/analytics', icon: '◇', label: () => i18n.t('nav.analytics') },
    { path: '/settings', icon: '⚙', label: () => i18n.t('nav.settings') },
  ];

  return html`
    <aside class=${() => `sidebar ${sidebarCollapsed() ? 'collapsed' : ''}`} role="navigation" aria-label="Main navigation">
      <div class="sidebar-header">
        <span class="sidebar-logo">◈</span>
        ${() => sidebarCollapsed() ? null : html`<h1>${() => i18n.t('app.title')}</h1>`}
      </div>
      <nav>
        ${navItems.map((item) => html`
          <button
            class=${() => `nav-item ${currentRoute() === item.path ? 'active' : ''}`}
            onclick=${() => {
              navigate(item.path);
              observer.emit('navigate', { from: currentRoute(), to: item.path });
            }}
            aria-current=${() => currentRoute() === item.path ? 'page' : 'false'}
          >
            <span class="icon">${item.icon}</span>
            ${() => sidebarCollapsed() ? null : html`<span>${item.label()}</span>`}
          </button>
        `)}
      </nav>
      <div class="sidebar-footer">
        ${() => sidebarCollapsed() ? null : html`
          <div class="sidebar-version">onefold v0.1.0</div>
        `}
      </div>
    </aside>
  `;
}
