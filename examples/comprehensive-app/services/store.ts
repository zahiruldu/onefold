/**
 * Application store — global state management.
 * Demonstrates: createStore, createComputed, createPersisted, createEffect
 */
import { createStore, createComputed, createPersisted, createEffect } from '../../../src/index';
import { i18n } from '../config/i18n';

// ─── Types ───────────────────────────────────────────

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  createdAt: string;
}

export interface AppState {
  tasks: Task[];
  filter: 'all' | 'todo' | 'in-progress' | 'done';
  searchQuery: string;
}

// ─── Store ───────────────────────────────────────────

export const appStore = createStore<AppState>({
  tasks: [
    { id: 1, title: 'Implement authentication', description: 'Add JWT-based auth flow', status: 'done', priority: 'high', assignee: 'Alice', createdAt: '2024-01-15' },
    { id: 2, title: 'Design dashboard UI', description: 'Create responsive layout', status: 'in-progress', priority: 'medium', assignee: 'Bob', createdAt: '2024-01-16' },
    { id: 3, title: 'Write unit tests', description: 'Cover critical paths', status: 'todo', priority: 'high', assignee: 'Charlie', createdAt: '2024-01-17' },
    { id: 4, title: 'Setup CI/CD pipeline', description: 'GitHub Actions workflow', status: 'todo', priority: 'medium', assignee: 'Alice', createdAt: '2024-01-18' },
    { id: 5, title: 'API documentation', description: 'OpenAPI spec for all endpoints', status: 'in-progress', priority: 'low', assignee: 'Diana', createdAt: '2024-01-19' },
    { id: 6, title: 'Performance audit', description: 'Lighthouse and bundle analysis', status: 'todo', priority: 'medium', assignee: 'Bob', createdAt: '2024-01-20' },
  ],
  filter: 'all',
  searchQuery: '',
});

// ─── Computed (derived state) ────────────────────────

export const filteredTasks = createComputed(() => {
  const state = appStore();
  const { tasks, filter, searchQuery } = state;
  let result = tasks;
  if (filter !== 'all') {
    result = result.filter((t) => t.status === filter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q)
    );
  }
  return result;
});

export const taskStats = createComputed(() => {
  const { tasks } = appStore();
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
  };
});

// ─── Persisted signals ───────────────────────────────

export const sidebarCollapsed = createPersisted('sidebar-collapsed', false);
export const preferredLocale = createPersisted('preferred-locale', 'en');
export const notificationsEnabled = createPersisted('notifications-enabled', true);

// Sync persisted locale with i18n
createEffect(() => {
  i18n.setLocale(preferredLocale());
});
