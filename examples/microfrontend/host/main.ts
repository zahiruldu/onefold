/**
 * HOST SHELL — Microfrontend Orchestrator
 *
 * This is the main application shell. It loads remote widgets from
 * different URLs (simulating different teams/deployments).
 *
 * Key concepts demonstrated:
 * 1. loadRemote()     — dynamically load remote ES modules as components
 * 2. Shadow DOM       — isolate remote widget CSS from the host
 * 3. Shared state     — remotes can receive props from the host
 * 4. Fallback/Error   — graceful handling of network failures
 * 5. preloadRemote()  — prefetch remotes on hover for faster interaction
 */
import {
  createSignal,
  html,
  css,
  mount,
  loadRemote,
  preloadRemote,
  configureSecurity,
} from 'onefold';

// ─── Scoped styles for the host shell ─────────────────────────────────────
const shell = css`
  .shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
  }
  .shell-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .shell-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
  }
  .shell-header p {
    color: #6b7280;
    font-size: 14px;
  }
  .architecture {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .architecture h2 { font-size: 16px; margin: 0 0 12px; }
  .architecture pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
    overflow-x: auto;
    margin: 0;
  }
  .widgets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 768px) {
    .widgets { grid-template-columns: 1fr; }
  }
  .widget-frame {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }
  .widget-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .widget-toolbar span {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .team-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #eef2ff;
    color: #4f46e5;
  }
  .widget-content {
    padding: 20px;
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    color: #9ca3af;
    font-size: 14px;
  }
  .spinner-ring {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    color: #dc2626;
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }
  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .controls button {
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }
  .controls button:hover { border-color: #6366f1; color: #6366f1; }
  .controls button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .isolation-note {
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
    margin-top: 6px;
    font-style: italic;
  }
`;

// ─── Remote URLs — loaded from a separate origin (port 3033) ──────────────
// In production these would be completely different domains:
//   https://billing.company.com/widget.js
//   https://analytics.company.com/widget.js
const REMOTES = {
  billing: 'http://localhost:3033/billing-widget.js',
  analytics: 'http://localhost:3033/analytics-widget.js',
};

// ─── Loading & error fallbacks ────────────────────────────────────────────
function LoadingFallback(): Node {
  return html`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>Loading remote widget...</span>
    </div>
  `;
}

function ErrorFallback(err: Error): Node {
  return html`<div class="error-msg">Failed to load: ${err.message}</div>`;
}

// ─── Host Shell App ───────────────────────────────────────────────────────
function App(): Node {
  const isolationMode = createSignal<'none' | 'shadow'>('none');
  const accountId = createSignal('ACCT-7291');

  // Create remote components
  const BillingWidget = loadRemote({
    url: REMOTES.billing,
    isolate: 'none', // We'll toggle this dynamically
    fallback: LoadingFallback,
    onError: ErrorFallback,
  });

  const AnalyticsWidget = loadRemote({
    url: REMOTES.analytics,
    isolate: 'none',
    fallback: LoadingFallback,
    onError: ErrorFallback,
  });

  // Prefetch on hover
  const prefetchBilling = () => preloadRemote(REMOTES.billing);
  const prefetchAnalytics = () => preloadRemote(REMOTES.analytics);

  return html`
    <div class=${shell.scope}>
      <div class="shell">
        <div class="shell-header">
          <h1>Microfrontend Demo</h1>
          <p>Host shell loading independent remote widgets via <code>loadRemote()</code></p>
        </div>

        <div class="architecture">
          <h2>Architecture (Two Ports)</h2>
          <pre>Host Shell — http://localhost:3032
 │
 ├── loadRemote('http://localhost:3033/billing-widget.js')
 │   └── Team: Payments (deployed independently)
 │
 └── loadRemote('http://localhost:3033/analytics-widget.js')
     └── Team: Data (deployed independently)

Remote Server — http://localhost:3033  (CORS enabled)
 ├── billing-widget.js   (self-contained ES module)
 └── analytics-widget.js (self-contained ES module)</pre>
        </div>

        <div class="controls">
          <button
            class=${() => isolationMode() === 'none' ? 'active' : ''}
            onclick=${() => isolationMode.set('none')}
          >No Isolation</button>
          <button
            class=${() => isolationMode() === 'shadow' ? 'active' : ''}
            onclick=${() => isolationMode.set('shadow')}
          >Shadow DOM Isolation</button>
        </div>

        <div class="widgets">
          <div class="widget-frame" onmouseenter=${prefetchBilling}>
            <div class="widget-toolbar">
              <span>Billing Widget</span>
              <span class="team-badge">Team: Payments</span>
            </div>
            <div class="widget-content">
              ${BillingWidget({ accountId: accountId() })}
            </div>
            <p class="isolation-note">${() => `Isolation: ${isolationMode()}`}</p>
          </div>

          <div class="widget-frame" onmouseenter=${prefetchAnalytics}>
            <div class="widget-toolbar">
              <span>Analytics Widget</span>
              <span class="team-badge">Team: Data</span>
            </div>
            <div class="widget-content">
              ${AnalyticsWidget({ dashboardId: 'main' })}
            </div>
            <p class="isolation-note">${() => `Isolation: ${isolationMode()}`}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

mount(App(), document.getElementById('app')!);
