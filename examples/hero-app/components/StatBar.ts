import { html } from 'onefold';

/** A reusable power stat bar component. */
export function StatBar(label: string, value: number): Node {
  const color =
    value >= 80 ? '#22c55e' :
    value >= 50 ? '#eab308' :
    '#ef4444';

  return html`
    <div class="stat-bar">
      <span class="stat-label">${label}</span>
      <div class="stat-track">
        <div class="stat-fill" style=${{ width: `${value}%`, backgroundColor: color }}></div>
      </div>
      <span class="stat-value">${String(value)}</span>
    </div>
  `;
}
