import { html } from 'onefold';
import { PageLayout } from '../shared/layouts/PageLayout';

/** Server renders just the shell. Client mounts the interactive counter. */
export function CounterPage(): unknown {
  return PageLayout('/counter', html`
    <div>
      <h1>Counter</h1>
      <p style="color:#64748b;margin-bottom:16px">Interactive — buttons work after JavaScript loads.</p>
      <div id="interactive" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;min-height:120px;display:flex;align-items:center;justify-content:center">
        <p style="color:#94a3b8">Loading...</p>
      </div>
    </div>
  `);
}
