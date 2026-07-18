/**
 * StatCard — displays a single metric.
 * Demonstrates: component metadata registry
 */
import { html, component } from '../../../src/index';

export const StatCard = component<{ value: string | number; label: string; color?: string }>({
  name: 'StatCard',
  description: 'Displays a single statistic with label',
  props: {
    value: { type: 'string | number', required: true },
    label: { type: 'string', required: true },
    color: { type: 'string', required: false },
  },
  tags: ['stat', 'dashboard'],
  render: ({ value, label, color }) => html`
    <div class="stat-card">
      <div class="stat-value" style=${color ? { color } : {}}>${value}</div>
      <div class="stat-label">${label}</div>
    </div>
  `,
});
