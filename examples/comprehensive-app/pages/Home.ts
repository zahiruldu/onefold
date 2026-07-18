/**
 * Home page — dashboard overview.
 * Demonstrates: computed signals, store, i18n, component rendering
 */
import { html } from '../../../src/index';
import { i18n } from '../config/i18n';
import { taskStats } from '../services/store';
import { StatCard } from '../components/StatCard';

export function HomePage(): Node {
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t('app.title')}<span class="feature-badge">Signals + Store + i18n</span></h2>
      </div>

      <div class="stats-grid">
        ${() => {
          const stats = taskStats();
          return [
            StatCard({ value: stats.total, label: 'Total Tasks' }),
            StatCard({ value: stats.todo, label: 'To Do', color: 'var(--warning)' }),
            StatCard({ value: stats.inProgress, label: 'In Progress', color: 'var(--accent)' }),
            StatCard({ value: stats.done, label: 'Completed', color: 'var(--success)' }),
          ];
        }}
      </div>

      <div class="card">
        <h3>Welcome to the onefold Comprehensive Demo</h3>
        <p class="card-description">
          This application demonstrates every feature of the onefold framework
          in a realistic task management dashboard. Navigate using the sidebar to
          explore different features.
        </p>
        <div class="feature-grid">
          ${FeatureList()}
        </div>
      </div>
    </div>
  `;
}

function FeatureList(): Node {
  const features = [
    'Signals & Reactivity', 'HTML Templates', 'Scoped CSS',
    'Router & Navigation', 'Store (State)', 'Dependency Injection',
    'HTTP Client', 'Forms & Validation', 'i18n', 'Persisted State',
    'RBAC Guards', 'Theming', 'Observability', 'Plugins',
    'Error Boundaries', 'Suspense', 'Transitions', 'Virtual List',
    'Streaming (WS/SSE)', 'Accessibility', 'DevTools', 'Component Meta',
  ];
  return html`
    ${features.map((f) => html`<div class="feature-item">${f}</div>`)}
  `;
}
