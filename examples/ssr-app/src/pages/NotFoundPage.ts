import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';

export function NotFoundPage(): unknown {
  return PageLayout('', html`
    <div style="text-align:center;padding:60px 0">
      <h1 style="font-size:64px;color:#e5e7eb">404</h1>
      <p style="color:#64748b;margin-bottom:16px">Page not found</p>
      <a href="/" style="color:#4338CA">Go home</a>
    </div>
  `);
}
