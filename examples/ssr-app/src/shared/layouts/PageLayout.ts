import { html } from 'onefold';
import { Nav } from '../components/Nav';

export function PageLayout(activePath: string, content: unknown): unknown {
  return html`
    <div>
      ${Nav(activePath)}
      ${content}
    </div>
  `;
}
