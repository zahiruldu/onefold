/**
 * REMOTE: Analytics Widget
 *
 * Another independently deployable microfrontend.
 * This could be owned by a different team (e.g., "Data Team").
 *
 * In production: https://analytics.company.com/widget.js
 */
import { createSignal, createEffect, html, css } from 'onefold';

interface AnalyticsProps {
  dashboardId?: string;
}

const styles = css`
  .analytics-widget {
    font-family: -apple-system, sans-serif;
  }
  .analytics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .analytics-header h3 { margin: 0; font-size: 16px; }
  .live-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: #f9fafb;
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }
  .stat-up { color: #16a34a; }
  .stat-down { color: #dc2626; }
  .chart {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 80px;
    padding: 8px 0;
  }
  .chart-bar {
    flex: 1;
    background: #6366f1;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
    min-height: 4px;
  }
  .chart-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
  }
`;

export default function AnalyticsWidget(props: AnalyticsProps): Node {
  const visitors = createSignal(1247);
  const pageViews = createSignal(3891);
  const bounceRate = createSignal(32);
  const avgDuration = createSignal(185);
  const chartData = createSignal([35, 52, 41, 67, 45, 78, 62, 55, 71, 48, 83, 59]);

  // Simulate live data updates
  const intervalId = setInterval(() => {
    visitors.set((v) => v + Math.floor(Math.random() * 10) - 3);
    pageViews.set((v) => v + Math.floor(Math.random() * 15));
    bounceRate.set(() => Math.floor(Math.random() * 15) + 25);
    avgDuration.set(() => Math.floor(Math.random() * 60) + 150);
    chartData.set((prev) => {
      const next = [...prev.slice(1), Math.floor(Math.random() * 60) + 30];
      return next;
    });
  }, 2000);

  // Cleanup on unmount
  if (typeof MutationObserver !== 'undefined') {
    setTimeout(() => {
      const el = document.querySelector(`[data-remote*="analytics"]`);
      if (el) {
        const observer = new MutationObserver(() => {
          if (!el.isConnected) { clearInterval(intervalId); observer.disconnect(); }
        });
        if (el.parentNode) observer.observe(el.parentNode, { childList: true });
      }
    }, 0);
  }

  return html`
    <div class=${styles.scope}>
      <div class="analytics-widget">
        <div class="analytics-header">
          <h3>Analytics${props.dashboardId ? ` — ${props.dashboardId}` : ''}</h3>
          <span><span class="live-dot"></span>Live</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value stat-up">${() => visitors().toLocaleString()}</div>
            <div class="stat-label">Active Visitors</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${() => pageViews().toLocaleString()}</div>
            <div class="stat-label">Page Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-down">${() => `${bounceRate()}%`}</div>
            <div class="stat-label">Bounce Rate</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${() => `${Math.floor(avgDuration() / 60)}:${String(avgDuration() % 60).padStart(2, '0')}`}</div>
            <div class="stat-label">Avg Duration</div>
          </div>
        </div>

        <div class="chart">
          ${() => chartData().map((val) => html`
            <div class="chart-bar" style=${{ height: `${val}%` }}></div>
          `)}
        </div>
        <div class="chart-label">
          <span>12 intervals ago</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  `;
}
