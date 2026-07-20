import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';

export function HomePage(): unknown {
  return PageLayout('/', html`
    <div>
      <h1>onefold SSR</h1>
      <p style="color:#64748b;margin-bottom:20px">Server-rendered with zero dependencies. View page source to see full HTML.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="margin-bottom:8px">Static Pages</h3>
          <p style="color:#64748b;font-size:14px">Home, About, Users — rendered on server. Zero client JavaScript.</p>
        </div>
        <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="margin-bottom:8px">Interactive Pages</h3>
          <p style="color:#64748b;font-size:14px">Counter, Todo, Search — server renders shell, client mounts live components.</p>
        </div>
      </div>
    </div>
  `);
}
