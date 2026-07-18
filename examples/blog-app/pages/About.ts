import { html, Link } from 'onefold';
import type { RouteParams } from 'onefold';

export function AboutPage(_params: RouteParams): Node {
  return html`
    <div class="page">
      <h1>About</h1>
      <p class="about-intro">
        This is a demo blog app built with <strong>onefold</strong> to showcase client-side routing
        with dynamic parameters, navigation links, and page transitions — all in under 5kb of framework code.
      </p>

      <h2>Features Demonstrated</h2>
      <ul class="feature-list">
        <li><strong>Router</strong> — pattern-based route matching with dynamic <code>:id</code> params</li>
        <li><strong>Link</strong> — SPA navigation without full page reloads</li>
        <li><strong>html template</strong> — declarative markup with reactive bindings</li>
        <li><strong>currentRoute()</strong> — reactive route signal for active nav highlighting</li>
        <li><strong>navigate()</strong> — programmatic navigation from JS</li>
      </ul>

      <h2>How the Routing Works</h2>
      <pre><code>import { Router, Link, navigate } from 'onefold';

// Define routes with patterns
const app = Router([
  { path: '/', view: () => HomePage() },
  { path: '/about', view: () => AboutPage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], () => NotFoundPage());

// Link component for declarative navigation
Link('/about', 'About Us')

// Programmatic navigation
navigate('/posts/3');</code></pre>

      <p>${Link('/', '← Back to Home', 'btn')}</p>
    </div>
  `;
}
