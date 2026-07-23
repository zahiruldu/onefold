import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal } from '../src/core/signal.ts';
import { html } from '../src/core/template.ts';
import { renderHTML } from '../src/core/ssr.ts';

describe('renderHTML: basic rendering', () => {
  it('renders a simple element', () => {
    const result = renderHTML(() => html`<div>Hello</div>`);
    assert.equal(result, '<div>Hello</div>');
  });

  it('renders nested elements', () => {
    const result = renderHTML(() => html`<div><h1>Title</h1><p>Text</p></div>`);
    assert.equal(result, '<div><h1>Title</h1><p>Text</p></div>');
  });

  it('renders self-closing / void elements', () => {
    const result = renderHTML(() => html`<div><br /><img src="x.png" /><input type="text" /></div>`);
    assert.ok(result.includes('<br />'));
    assert.ok(result.includes('<img'));
    assert.ok(result.includes('<input'));
  });

  it('renders text content', () => {
    const result = renderHTML(() => html`<span>Hello World</span>`);
    assert.equal(result, '<span>Hello World</span>');
  });

  it('renders multiple root elements via fragment', () => {
    const result = renderHTML(() => html`<p>One</p><p>Two</p>`);
    assert.ok(result.includes('<p>One</p>'));
    assert.ok(result.includes('<p>Two</p>'));
  });
});

describe('renderHTML: attributes', () => {
  it('renders static attributes', () => {
    const result = renderHTML(() => html`<a href="https://example.com" class="link">Go</a>`);
    assert.ok(result.includes('href="https://example.com"'));
    assert.ok(result.includes('class="link"'));
  });

  it('renders dynamic attributes', () => {
    const cls = 'active';
    const result = renderHTML(() => html`<div class=${cls}>Content</div>`);
    assert.ok(result.includes('class="active"'));
  });

  it('renders boolean true as valueless attribute', () => {
    const result = renderHTML(() => html`<input disabled=${true} />`);
    assert.ok(result.includes('disabled'));
    assert.ok(!result.includes('disabled="'));
  });

  it('omits boolean false attributes', () => {
    const result = renderHTML(() => html`<input disabled=${false} />`);
    assert.ok(!result.includes('disabled'));
  });

  it('omits null/undefined attributes', () => {
    const result = renderHTML(() => html`<div data-x=${null} data-y=${undefined}>X</div>`);
    assert.ok(!result.includes('data-x'));
    assert.ok(!result.includes('data-y'));
  });

  it('renders style object as CSS string', () => {
    const result = renderHTML(() => html`<div style=${{ color: 'red', fontSize: '16px' }}>X</div>`);
    assert.ok(result.includes('style="'));
    assert.ok(result.includes('color:red'));
    assert.ok(result.includes('font-size:16px'));
  });

  it('renders class object as space-separated string', () => {
    const result = renderHTML(() => html`<div class=${{ active: true, disabled: false, highlight: true }}>X</div>`);
    assert.ok(result.includes('class="active highlight"'));
  });
});

describe('renderHTML: reactive expressions', () => {
  it('evaluates signal values once', () => {
    const count = createSignal(42);
    const result = renderHTML(() => html`<span>${() => count()}</span>`);
    assert.equal(result, '<span>42</span>');
  });

  it('evaluates computed expressions', () => {
    const name = createSignal('World');
    const result = renderHTML(() => html`<h1>${() => 'Hello ' + name()}</h1>`);
    assert.equal(result, '<h1>Hello World</h1>');
  });

  it('evaluates reactive attributes', () => {
    const isActive = createSignal(true);
    const result = renderHTML(() => html`<div class=${() => isActive() ? 'on' : 'off'}>X</div>`);
    assert.ok(result.includes('class="on"'));
  });
});

describe('renderHTML: lists', () => {
  it('renders array of elements', () => {
    const items = ['Apple', 'Banana', 'Cherry'];
    const result = renderHTML(() => html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`);
    assert.ok(result.includes('<li>Apple</li>'));
    assert.ok(result.includes('<li>Banana</li>'));
    assert.ok(result.includes('<li>Cherry</li>'));
  });

  it('renders reactive list', () => {
    const items = createSignal(['A', 'B', 'C']);
    const result = renderHTML(() => html`<ul>${() => items().map(i => html`<li>${i}</li>`)}</ul>`);
    assert.ok(result.includes('<li>A</li>'));
    assert.ok(result.includes('<li>B</li>'));
    assert.ok(result.includes('<li>C</li>'));
  });

  it('renders empty list', () => {
    const result = renderHTML(() => html`<ul>${[]}</ul>`);
    assert.equal(result, '<ul></ul>');
  });
});

describe('renderHTML: security', () => {
  it('escapes HTML in text content (XSS prevention)', () => {
    const malicious = '<script>alert("xss")</script>';
    const result = renderHTML(() => html`<div>${malicious}</div>`);
    assert.ok(result.includes('&lt;script&gt;'));
    assert.ok(!result.includes('<script>'));
  });

  it('escapes HTML entities in attributes', () => {
    const val = '"><script>alert(1)</script>';
    const result = renderHTML(() => html`<div title=${val}>X</div>`);
    assert.ok(result.includes('&quot;'));
    assert.ok(!result.includes('<script>'));
  });

  it('strips event handlers', () => {
    const result = renderHTML(() => html`<button onclick=${() => {}}>Click</button>`);
    assert.ok(!result.includes('onclick'));
  });

  it('strips ref attributes', () => {
    const result = renderHTML(() => html`<input ref=${() => {}} />`);
    assert.ok(!result.includes('ref'));
  });

  it('blocks javascript: URLs', () => {
    const result = renderHTML(() => html`<a href=${'javascript:alert(1)'}>X</a>`);
    assert.ok(!result.includes('javascript'));
    assert.ok(!result.includes('href'));
  });

  it('blocks data: URLs', () => {
    const result = renderHTML(() => html`<a href=${'data:text/html,<script>alert(1)</script>'}>X</a>`);
    assert.ok(!result.includes('data:'));
  });

  it('allows safe URLs', () => {
    const result = renderHTML(() => html`<a href=${'https://example.com'}>Go</a>`);
    assert.ok(result.includes('href="https://example.com"'));
  });
});

describe('renderHTML: async rendering', () => {
  it('supports async component functions', async () => {
    const result = await renderHTML(async () => {
      const data = await Promise.resolve('async content');
      return html`<div>${data}</div>`;
    });
    assert.equal(result, '<div>async content</div>');
  });

  it('supports async data fetching in lists', async () => {
    const result = await renderHTML(async () => {
      const users = await Promise.resolve([{ name: 'Alice' }, { name: 'Bob' }]);
      return html`<ul>${users.map(u => html`<li>${u.name}</li>`)}</ul>`;
    });
    assert.ok(result.includes('<li>Alice</li>'));
    assert.ok(result.includes('<li>Bob</li>'));
  });

  it('handles sync functions that return immediately', () => {
    const result = renderHTML(() => html`<p>sync</p>`);
    assert.equal(result, '<p>sync</p>');
  });
});

describe('renderHTML: edge cases', () => {
  it('handles null/undefined/boolean expressions', () => {
    const result = renderHTML(() => html`<div>${null}${undefined}${false}${true}</div>`);
    assert.equal(result, '<div></div>');
  });

  it('renders numeric values', () => {
    const result = renderHTML(() => html`<span>${42}</span>`);
    assert.equal(result, '<span>42</span>');
  });

  it('handles nested html templates (inside renderHTML)', () => {
    const result = renderHTML(() => {
      const inner = html`<span>inner</span>`;
      return html`<div>${inner}</div>`;
    });
    assert.ok(result.includes('<span>inner</span>'));
  });

  it('does not affect subsequent html calls (cleanup)', () => {
    renderHTML(() => html`<div>SSR</div>`);
    // After renderHTML, normal html should work (in jsdom test env)
    const el = html`<p>client</p>` as HTMLElement;
    assert.equal(el.tagName.toLowerCase(), 'p');
    assert.equal(el.textContent, 'client');
  });

  it('handles deeply nested structures', () => {
    const result = renderHTML(() => html`
      <div>
        <header><nav><a href="/">Home</a></nav></header>
        <main><article><p>Content</p></article></main>
        <footer><small>Footer</small></footer>
      </div>
    `);
    assert.ok(result.includes('<nav>'));
    assert.ok(result.includes('<article>'));
    assert.ok(result.includes('<footer>'));
    assert.ok(result.includes('Content'));
  });

  it('handles empty template', () => {
    const result = renderHTML(() => html`<div></div>`);
    assert.equal(result, '<div></div>');
  });
});

describe('renderHTML: component patterns', () => {
  it('renders a component function', () => {
    function Card(props: { title: string; body: string }) {
      return html`<div class="card"><h2>${props.title}</h2><p>${props.body}</p></div>`;
    }
    const result = renderHTML(() => Card({ title: 'Hello', body: 'World' }));
    assert.ok(result.includes('<h2>Hello</h2>'));
    assert.ok(result.includes('<p>World</p>'));
  });

  it('renders nested components', () => {
    function Badge(props: { label: string }) {
      return html`<span class="badge">${props.label}</span>`;
    }
    function UserCard(props: { name: string; role: string }) {
      return html`<div><strong>${props.name}</strong> ${Badge({ label: props.role })}</div>`;
    }
    const result = renderHTML(() => UserCard({ name: 'Alice', role: 'Admin' }));
    assert.ok(result.includes('<strong>Alice</strong>'));
    assert.ok(result.includes('<span class="badge">Admin</span>'));
  });

  it('renders a layout wrapping content', () => {
    function Layout(content: unknown) {
      return html`<div class="layout"><nav>Nav</nav><main>${content}</main></div>`;
    }
    function Page() {
      return Layout(html`<h1>Page Title</h1>`);
    }
    const result = renderHTML(() => Page());
    assert.ok(result.includes('<nav>Nav</nav>'));
    assert.ok(result.includes('<h1>Page Title</h1>'));
    assert.ok(result.includes('class="layout"'));
  });

  it('renders conditional content', () => {
    const loggedIn = createSignal(true);
    const result = renderHTML(() => html`<div>${() => loggedIn() ? html`<span>Welcome</span>` : html`<a href="/login">Login</a>`}</div>`);
    assert.ok(result.includes('<span>Welcome</span>'));
    assert.ok(!result.includes('Login'));
  });

  it('renders conditional with false value', () => {
    const loggedIn = createSignal(false);
    const result = renderHTML(() => html`<div>${() => loggedIn() ? html`<span>Welcome</span>` : html`<a href="/login">Login</a>`}</div>`);
    assert.ok(!result.includes('Welcome'));
    assert.ok(result.includes('<a href="/login">Login</a>'));
  });
});

describe('renderHTML: real-world patterns', () => {
  it('renders a navigation with active state', () => {
    function Nav(active: string) {
      const links = [['/', 'Home'], ['/about', 'About'], ['/users', 'Users']];
      return html`<nav>${links.map(([href, label]) => html`<a href=${href} class=${active === href ? 'active' : ''}>${label}</a>`)}</nav>`;
    }
    const result = renderHTML(() => Nav('/about'));
    assert.ok(result.includes('class="active"'));
    assert.ok(result.includes('href="/about"'));
    assert.ok(result.includes('>About</a>'));
  });

  it('renders a user table with data', () => {
    const users = [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' },
    ];
    const result = renderHTML(() => html`
      <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>${users.map(u => html`<tr><td>${u.name}</td><td>${u.email}</td></tr>`)}</tbody>
      </table>
    `);
    assert.ok(result.includes('<th>Name</th>'));
    assert.ok(result.includes('<td>Alice</td>'));
    assert.ok(result.includes('<td>bob@test.com</td>'));
  });

  it('renders a form with all input types', () => {
    const result = renderHTML(() => html`
      <form>
        <input type="text" name="username" value=${'john'} />
        <input type="email" name="email" value=${'john@test.com'} />
        <input type="checkbox" checked=${true} />
        <input type="checkbox" checked=${false} />
        <select name="role">
          <option value="admin" selected=${true}>Admin</option>
          <option value="user" selected=${false}>User</option>
        </select>
        <textarea name="bio">${'Hello world'}</textarea>
      </form>
    `);
    assert.ok(result.includes('value="john"'));
    assert.ok(result.includes('value="john@test.com"'));
    assert.ok(result.includes('checked'));
    assert.ok(result.includes('selected'));
    assert.ok(result.includes('Hello world'));
  });

  it('renders an async page with multiple data sources', async () => {
    async function fetchUsers() { return [{ name: 'Alice' }, { name: 'Bob' }]; }
    async function fetchStats() { return { total: 42, active: 37 }; }

    const result = await renderHTML(async () => {
      const [users, stats] = await Promise.all([fetchUsers(), fetchStats()]);
      return html`
        <div>
          <h1>Dashboard</h1>
          <p>Total: ${String(stats.total)}, Active: ${String(stats.active)}</p>
          <ul>${users.map(u => html`<li>${u.name}</li>`)}</ul>
        </div>
      `;
    });
    assert.ok(result.includes('Total: 42'));
    assert.ok(result.includes('Active: 37'));
    assert.ok(result.includes('<li>Alice</li>'));
    assert.ok(result.includes('<li>Bob</li>'));
  });

  it('renders SEO meta content correctly', () => {
    const title = 'My Page Title';
    const description = 'A description with "quotes" & special <chars>';
    const result = renderHTML(() => html`
      <head>
        <title>${title}</title>
        <meta name="description" content=${description} />
      </head>
    `);
    assert.ok(result.includes('>My Page Title</title>'));
    assert.ok(result.includes('&amp;'));
    assert.ok(result.includes('&quot;'));
    assert.ok(!result.includes('& '));
  });
});

describe('renderHTML: performance and isolation', () => {
  it('does not leak SSR mode to subsequent html calls', () => {
    const ssrResult = renderHTML(() => html`<div>SSR</div>`);
    assert.equal(ssrResult, '<div>SSR</div>');

    // After renderHTML, normal html should return DOM nodes
    const domNode = html`<p>DOM</p>` as HTMLElement;
    assert.equal(domNode.tagName.toLowerCase(), 'p');
    assert.equal(domNode.textContent, 'DOM');
  });

  it('handles sequential renderHTML calls correctly', async () => {
    const r1 = await renderHTML(async () => { await new Promise(r => setTimeout(r, 10)); return html`<div>First</div>`; });
    const r2 = await renderHTML(async () => { await new Promise(r => setTimeout(r, 5)); return html`<div>Second</div>`; });
    const r3 = renderHTML(() => html`<div>Third</div>`);
    assert.equal(r1, '<div>First</div>');
    assert.equal(r2, '<div>Second</div>');
    assert.equal(r3, '<div>Third</div>');
  });

  it('handles errors gracefully', () => {
    assert.throws(() => {
      renderHTML(() => { throw new Error('Component error'); });
    }, /Component error/);
  });

  it('handles async errors gracefully', async () => {
    await assert.rejects(
      renderHTML(async () => { throw new Error('Async error'); }),
      /Async error/
    );
  });

  it('renders large lists efficiently', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const start = Date.now();
    const result = renderHTML(() => html`<ul>${items.map(item => html`<li>${item.name}</li>`)}</ul>`);
    const duration = Date.now() - start;
    assert.ok(result.includes('<li>Item 0</li>'));
    assert.ok(result.includes('<li>Item 999</li>'));
    assert.ok(duration < 500, `Took ${duration}ms — should be under 500ms for 1000 items`);
  });
});

describe('renderHTML: special characters and encoding', () => {
  it('escapes ampersands in text', () => {
    const result = renderHTML(() => html`<p>Tom & Jerry</p>`);
    assert.ok(result.includes('Tom &amp; Jerry'));
  });

  it('escapes quotes in attribute values', () => {
    const result = renderHTML(() => html`<div title=${'Say "hello"'}>X</div>`);
    assert.ok(result.includes('Say &quot;hello&quot;'));
  });

  it('preserves whitespace in text content', () => {
    const result = renderHTML(() => html`<pre>  indented\n  text</pre>`);
    assert.ok(result.includes('  indented'));
  });

  it('handles emoji in content', () => {
    const result = renderHTML(() => html`<span>${'Hello 🌍'}</span>`);
    assert.ok(result.includes('Hello 🌍'));
  });

  it('handles unicode characters', () => {
    const result = renderHTML(() => html`<p>${'日本語テスト'}</p>`);
    assert.ok(result.includes('日本語テスト'));
  });

  it('escapes HTML in interpolated URLs', () => {
    const result = renderHTML(() => html`<a href=${'https://example.com?a=1&b=2'}>Link</a>`);
    assert.ok(result.includes('href="https://example.com?a=1&amp;b=2"'));
  });
});
