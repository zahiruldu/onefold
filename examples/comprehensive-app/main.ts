/**
 * onefold Comprehensive Example App — Task Management Dashboard
 *
 * Entry point. Wires together all services and mounts the app.
 *
 * Features demonstrated across the app:
 * - Signals, Effects, Computed, Batch (core reactivity)
 * - HTML Templates with reactive bindings
 * - Scoped CSS (css tagged template)
 * - Router with params + guards
 * - Store (state management)
 * - Dependency Injection (DI)
 * - HTTP Client with interceptors
 * - Forms with validation rules
 * - i18n (internationalization)
 * - Persisted signals (localStorage)
 * - RBAC Guards (permissions)
 * - Theming (CSS custom properties)
 * - Observability (structured events)
 * - Plugin system (lifecycle, permissions)
 * - Error Boundaries
 * - Suspense (async loading)
 * - Transitions (enter/leave animations)
 * - Virtual List (windowed rendering)
 * - Accessibility (focus trap, announcements, keyboard shortcuts, skip link)
 * - DevTools integration
 * - Component metadata registry
 * - Security (XSS prevention, raw(), sanitization)
 */

import {
  html, mount, css,
  Router, navigate, guard,
  useKeyboard, SkipLink, announce,
} from '../../src/index';

// ─── Config & Services ───────────────────────────────────────────
import { theme } from './config/theme';
import { i18n } from './config/i18n';
import { userPermissions } from './config/permissions';
import { authService } from './services/auth';
import { notifService } from './services/notifications';
import { observer } from './services/observer';
import { plugins } from './services/plugins';
import { devtools } from './services/devtools';

// Force references so tree-shaking doesn't drop side-effect modules
void userPermissions;
void authService;
void notifService;
void observer;

// ─── Store ───
import { sidebarCollapsed } from './services/store';

// ─── Components ───
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NotificationToasts } from './components/Notifications';

// ─── Pages ───
import { HomePage } from './pages/Home';
import { TasksPage } from './pages/Tasks';
import { UsersPage } from './pages/Users';
import { AnalyticsPage } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { NotFoundPage, AccessDeniedPage } from './pages/NotFound';


// ═══════════════════════════════════════════════════════════════════
// SCOPED CSS — Application-wide styles
// ═══════════════════════════════════════════════════════════════════

const appStyles = css`
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--app-bg);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
  }

  .sidebar {
    width: 260px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    overflow: hidden;
  }
  .sidebar.collapsed { width: 60px; }
  .sidebar-header {
    padding: 0 20px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sidebar-header h1 { font-size: 18px; white-space: nowrap; }
  .sidebar-logo { font-size: 24px; }
  .sidebar-footer { margin-top: auto; padding: 12px 20px; }
  .sidebar-version { font-size: 11px; color: rgba(255,255,255,0.5); }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 14px;
  }
  .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
  .nav-item .icon { width: 20px; text-align: center; flex-shrink: 0; }

  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .topbar {
    height: 60px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-subtitle { font-size: 14px; color: var(--text-secondary); }
  .locale-select {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 12px;
  }
  .user-info { display: flex; align-items: center; gap: 8px; }
  .user-avatar-sm {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px;
  }
  .user-name { font-size: 13px; }

  .content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost { background: transparent; color: var(--text-primary); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--border); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-row { display: flex; gap: 12px; }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
  }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .card-description { margin-top: 12px; color: var(--text-secondary); font-size: 13px; }
  .section-gap { margin-top: 16px; }

  .badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-todo { background: #dbeafe; color: #1e40af; }
  .badge-in-progress { background: #fef3c7; color: #92400e; }
  .badge-done { background: #d1fae5; color: #065f46; }
  .badge-high { background: #fee2e2; color: #991b1b; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-low { background: #d1fae5; color: #065f46; }
  .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

  .notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toast-item {
    background: var(--card-bg);
    border: 1px solid var(--border);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-size: 14px;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stat-value { font-size: 32px; font-weight: 700; color: var(--accent); }
  .stat-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

  .task-grid { display: grid; gap: 12px; }
  .task-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  .task-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .task-info { flex: 1; }
  .task-title { font-weight: 600; margin-bottom: 4px; }
  .task-desc { font-size: 13px; color: var(--text-secondary); }
  .task-meta { display: flex; gap: 8px; margin-top: 8px; }
  .task-assignee { font-size: 12px; color: var(--text-secondary); }

  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-btn {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .filter-count { margin-left: auto; font-size: 13px; color: var(--text-secondary); }
  .search-input {
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    width: 240px;
    transition: all 0.2s;
  }
  .search-input:focus { outline: none; border-color: var(--accent); width: 300px; }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .modal h2 { margin-bottom: 20px; font-size: 20px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .form-error { color: var(--danger); font-size: 12px; margin-top: 4px; min-height: 16px; }
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
  }
  .inline-select { width: auto; }
  .form-body { margin-top: 16px; }
  .form-status { margin-top: 12px; font-size: 12px; color: var(--text-secondary); }

  .user-grid { display: grid; gap: 12px; }
  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .user-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px;
  }
  .user-details { flex: 1; }
  .user-name { font-weight: 600; }
  .user-email { font-size: 13px; color: var(--text-secondary); }
  .user-company { font-size: 12px; color: var(--text-secondary); }

  .virtual-list-section { margin-top: 24px; }
  .virtual-list-section h3 { margin-bottom: 12px; }
  .virtual-row {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .virtual-row-id { width: 60px; color: var(--text-secondary); }
  .virtual-row-name { flex: 1; font-weight: 500; }
  .virtual-row-value { width: 100px; text-align: right; color: var(--accent); }

  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .settings-section { margin-bottom: 24px; }
  .settings-section h3 { margin-bottom: 12px; font-size: 16px; }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .setting-value { color: var(--accent); font-weight: 600; }
  .toggle {
    width: 44px; height: 24px;
    border-radius: 12px;
    background: var(--border);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    border: none;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: '';
    width: 20px; height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px; left: 2px;
    transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(20px); }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .page-header h2 { font-size: 24px; font-weight: 700; }
  .feature-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    background: var(--accent);
    color: white;
    margin-left: 8px;
    vertical-align: middle;
  }
  .feature-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; }
  .feature-item { padding: 8px 12px; background: var(--app-bg); border-radius: 6px; font-size: 13px; border: 1px solid var(--border); }

  .empty-state { text-align: center; padding: 40px; }
  .error-text { color: var(--danger); }
  .error-code { font-size: 48px; color: var(--text-secondary); }
  .access-denied-title { font-size: 32px; color: var(--danger); }

  .todo-list { margin-top: 12px; max-height: 300px; overflow-y: auto; }
  .todo-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .todo-check { font-size: 16px; color: var(--text-secondary); }
  .todo-check.done { color: var(--success); }
  .todo-text.completed { text-decoration: line-through; color: var(--text-secondary); }

  .code-block { margin-top: 8px; padding: 12px; background: var(--app-bg); border-radius: 8px; font-family: monospace; font-size: 13px; }

  .plugin-list { margin-top: 16px; }
  .plugin-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .plugin-info { display: flex; align-items: center; gap: 8px; }
  .plugin-name { font-weight: 600; }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 12px auto 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;


// ═══════════════════════════════════════════════════════════════════
// APP SHELL — Router + Layout + Keyboard shortcuts
// ═══════════════════════════════════════════════════════════════════

function App(): Node {
  // Keyboard shortcuts (a11y)
  useKeyboard({
    'Escape': () => announce('Modal closed'),
    'Ctrl+K': () => {
      const search = document.querySelector('.search-input') as HTMLInputElement | null;
      if (search) search.focus();
      announce('Search focused');
    },
  });

  // Router with guarded routes
  const router = Router(
    [
      { path: '/', view: () => HomePage() },
      { path: '/tasks', view: guard(['tasks:read'], () => TasksPage(), () => AccessDeniedPage()) },
      { path: '/users', view: guard(['users:read'], () => UsersPage(), () => AccessDeniedPage()) },
      { path: '/analytics', view: guard(['analytics:read'], () => AnalyticsPage(), () => AccessDeniedPage()) },
      { path: '/settings', view: () => SettingsPage() },
    ],
    () => NotFoundPage()
  );

  return html`
    <div class=${appStyles.scope}>
      ${SkipLink('#main-content')}
      ${NotificationToasts()}
      <div class="app-shell">
        ${Sidebar()}
        <div class="main-area">
          ${TopBar()}
          <main class="content" id="main-content" role="main">
            ${router}
          </main>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════════════════════════════

mount(App(), document.getElementById('app')!);

console.log('═══════════════════════════════════════');
console.log(' onefold Comprehensive Demo');
console.log(' Features: 22+');
console.log(' DevTools:', devtools.active ? 'enabled' : 'disabled');
console.log(' Plugins:', plugins.list().join(', '));
console.log(' Theme:', theme.current());
console.log(' Locale:', i18n.locale());
console.log('═══════════════════════════════════════');
