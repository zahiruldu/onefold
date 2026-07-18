/**
 * 404 and Access Denied pages.
 */
import { html, navigate } from '../../../src/index';

export function NotFoundPage(): Node {
  return html`
    <div class="card empty-state">
      <h2 class="error-code">404</h2>
      <p class="error-text">Page not found</p>
      <button class="btn btn-primary" onclick=${() => navigate('/')}>Go Home</button>
    </div>
  `;
}

export function AccessDeniedPage(): Node {
  return html`
    <div class="card empty-state">
      <h2 class="access-denied-title">Access Denied</h2>
      <p class="error-text">You don't have permission to view this page.</p>
      <button class="btn btn-primary" onclick=${() => navigate('/')}>Go Home</button>
    </div>
  `;
}
