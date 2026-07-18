import { html, Link } from 'onefold';

export function NotFoundPage(): Node {
  return html`
    <div class="page not-found">
      <h1>404</h1>
      <p>Page not found. The route you visited doesn't match any defined pattern.</p>
      ${Link('/', 'Go Home', 'btn')}
    </div>
  `;
}
