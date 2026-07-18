import { html, Link } from 'onefold';
import type { RouteParams } from 'onefold';

const FEATURED_POSTS = [
  { id: 1, title: 'Getting Started with Nanoframe', excerpt: 'Learn how to build reactive UIs with zero dependencies and fine-grained signals.', date: '2026-07-01' },
  { id: 2, title: 'Signals vs Virtual DOM', excerpt: 'Why fine-grained reactivity outperforms diffing on update-heavy workloads.', date: '2026-06-28' },
  { id: 3, title: 'Building a Router from Scratch', excerpt: 'Client-side routing with the History API in under 50 lines of TypeScript.', date: '2026-06-20' },
  { id: 4, title: 'The html`` Tagged Template', excerpt: 'Write templates that look like HTML with full reactive bindings — no compiler needed.', date: '2026-06-15' },
];

export function HomePage(_params: RouteParams): Node {
  return html`
    <div class="page">
      <section class="hero-section">
        <h1>Nanoframe Blog</h1>
        <p class="hero-subtitle">Exploring modern web development with fine-grained reactivity</p>
      </section>

      <section class="posts-section">
        <h2>Recent Posts</h2>
        <div class="post-list">
          ${FEATURED_POSTS.map(
            (post) => html`
              <article class="post-card">
                <span class="post-date">${post.date}</span>
                <h3>${Link(`/posts/${post.id}`, post.title, 'post-link')}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
              </article>
            `
          )}
        </div>
      </section>
    </div>
  `;
}
