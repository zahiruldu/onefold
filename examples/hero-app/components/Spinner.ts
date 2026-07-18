import { html } from 'onefold';

/** A reusable loading spinner component. */
export function Spinner(message = 'Loading...'): Node {
  return html`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>${message}</span>
    </div>
  `;
}
