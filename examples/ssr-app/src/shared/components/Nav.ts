import { html } from 'onefold';

const LINKS: [string, string][] = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/users', 'Users'],
  ['/counter', 'Counter'],
  ['/todo', 'Todo'],
  ['/search', 'Search'],
];

export function Nav(activePath: string): unknown {
  return html`
    <nav style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin-bottom:24px;flex-wrap:wrap">
      ${LINKS.map(([href, label]) => html`
        <a href=${href} style=${`color:#4338CA;text-decoration:none;font-weight:${activePath === href ? '700' : '400'}`}>${label}</a>
      `)}
    </nav>
  `;
}
