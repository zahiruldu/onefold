import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';

export function AboutPage(): unknown {
  return PageLayout('/about', html`
    <div>
      <h1>About</h1>
      <p style="color:#64748b;margin-bottom:16px">Static page — no JavaScript required.</p>
      <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
        <h3 style="margin-bottom:8px">Architecture</h3>
        <p style="color:#64748b;font-size:14px">The html template tokenizes strings. renderHTML() converts tokens to HTML — no jsdom, no DOM simulation. ~0.5ms per page.</p>
      </div>
    </div>
  `);
}
