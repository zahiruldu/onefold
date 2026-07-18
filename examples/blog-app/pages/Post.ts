import { html, Link } from 'onefold';
import type { RouteParams } from 'onefold';

interface Post {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
}

const POSTS: Record<string, Post> = {
  '1': {
    id: 1,
    title: 'Getting Started with Nanoframe',
    date: '2026-07-01',
    author: 'Core Team',
    content: `
      <p>Nanoframe is a tiny, dependency-free TypeScript UI library. It uses fine-grained
      reactive signals bound directly to real DOM nodes — no virtual DOM, no diffing.</p>
      <h3>Installation</h3>
      <pre><code>npm install onefold</code></pre>
      <h3>Your First Component</h3>
      <p>A component is just a function that returns a DOM Node. Use the html tagged template
      to write markup naturally:</p>
      <pre><code>import { createSignal, html, mount } from 'onefold';

function Counter() {
  const count = createSignal(0);
  return html\`
    &lt;button onclick=\${() => count.set(c => c + 1)}&gt;
      Clicked \${() => count()} times
    &lt;/button&gt;
  \`;
}

mount(Counter(), document.getElementById('app')!);</code></pre>
      <p>That's it. No build step required, no CLI to learn, no configuration files.</p>
    `,
  },
  '2': {
    id: 2,
    title: 'Signals vs Virtual DOM',
    date: '2026-06-28',
    author: 'Core Team',
    content: `
      <p>Virtual DOM frameworks (React, Vue 2) re-render an entire component subtree, diff
      the old and new virtual trees, then patch the real DOM. This is O(tree size) per update.</p>
      <p>Signal-based frameworks (Solid, Svelte 5, onefold) wire each piece of state directly
      to the DOM node that reads it. An update is O(1) — only the exact node changes.</p>
      <h3>When does it matter?</h3>
      <p>For simple apps, both approaches are fast enough. The difference shows up in:</p>
      <ul>
        <li>Large tables with frequent cell updates</li>
        <li>Real-time dashboards with many independent data streams</li>
        <li>Animations driven by state changes</li>
      </ul>
      <p>In these scenarios, skipping the diff step entirely means consistently smooth 60fps.</p>
    `,
  },
  '3': {
    id: 3,
    title: 'Building a Router from Scratch',
    date: '2026-06-20',
    author: 'Core Team',
    content: `
      <p>A client-side router needs three things:</p>
      <ol>
        <li>A way to intercept navigation (History API)</li>
        <li>A way to match URLs to views (pattern matching)</li>
        <li>A way to reactively swap the current view (signals)</li>
      </ol>
      <p>Nanoframe's router supports both exact paths and dynamic parameters:</p>
      <pre><code>Router([
  { path: '/', view: () => HomePage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], NotFoundPage);</code></pre>
      <p>The Link component intercepts clicks and calls navigate() for seamless SPA behavior.</p>
    `,
  },
  '4': {
    id: 4,
    title: 'The html`` Tagged Template',
    date: '2026-06-15',
    author: 'Core Team',
    content: `
      <p>Instead of nested h() calls, use the html tagged template literal for a syntax that
      reads like actual HTML:</p>
      <pre><code>html\`
  &lt;div class="card"&gt;
    &lt;h2&gt;\${() => title()}&lt;/h2&gt;
    &lt;button onclick=\${handleClick}&gt;Click me&lt;/button&gt;
  &lt;/div&gt;
\`</code></pre>
      <p>It supports everything h() does: reactive attributes, event handlers, refs, directives,
      class objects, style objects, nested templates, and arrays of nodes.</p>
      <p>The security model is identical — text always goes through textContent, never innerHTML.</p>
    `,
  },
};

export function PostPage(params: RouteParams): Node {
  const post = POSTS[params.id ?? ''];

  if (!post) {
    return html`
      <div class="page">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        ${Link('/', 'Back to Home', 'btn')}
      </div>
    `;
  }

  return html`
    <div class="page">
      <article class="post-full">
        <div class="post-header">
          ${Link('/', '← Back to all posts', 'back-link')}
          <h1>${post.title}</h1>
          <div class="post-meta">
            <span>${post.author}</span> · <span>${post.date}</span>
          </div>
        </div>
        <div class="post-body">
          ${() => {
            const el = document.createElement('div');
            el.innerHTML = post.content;
            return el;
          }}
        </div>
      </article>
    </div>
  `;
}
