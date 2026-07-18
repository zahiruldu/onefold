/**
 * TaskCard — displays a single task.
 * Demonstrates: component metadata, html templates, event binding
 */
import { html, component } from '../../../src/index';
import type { Task } from '../services/store';

export const TaskCard = component<{ task: Task; onStatusChange: (id: number, status: Task['status']) => void }>({
  name: 'TaskCard',
  description: 'Displays a single task with status management',
  props: {
    task: { type: 'Task', required: true, description: 'The task object to display' },
    onStatusChange: { type: 'function', required: true, description: 'Status change callback' },
  },
  tags: ['task', 'card'],
  render: ({ task, onStatusChange }) => {
    const nextStatus = (current: Task['status']): Task['status'] => {
      const flow: Record<Task['status'], Task['status']> = {
        'todo': 'in-progress',
        'in-progress': 'done',
        'done': 'todo',
      };
      return flow[current];
    };

    return html`
      <div class="task-card">
        <div class="task-info">
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-meta">
            <span class=${`badge badge-${task.status}`}>${task.status}</span>
            <span class=${`badge badge-${task.priority}`}>${task.priority}</span>
            <span class="task-assignee">${task.assignee}</span>
          </div>
        </div>
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => onStatusChange(task.id, nextStatus(task.status))}
          aria-label=${`Move task "${task.title}" to ${nextStatus(task.status)}`}
        >
          Next
        </button>
      </div>
    `;
  },
});
