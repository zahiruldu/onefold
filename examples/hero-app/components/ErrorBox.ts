import { html } from 'onefold';

/** A reusable error display component with retry action. */
export function ErrorBox(message: string, onRetry?: () => void): Node {
  return html`
    <div class="error-box">
      <span class="error-icon">⚠</span>
      <p>${message}</p>
      ${onRetry
        ? html`<button class="btn btn-sm" onclick=${onRetry}>Retry</button>`
        : null}
    </div>
  `;
}
