/**
 * Analytics page — async loading + transitions.
 * Demonstrates: Suspense, Transition, DevTools, Observer, Plugins, raw(), Guards
 */
import {
  html, createSignal, inject, raw,
} from '../../../src/index';
import { Suspense } from '../../../src/core/suspense';
import { Transition } from '../../../src/core/transition';
import { hasPermission, hasAnyPermission, guardedNode } from '../../../src/core/guard';
import { i18n } from '../config/i18n';
import { http } from '../services/http';
import { observer } from '../services/observer';
import { plugins } from '../services/plugins';
import { NotifyToken } from '../services/notifications';
import { StatCard } from '../components/StatCard';
import { devtools } from '../services/devtools';

export function AnalyticsPage(): Node {
  const activeTab = createSignal<'overview' | 'performance' | 'plugins'>('overview');

  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t('analytics.title')}<span class="feature-badge">Suspense + Transition + DevTools</span></h2>
      </div>

      <div class="filter-bar">
        ${(['overview', 'performance', 'plugins'] as const).map((tab) => html`
          <button
            class=${() => `filter-btn ${activeTab() === tab ? 'active' : ''}`}
            onclick=${() => activeTab.set(tab)}
          >
            ${tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        `)}
      </div>

      ${Transition(
        () => {
          const tab = activeTab();
          if (tab === 'overview') return AnalyticsOverview();
          if (tab === 'performance') return PerformanceTab();
          return PluginsTab();
        },
        {
          enterFrom: { opacity: '0', transform: 'translateY(8px)' },
          enterTo: { opacity: '1', transform: 'translateY(0)' },
          leaveTo: { opacity: '0', transform: 'translateY(-8px)' },
          duration: 200,
          mode: 'out-in',
        }
      )}
    </div>
  `;
}

function AnalyticsOverview(): Node {
  return Suspense(
    async () => {
      const response = await http.get<Array<{ id: number; title: string; completed: boolean }>>('/todos?_limit=20');
      const todos = response.data;
      const completed = todos.filter((t) => t.completed).length;
      const pending = todos.length - completed;

      return html`
        <div>
          <div class="stats-grid">
            ${StatCard({ value: todos.length, label: 'Total Items Fetched' })}
            ${StatCard({ value: completed, label: 'Completed', color: 'var(--success)' })}
            ${StatCard({ value: pending, label: 'Pending', color: 'var(--warning)' })}
            ${StatCard({ value: `${Math.round((completed / todos.length) * 100)}%`, label: 'Completion Rate', color: 'var(--accent)' })}
          </div>
          <div class="card">
            <h3>Remote Data (JSONPlaceholder API) <span class="feature-badge">HTTP Client</span></h3>
            <div class="todo-list">
              ${todos.map((todo) => html`
                <div class="todo-item">
                  <span class=${todo.completed ? 'todo-check done' : 'todo-check'}>
                    ${todo.completed ? '✓' : '○'}
                  </span>
                  <span class=${todo.completed ? 'todo-text completed' : 'todo-text'}>${todo.title}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      `;
    },
    {
      fallback: () => html`
        <div class="card empty-state">
          <p>Loading analytics data...</p>
          <div class="spinner"></div>
        </div>
      `,
      onError: (err) => html`
        <div class="card empty-state">
          <p class="error-text">Failed to load analytics: ${err.message}</p>
        </div>
      `,
    }
  );
}

function PerformanceTab(): Node {
  const stats = devtools.stats();
  console.log('stats',stats);

  return html`
    <div>
      <div class="stats-grid">
        ${StatCard({ value: stats.totalRenders, label: 'Total Renders' })}
        ${StatCard({ value: stats.avgDuration.toFixed(2) + 'ms', label: 'Avg Duration' })}
        ${StatCard({ value: stats.slowestRender ? stats.slowestRender.duration.toFixed(2) + 'ms' : 'N/A', label: 'Slowest Render' })}
        ${StatCard({ value: stats.totalErrors, label: 'Total Errors' })}
      </div>

      <div class="card">
        <h3>DevTools Performance Data <span class="feature-badge">DevTools</span></h3>
        <p class="card-description">
          The devtools hook monitors every effect execution. Connect to APM via the observer.
        </p>
        <button class="btn btn-ghost" onclick=${() => {
          devtools.clear();
          inject(NotifyToken).add('DevTools data cleared');
        }}>Clear Stats</button>
      </div>

      <div class="card section-gap">
        <h3>Observability Events <span class="feature-badge">Observer</span></h3>
        <p class="card-description">
          Check the browser console to see structured events being emitted.
        </p>
        <div class="btn-row">
          <button class="btn btn-ghost btn-sm" onclick=${() => observer.emit('navigate', { from: '/analytics', to: '/test' })}>Emit Navigate</button>
          <button class="btn btn-ghost btn-sm" onclick=${() => observer.metric('test-metric', Math.random() * 100)}>Emit Metric</button>
          <button class="btn btn-ghost btn-sm" onclick=${() => observer.log('info', 'Test log message', { source: 'analytics' })}>Emit Log</button>
        </div>
      </div>
    </div>
  `;
}

function PluginsTab(): Node {
  return html`
    <div>
      <div class="card">
        <h3>Plugin System <span class="feature-badge">Plugins</span></h3>
        <p class="card-description">
          Plugins extend onefold with isolated lifecycle management and permissions.
        </p>
        <div class="plugin-list">
          ${plugins.list().map((name) => html`
            <div class="plugin-item">
              <div class="plugin-info">
                <span class="plugin-name">${name}</span>
                <span class="badge badge-done">${plugins.getStatus(name)}</span>
              </div>
              <div class="btn-row">
                <button class="btn btn-ghost btn-sm" onclick=${() => {
                  plugins.stopPlugin(name);
                  inject(NotifyToken).add(`Plugin "${name}" stopped`);
                }}>Stop</button>
                <button class="btn btn-ghost btn-sm" onclick=${() => {
                  plugins.startPlugin(name);
                  inject(NotifyToken).add(`Plugin "${name}" started`);
                }}>Start</button>
              </div>
            </div>
          `)}
        </div>
      </div>

      <div class="card section-gap">
        <h3>Security Features <span class="feature-badge">Security</span></h3>
        <p class="card-description">
          onefold uses textContent by default. The raw() function provides sanitized HTML.
        </p>
        <div class="code-block">
          ${raw('<strong>This is sanitized HTML via raw()</strong> — safe to use')}
        </div>
        <div class="code-block">
          XSS attempt (auto-escaped): ${'<script>alert("xss")</script>'}
        </div>
      </div>

      <div class="card section-gap">
        <h3>RBAC Guards <span class="feature-badge">Guards</span></h3>
        <p class="card-description">
          Permission-based access control. Current: admin, tasks:read/write, users:read, analytics:read
        </p>
        <div class="badge-row">
          ${() => guardedNode(['admin'], () => html`<span class="badge badge-done">Admin Access</span>`)}
          ${() => guardedNode(['tasks:write'], () => html`<span class="badge badge-done">Tasks Write</span>`)}
          ${() => guardedNode(
            ['billing:manage'],
            () => html`<span class="badge badge-high">Billing</span>`,
            () => html`<span class="badge badge-todo">Billing (no access)</span>`
          )}
        </div>
        <p class="card-description">
          hasPermission('admin'): ${() => hasPermission('admin') ? 'true' : 'false'} |
          hasAnyPermission(['billing:manage','admin']): ${() => hasAnyPermission(['billing:manage', 'admin']) ? 'true' : 'false'}
        </p>
      </div>
    </div>
  `;
}
