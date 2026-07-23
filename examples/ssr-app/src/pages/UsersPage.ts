import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';
import type { User } from '../shared/types';

export function UsersPage(users: User[]): unknown {
  return PageLayout('/users', html`
    <div>
      <h1>Users <span style="background:#4338CA;color:white;padding:2px 8px;border-radius:10px;font-size:12px">${String(users.length)}</span></h1>
      <p style="color:#64748b;margin-bottom:16px">Server-fetched data rendered to HTML before sending to browser.</p>
      <ul style="list-style:none;padding:0">
        ${users.map(u => html`
          <li style="padding:12px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>${u.name}</strong>
              <div style="color:#64748b;font-size:13px">${u.email}</div>
            </div>
            <span style="background:#4338CA;color:white;padding:2px 8px;border-radius:10px;font-size:12px">${u.role}</span>
          </li>
        `)}
      </ul>
    </div>
  `);
}
