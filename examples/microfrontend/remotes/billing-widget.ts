/**
 * REMOTE: Billing Widget
 *
 * This is an independently deployable microfrontend.
 * It exports a default function that returns a DOM Node.
 * The host shell loads it via `loadRemote()`.
 *
 * In production, this would be deployed to its own URL:
 *   https://billing.company.com/widget.js
 */
import { createSignal, html, css } from 'onefold';

interface BillingProps {
  accountId?: string;
}

const styles = css`
  .billing-widget {
    font-family: -apple-system, sans-serif;
  }
  .billing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .billing-header h3 {
    margin: 0;
    font-size: 16px;
  }
  .badge {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 12px;
    background: rgba(34,197,94,0.1);
    color: #16a34a;
    font-weight: 600;
  }
  .plan-card {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    padding: 20px;
    color: white;
    margin-bottom: 16px;
  }
  .plan-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .plan-price { font-size: 14px; opacity: 0.8; }
  .usage-bar {
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    margin-top: 12px;
    overflow: hidden;
  }
  .usage-fill {
    height: 100%;
    background: white;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .invoices { list-style: none; padding: 0; margin: 0; }
  .invoices li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
  }
  .invoices li:last-child { border-bottom: none; }
  .amount { font-weight: 600; }
  button {
    width: 100%;
    padding: 10px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 12px;
  }
  button:hover { background: #4338ca; }
`;

export default function BillingWidget(props: BillingProps): Node {
  const usage = createSignal(67);

  const invoices = [
    { date: 'Jul 2026', amount: '$49.00', status: 'Paid' },
    { date: 'Jun 2026', amount: '$49.00', status: 'Paid' },
    { date: 'May 2026', amount: '$39.00', status: 'Paid' },
  ];

  const simulateUsage = () => {
    usage.set(Math.min(100, Math.floor(Math.random() * 40) + 60));
  };

  return html`
    <div class=${styles.scope}>
      <div class="billing-widget">
        <div class="billing-header">
          <h3>Billing — ${props.accountId ?? 'Default'}</h3>
          <span class="badge">Active</span>
        </div>

        <div class="plan-card">
          <div class="plan-name">Pro Plan</div>
          <div class="plan-price">$49/month · Renews Aug 1</div>
          <div class="usage-bar">
            <div class="usage-fill" style=${() => ({ width: `${usage()}%` })}></div>
          </div>
          <div class="plan-price" style=${{ marginTop: '6px' }}>
            ${() => `${usage()}% of API quota used`}
          </div>
        </div>

        <h4 style=${{ fontSize: '14px', margin: '0 0 8px' }}>Recent Invoices</h4>
        <ul class="invoices">
          ${invoices.map((inv) => html`
            <li>
              <span>${inv.date}</span>
              <span class="amount">${inv.amount}</span>
              <span>${inv.status}</span>
            </li>
          `)}
        </ul>

        <button onclick=${simulateUsage}>Simulate API Usage</button>
      </div>
    </div>
  `;
}
