import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';

export function SearchPage(): unknown {
  return PageLayout('/search', html`
    <div>
      <h1>Live Search</h1>
      <p style="color:#64748b;margin-bottom:16px">Interactive — type to filter in real-time.</p>
      <div id="interactive" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;min-height:200px">
        <p style="color:#94a3b8">Loading...</p>
      </div>
    </div>
  `);
}
