import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderToString, renderToStringAsync } from '../src/core/ssr.ts';
import { html } from '../src/core/template.ts';
import { createSignal } from '../src/core/signal.ts';

describe('renderToString', () => {
  it('serializes a simple element', () => {
    const out = renderToString(() => html`<div>hello</div>`);
    assert.equal(out, '<div>hello</div>');
  });

  it('serializes nested elements with attributes', () => {
    const out = renderToString(() => html`<div class="card"><span id="s1">x</span></div>`);
    assert.equal(out, '<div class="card"><span id="s1">x</span></div>');
  });

  it('escapes text content (XSS-safe)', () => {
    const evil = '<img src=x onerror=alert(1)>';
    const out = renderToString(() => html`<p>${evil}</p>`);
    assert.ok(!out.includes('<img'));
    assert.ok(out.includes('&lt;img'));
  });

  it('escapes attribute values', () => {
    const evil = '"><script>alert(1)</script>';
    const out = renderToString(() => html`<div title=${evil}>x</div>`);
    assert.ok(!out.includes('"><script>'));
    assert.ok(out.includes('&quot;'));
  });

  it('renders void elements as self-closing', () => {
    const out = renderToString(() => html`<div><img src="a.png" /><br /></div>`);
    assert.ok(out.includes('<img src="a.png" />'));
    assert.ok(out.includes('<br />'));
  });

  it('resolves reactive text to its current value at render time', () => {
    const count = createSignal(3);
    const out = renderToString(() => html`<span>${() => `Count: ${count()}`}</span>`);
    assert.equal(out, '<span>Count: 3</span>');
  });

  it('strips internal data- attributes by default', () => {
    const el = document.createElement('div');
    el.setAttribute('data-remote', 'https://x.test/widget.js');
    el.setAttribute('data-transition', '');
    el.textContent = 'x';
    const out = renderToString(() => el);
    assert.ok(!out.includes('data-remote'));
    assert.ok(!out.includes('data-transition'));
  });

  it('keeps internal data- attributes when stripInternalAttrs=false', () => {
    const el = document.createElement('div');
    el.setAttribute('data-remote', 'https://x.test/widget.js');
    const out = renderToString(() => el, { stripInternalAttrs: false });
    assert.ok(out.includes('data-remote'));
  });

  it('neutralizes comment-breakout attempts (XSS via comment nodes)', () => {
    // A comment whose text contains "-->" could, if passed through verbatim,
    // close the HTML comment early and let the rest of the string be parsed
    // as real markup (e.g. an <img onerror=...> sibling instead of inert text).
    // The serializer must strip "--" from comment text so the ONLY "-->" in
    // the output is the one it adds itself to close the comment.
    const frag = document.createDocumentFragment();
    const comment = document.createComment('safe--><img src=x onerror=alert(1)>');
    frag.appendChild(comment);
    const out = renderToString(() => frag);

    assert.equal(out.split('-->').length - 1, 1, 'exactly one comment terminator must exist — the legitimate closing one');
    assert.ok(out.startsWith('<!--') && out.endsWith('-->'), 'the entire output must be one unbroken comment, proving the <img> text never escaped it');
  });

  it('serializes document fragments by concatenating children', () => {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createElement('span'));
    frag.appendChild(document.createTextNode('x'));
    const out = renderToString(() => frag);
    assert.equal(out, '<span></span>x');
  });
});

describe('renderToStringAsync', () => {
  it('awaits an async component before serializing', async () => {
    const out = await renderToStringAsync(async () => {
      await new Promise((r) => setTimeout(r, 5));
      return html`<div>ready</div>`;
    });
    assert.equal(out, '<div>ready</div>');
  });

  it('supports synchronous components too', async () => {
    const out = await renderToStringAsync(() => html`<div>sync</div>`);
    assert.equal(out, '<div>sync</div>');
  });
});
