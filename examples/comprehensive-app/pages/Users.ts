/**
 * Users page — remote data + virtual list.
 * Demonstrates: createResource, ErrorBoundary, Suspense, VirtualList, HTTP
 */
import {
  html, createSignal, createResource, ErrorBoundary,
} from '../../../src/index';
import { VirtualList } from '../../../src/core/virtual-list';
import { i18n } from '../config/i18n';
import { http } from '../services/http';

export function UsersPage(): Node {
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t('users.title')}<span class="feature-badge">Resource + ErrorBoundary + VirtualList</span></h2>
      </div>

      ${ErrorBoundary(
        () => UsersContent(),
        (error, retry) => html`
          <div class="card empty-state">
            <p class="error-text">${() => i18n.t('common.error')}: ${error.message}</p>
            <button class="btn btn-primary" onclick=${retry}>Retry</button>
          </div>
        `
      )}
    </div>
  `;
}

interface RemoteUser {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

function UsersContent(): Node {
  const users = createResource(
    () => 'users' as const,
    async () => {
      const response = await http.get<RemoteUser[]>('/users');
      return response.data;
    }
  );

  return html`
    <div>
      ${() => {
        if (users.loading()) {
          return html`<div class="card empty-state"><p>${() => i18n.t('common.loading')}</p></div>`;
        }
        if (users.error()) {
          return html`<div class="card empty-state">
            <p class="error-text">Failed to load users</p>
            <button class="btn btn-primary" onclick=${() => users.refetch()}>Retry</button>
          </div>`;
        }
        const data = users.data();
        if (!data) return html`<p>No data</p>`;
        return html`
          <div class="user-grid">
            ${data.map((user) => html`
              <div class="user-card">
                <div class="user-avatar">${user.name.charAt(0)}</div>
                <div class="user-details">
                  <div class="user-name">${user.name}</div>
                  <div class="user-email">${user.email}</div>
                  <div class="user-company">${user.company.name}</div>
                </div>
              </div>
            `)}
          </div>

          <div class="virtual-list-section">
            <h3>Virtual List Demo (1000 items, windowed)
              <span class="feature-badge">VirtualList</span>
            </h3>
            ${VirtualListDemo()}
          </div>
        `;
      }}
    </div>
  `;
}

function VirtualListDemo(): Node {
  const items = createSignal(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Item #${i + 1} — ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]}`,
      value: Math.round(Math.random() * 10000) / 100,
    }))
  );

  return VirtualList({
    items,
    itemHeight: 40,
    height: 300,
    overscan: 4,
    renderRow: (item) => html`
      <div class="virtual-row">
        <span class="virtual-row-id">#${item.id}</span>
        <span class="virtual-row-name">${item.name}</span>
        <span class="virtual-row-value">$${item.value.toFixed(2)}</span>
      </div>
    `,
  });
}
