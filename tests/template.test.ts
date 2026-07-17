import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal } from '../src/core/signal.ts';
import { html } from '../src/core/template.ts';

describe('html tagged template', () => {
  it('creates a single element', () => {
    const el = html`<div></div>` as HTMLElement;
    assert.equal(el.tagName.toLowerCase(), 'div');
  });

  it('creates nested elements', () => {
    const el = html`<div><span>hello</span></div>` as HTMLElement;
    assert.equal(el.querySelector('span')?.textContent, 'hello');
  });

  it('handles self-closing tags', () => {
    const el = html`<div><input type="text" /><br /></div>` as HTMLElement;
    assert.equal(el.querySelectorAll('input').length, 1);
    assert.equal(el.querySelectorAll('br').length, 1);
  });

  it('interpolates static text', () => {
    const name = 'World';
    const el = html`<p>${name}</p>` as HTMLElement;
    assert.equal(el.textContent, 'World');
  });

  it('interpolates reactive text', () => {
    const count = createSignal(0);
    const el = html`<span>${() => `Count: ${count()}`}</span>` as HTMLElement;
    assert.equal(el.textContent, 'Count: 0');
    count.set(5);
    assert.equal(el.textContent, 'Count: 5');
  });

  it('handles dynamic attributes', () => {
    const cls = 'active';
    const el = html`<div class=${cls}></div>` as HTMLElement;
    assert.equal(el.className, 'active');
  });

  it('handles reactive attributes', () => {
    const disabled = createSignal(false);
    const el = html`<button disabled=${() => disabled()}></button>` as HTMLElement;
    assert.equal(el.hasAttribute('disabled'), false);
    disabled.set(true);
    assert.equal(el.hasAttribute('disabled'), true);
  });

  it('handles event handlers', () => {
    let clicked = false;
    const el = html`<button onclick=${() => { clicked = true; }}>Click</button>` as HTMLElement;
    el.click();
    assert.equal(clicked, true);
  });

  it('handles arrays of nodes', () => {
    const items = ['a', 'b', 'c'];
    const el = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>` as HTMLElement;
    assert.equal(el.querySelectorAll('li').length, 3);
    assert.equal(el.textContent, 'abc');
  });

  it('handles reactive lists', () => {
    const items = createSignal(['x', 'y']);
    const el = html`<ul>${() => items().map(i => html`<li>${i}</li>`)}</ul>` as HTMLElement;
    assert.equal(el.querySelectorAll('li').length, 2);
    items.set(['x', 'y', 'z']);
    assert.equal(el.querySelectorAll('li').length, 3);
  });

  it('skips HTML comments', () => {
    const el = html`<div><!-- comment --><span>text</span></div>` as HTMLElement;
    assert.equal(el.querySelector('span')?.textContent, 'text');
  });

  it('handles nested html templates', () => {
    const inner = html`<span>inner</span>`;
    const outer = html`<div>${inner}</div>` as HTMLElement;
    assert.equal(outer.querySelector('span')?.textContent, 'inner');
  });

  it('handles null/undefined/boolean children gracefully', () => {
    const el = html`<div>${null}${undefined}${false}${true}</div>` as HTMLElement;
    assert.equal(el.textContent, '');
  });

  it('calls the ref callback with the created element', () => {
    let refEl: HTMLElement | null = null;
    html`<div ref=${(el: HTMLElement) => { refEl = el; }}></div>`;
    assert.ok(refEl instanceof HTMLElement);
    assert.equal(refEl!.tagName.toLowerCase(), 'div');
  });

  it('applies a reactive class object, including only truthy keys', () => {
    const el = html`<div class=${() => ({ foo: true, bar: false, baz: true })}></div>` as HTMLElement;
    assert.equal(el.className, 'foo baz');
  });

  it('applies a static style object', () => {
    const el = html`<div style=${{ color: 'red', fontSize: '12px' }}></div>` as HTMLElement;
    assert.equal(el.style.color, 'red');
    assert.equal(el.style.fontSize, '12px');
  });

  it('applies a reactive style object', () => {
    const size = createSignal('12px');
    const el = html`<div style=${() => ({ fontSize: size() })}></div>` as HTMLElement;
    assert.equal(el.style.fontSize, '12px');
    size.set('20px');
    assert.equal(el.style.fontSize, '20px');
  });

  it('applies a style as a CSS string (inline HTML syntax)', () => {
    const el = html`<div style="color: red; font-size: 14px;"></div>` as HTMLElement;
    assert.equal(el.style.color, 'red');
    assert.equal(el.style.fontSize, '14px');
  });

  it('applies a style as a dynamic CSS string via interpolation', () => {
    const el = html`<div style=${'color: blue; padding: 10px;'}></div>` as HTMLElement;
    assert.equal(el.style.color, 'blue');
    assert.equal(el.style.padding, '10px');
  });

  it('applies a reactive style that returns a string', () => {
    const theme = createSignal('light');
    const el = html`<div style=${() => theme() === 'dark' ? 'background: black; color: white;' : 'background: white; color: black;'}></div>` as HTMLElement;
    assert.equal(el.style.background, 'white');
    assert.equal(el.style.color, 'black');
    theme.set('dark');
    assert.equal(el.style.background, 'black');
    assert.equal(el.style.color, 'white');
  });

  it('does not crash when style string contains complex CSS values', () => {
    const el = html`<div style="border: 1px solid var(--border); border-radius: 8px; margin-top: 16px;"></div>` as HTMLElement;
    assert.equal(el.style.borderRadius, '8px');
    assert.equal(el.style.marginTop, '16px');
  });

  it('handles empty style string gracefully', () => {
    const el = html`<div style=""></div>` as HTMLElement;
    assert.equal(el.style.cssText, '');
  });

  it('handles null/undefined style without crashing', () => {
    const el = html`<div style=${null}></div>` as HTMLElement;
    assert.equal(el.style.cssText, '');
  });
});

describe('html reactive-binding disposal (memory leak regression)', () => {
  it('stops updating a reactive attribute once its owning element is removed from the DOM', async () => {
    const label = createSignal('a');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const el = html`<div class=${() => label()}></div>` as HTMLElement;
    container.appendChild(el);
    assert.equal(el.className, 'a');

    label.set('b');
    assert.equal(el.className, 'b', 'sanity check: binding is live while attached');

    container.removeChild(el);
    // disposeOnRemove wires cleanup through a MutationObserver, which flushes
    // on a microtask, not synchronously — wait a tick before asserting.
    await new Promise((r) => setTimeout(r, 0));

    label.set('c');
    assert.equal(el.className, 'b', 'binding must not update — and must not still be subscribed — after removal');

    document.body.removeChild(container);
  });

  it('stops updating a reactive child once its owning parent is removed from the DOM', async () => {
    const count = createSignal(0);
    const container = document.createElement('div');
    document.body.appendChild(container);

    const el = html`<div>${() => `Count: ${count()}`}</div>` as HTMLElement;
    container.appendChild(el);
    assert.equal(el.textContent, 'Count: 0');

    count.set(1);
    assert.equal(el.textContent, 'Count: 1');

    container.removeChild(el);
    await new Promise((r) => setTimeout(r, 0));

    count.set(2);
    assert.equal(el.textContent, 'Count: 1', 'reactive child binding must not update after its element is removed');

    document.body.removeChild(container);
  });
});
