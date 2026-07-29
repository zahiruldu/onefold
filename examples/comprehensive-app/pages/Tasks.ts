/**
 * Tasks page — CRUD with form validation.
 * Demonstrates: createForm, validation rules, guards, store, DI, FocusTrap
 */
import {
  html, createSignal, inject,
} from '../../../src/index';
import { createForm, required, minLength, maxLength } from '../../../src/core/form';
import { guardedNode } from '../../../src/core/guard';
import { FocusTrap } from '../../../src/core/a11y';
import { i18n } from '../config/i18n';
import { appStore, filteredTasks, type Task, type AppState } from '../services/store';
import { NotifyToken } from '../services/notifications';
import { observer } from '../services/observer';
import { TaskCard } from '../components/TaskCard';

export function TasksPage(): Node {
  const showModal = createSignal(false);

  const taskForm = createForm({
    title: { initial: '', rules: [required('Title is required'), minLength(3, 'At least 3 characters')] },
    description: { initial: '', rules: [required('Description is required'), maxLength(200, 'Max 200 chars')] },
    priority: { initial: 'medium' as string, rules: [required()] },
    assignee: { initial: '', rules: [required('Assignee is required')] },
  });

  const handleStatusChange = (id: number, newStatus: Task['status']) => {
    appStore.update((prev) => ({
      tasks: prev.tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t),
    }));
    const notif = inject(NotifyToken);
    notif.add(`Task status updated to "${newStatus}"`);
    observer.emit('custom', { type: 'task-status-change', payload: { id, newStatus } });
  };

  const handleAddTask = () => {
    taskForm.submit((values) => {
      const newTask: Task = {
        id: Date.now(),
        title: values.title,
        description: values.description,
        status: 'todo',
        priority: values.priority as Task['priority'],
        assignee: values.assignee,
        createdAt: new Date().toISOString().split('T')[0]!,
      };
      appStore.update((prev) => ({ tasks: [...prev.tasks, newTask] }));
      inject(NotifyToken).add(`Task "${values.title}" created`);
      taskForm.reset();
      showModal.set(false);
    });
  };

  const handleFilterChange = (filter: AppState['filter']) => {
    appStore.update({ filter });
  };

  const handleSearch = (e: Event) => {
    appStore.update({ searchQuery: (e.target as HTMLInputElement).value });
  };

  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t('tasks.title')}<span class="feature-badge">Forms + Store + Guards</span></h2>
        ${() => guardedNode(['tasks:write'], () => html`
          <button class="btn btn-primary" onclick=${() => showModal.set(true)}>
            + ${() => i18n.t('tasks.add')}
          </button>
        `)}
      </div>

      <div class="filter-bar">
        <input
          class="search-input"
          type="text"
          placeholder="Search tasks..."
          value=${() => appStore().searchQuery}
          oninput=${handleSearch}
          aria-label="Search tasks"
        />
        ${(['all', 'todo', 'in-progress', 'done'] as const).map((f) => html`
          <button
            class=${() => `filter-btn ${appStore().filter === f ? 'active' : ''}`}
            onclick=${() => handleFilterChange(f)}
          >
            ${f === 'all' ? 'All' : f}
          </button>
        `)}
        <span class="filter-count">
          ${() => i18n.t('tasks.total', { count: filteredTasks().length })}
        </span>
      </div>

      <div class="task-grid">
        ${() => {
          const tasks = filteredTasks();
          if (tasks.length === 0) {
            return html`<div class="card empty-state">
              <p>${() => i18n.t('tasks.empty')}</p>
            </div>`;
          }
          return tasks.map((task) => TaskCard({ task, onStatusChange: handleStatusChange }));
        }}
      </div>

      ${() => showModal() ? TaskFormModal(taskForm, handleAddTask, () => { showModal.set(false); taskForm.reset(); }) : null}
    </div>
  `;
}

function TaskFormModal(
  form: ReturnType<typeof createForm>,
  onSubmit: () => void,
  onClose: () => void
): Node {
  setTimeout(() => {
    const modal = document.querySelector('.modal') as HTMLElement | null;
    if (modal) {
      const trap = FocusTrap(modal);
      trap.activate();
    }
  }, 0);

  return html`
    <div class="modal-overlay" onclick=${(e: Event) => {
      if ((e.target as HTMLElement).classList.contains('modal-overlay')) onClose();
    }}>
      <div class="modal">
        <h2>${() => i18n.t('tasks.add')}</h2>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" type="text" value=${() => form.fields.title.value()} oninput=${form.fields.title.handle} placeholder="Task title..." />
          <div class="form-error">${() => form.fields.title.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" rows="3" value=${() => form.fields.description.value()} oninput=${form.fields.description.handle} placeholder="Task description..."></textarea>
          <div class="form-error">${() => form.fields.description.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" onchange=${form.fields.priority.handle}>
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Assignee</label>
          <input class="form-input" type="text" value=${() => form.fields.assignee.value()} oninput=${form.fields.assignee.handle} placeholder="Assignee name..." />
          <div class="form-error">${() => form.fields.assignee.error()}</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick=${onClose}>${() => i18n.t('common.cancel')}</button>
          <button class="btn btn-primary" onclick=${onSubmit}>${() => i18n.t('form.submit')}</button>
        </div>
      </div>
    </div>
  `;
}
