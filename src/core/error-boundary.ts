/**
 * Error Boundaries — catch render errors at subtree level without crashing the app.
 *
 * Usage:
 * ```ts
 * const view = ErrorBoundary(
 *   () => RiskyComponent(),
 *   (error, retry) => html`
 *     <div class="error">
 *       <p>${error.message}</p>
 *       <button onclick=${retry}>Retry</button>
 *     </div>
 *   `
 * );
 * ```
 */

/**
 * Wraps a component render in a try/catch. If it throws, renders the fallback
 * with the error and a retry function. Retry re-executes the original render.
 */
export function ErrorBoundary(
  render: () => Node,
  fallback: (error: Error, retry: () => void) => Node
): Node {
  const container = document.createElement('div');
  container.setAttribute('data-error-boundary', '');

  function attempt(): void {
    container.textContent = '';
    try {
      const node = render();
      container.appendChild(node);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      container.appendChild(fallback(error, attempt));
    }
  }

  attempt();
  return container;
}
