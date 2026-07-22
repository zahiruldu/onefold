import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal } from '../src/core/signal.ts';
import { html } from '../src/core/template.ts';
import { mount, raw } from '../src/core/dom.ts';
import { css, cssValue } from '../src/core/css.ts';

/**
 * Comprehensive security tests for onefold framework.
 *
 * Tests cover the following attack vectors:
 * 1. XSS via text interpolation
 * 2. XSS via attribute injection
 * 3. XSS via event handler strings
 * 4. XSS via URL attributes (href, src, action)
 * 5. XSS via raw() escape hatch
 * 6. CSS injection via cssValue()
 * 7. Prototype pollution via template
 * 8. XSS via reactive expressions
 * 9. DOM clobbering attempts
 */

describe('Security: XSS via text interpolation', () => {
  it('escapes HTML in static text interpolation', () => {
    const malicious = '<script>alert("xss")</script>';
    const el = html`<div>${malicious}</div>` as HTMLElement;
    // Should render as text, not as HTML
    assert.equal(el.textContent, '<script>alert("xss")</script>');
    assert.equal(el.querySelector('script'), null);
  });

  it('escapes HTML in reactive text interpolation', () => {
    const input = createSignal('<img src=x onerror=alert(1)>');
    const el = html`<div>${() => input()}</div>` as HTMLElement;
    assert.equal(el.textContent, '<img src=x onerror=alert(1)>');
    assert.equal(el.querySelector('img'), null);
  });

  it('escapes angle brackets in interpolated strings', () => {
    const el = html`<span>${'<b>bold</b>'}</span>` as HTMLElement;
    assert.equal(el.textContent, '<b>bold</b>');
    assert.equal(el.querySelector('b'), null);
  });

  it('handles null/undefined safely', () => {
    const el = html`<div>${null}${undefined}</div>` as HTMLElement;
    assert.equal(el.textContent, '');
  });

  it('converts objects to string safely', () => {
    const obj = { toString: () => '<script>alert(1)</script>' };
    const el = html`<div>${obj}</div>` as HTMLElement;
    assert.ok(el.textContent?.includes('<script>'));
    assert.equal(el.querySelector('script'), null);
  });

  it('escapes HTML in array items', () => {
    const items = ['<b>bold</b>', '<script>x</script>', 'safe'];
    const el = html`<div>${items.map(i => html`<span>${i}</span>`)}</div>` as HTMLElement;
    assert.equal(el.querySelectorAll('script').length, 0);
    assert.equal(el.querySelectorAll('b').length, 0);
    const spans = el.querySelectorAll('span');
    assert.equal(spans[0]?.textContent, '<b>bold</b>');
  });
});

describe('Security: XSS via event handler attributes', () => {
  it('blocks string value for onclick', () => {
    const el = html`<button onclick=${'alert(1)'}>Click</button>` as HTMLElement;
    assert.equal(el.getAttribute('onclick'), null);
  });

  it('blocks string value for onload', () => {
    const el = html`<div onload=${'alert(1)'}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onload'), null);
  });

  it('blocks string value for onerror', () => {
    const el = html`<img onerror=${'alert(1)'} />` as HTMLElement;
    assert.equal(el.getAttribute('onerror'), null);
  });

  it('blocks string value for onmouseover', () => {
    const el = html`<div onmouseover=${'document.cookie'}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onmouseover'), null);
  });

  it('blocks string value for onfocus', () => {
    const el = html`<input onfocus=${'alert(1)'} />` as HTMLElement;
    assert.equal(el.getAttribute('onfocus'), null);
  });

  it('blocks string value for onbegin (SVG animation)', () => {
    const el = html`<div onbegin=${'alert(1)'}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onbegin'), null);
  });

  it('blocks string value for onanimationend', () => {
    const el = html`<div onanimationend=${'alert(1)'}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onanimationend'), null);
  });

  it('allows function event handlers', () => {
    let fired = false;
    const el = html`<button onclick=${() => { fired = true; }}>Click</button>` as HTMLElement;
    el.dispatchEvent(new Event('click'));
    assert.equal(fired, true);
  });

  it('does not set function handlers as string attributes', () => {
    const el = html`<button onclick=${() => {}}>Click</button>` as HTMLElement;
    assert.equal(el.getAttribute('onclick'), null);
  });
});

describe('Security: XSS via URL attributes', () => {
  it('blocks javascript: in href', () => {
    const el = html`<a href=${'javascript:alert(1)'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });

  it('blocks javascript: with whitespace prefix in href', () => {
    const el = html`<a href=${'  javascript:alert(1)'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });

  it('blocks JavaScript: (mixed case) in href', () => {
    const el = html`<a href=${'JavaScript:alert(1)'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });

  it('blocks data: in href', () => {
    const el = html`<a href=${'data:text/html,<script>alert(1)</script>'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });

  it('blocks vbscript: in href', () => {
    const el = html`<a href=${'vbscript:MsgBox("xss")'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });

  it('blocks javascript: in src', () => {
    const el = html`<img src=${'javascript:alert(1)'} />` as HTMLElement;
    assert.equal(el.getAttribute('src'), null);
  });

  it('blocks javascript: in action', () => {
    const el = html`<form action=${'javascript:alert(1)'}></form>` as HTMLElement;
    assert.equal(el.getAttribute('action'), null);
  });

  it('blocks javascript: in formaction', () => {
    const el = html`<button formaction=${'javascript:alert(1)'}>Submit</button>` as HTMLElement;
    assert.equal(el.getAttribute('formaction'), null);
  });

  it('blocks javascript: in xlink:href', () => {
    const el = html`<a xlink:href=${'javascript:alert(1)'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('xlink:href'), null);
  });

  it('allows https: URLs', () => {
    const el = html`<a href=${'https://example.com'}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), 'https://example.com');
  });

  it('allows relative URLs', () => {
    const el = html`<a href=${'/about'}>About</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), '/about');
  });

  it('allows mailto: URLs', () => {
    const el = html`<a href=${'mailto:test@example.com'}>Email</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), 'mailto:test@example.com');
  });

  it('allows tel: URLs', () => {
    const el = html`<a href=${'tel:+1234567890'}>Call</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), 'tel:+1234567890');
  });

  it('blocks reactive javascript: URLs', () => {
    const url = createSignal('javascript:alert(1)');
    const el = html`<a href=${() => url()}>link</a>` as HTMLElement;
    assert.equal(el.getAttribute('href'), null);
  });
});

describe('Security: raw() escape hatch', () => {
  it('raw() sanitizes script tags', () => {
    const el = html`<div>${raw('<script>alert(1)</script><p>safe</p>')}</div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.ok(el.querySelector('p'));
  });

  it('raw() sanitizes event handlers', () => {
    const el = html`<div>${raw('<div onclick="alert(1)">click</div>')}</div>` as HTMLElement;
    const inner = el.querySelector('div');
    assert.equal(inner?.getAttribute('onclick'), null);
  });

  it('raw() sanitizes iframe tags', () => {
    const el = html`<div>${raw('<iframe src="evil.com"></iframe><p>ok</p>')}</div>` as HTMLElement;
    assert.equal(el.querySelector('iframe'), null);
    assert.ok(el.querySelector('p'));
  });

  it('raw() sanitizes style tags', () => {
    const el = html`<div>${raw('<style>*{display:none}</style><p>ok</p>')}</div>` as HTMLElement;
    assert.equal(el.querySelector('style'), null);
  });

  it('raw() sanitizes javascript: in links', () => {
    const el = html`<div>${raw('<a href="javascript:alert(1)">click</a>')}</div>` as HTMLElement;
    const a = el.querySelector('a');
    assert.ok(a);
    assert.equal(a?.getAttribute('href'), null);
  });

  it('raw() preserves safe content', () => {
    const el = html`<div>${raw('<p><strong>Hello</strong> World</p>')}</div>` as HTMLElement;
    assert.ok(el.querySelector('strong'));
    assert.ok(el.textContent?.includes('Hello'));
  });

  it('plain strings are never treated as raw HTML', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const el = html`<div>${malicious}</div>` as HTMLElement;
    assert.equal(el.querySelector('img'), null);
    assert.equal(el.textContent, malicious);
  });
});

describe('Security: CSS injection via cssValue()', () => {
  it('strips curly braces', () => {
    const result = cssValue('red} body{display:none');
    assert.ok(!result.includes('{'));
    assert.ok(!result.includes('}'));
  });

  it('strips semicolons', () => {
    const result = cssValue('red; background: url(evil)');
    assert.ok(!result.includes(';'));
  });

  it('strips url() expressions', () => {
    const result = cssValue('url(https://evil.com/track)');
    assert.ok(!result.includes('url'));
  });

  it('strips expression()', () => {
    const result = cssValue('expression(alert(1))');
    assert.ok(!result.includes('expression'));
  });

  it('strips @import', () => {
    const result = cssValue('@import url(evil.css)');
    assert.ok(!result.includes('@import'));
  });

  it('strips angle brackets', () => {
    const result = cssValue('red</style><script>alert(1)</script>');
    assert.ok(!result.includes('<'));
    assert.ok(!result.includes('>'));
  });

  it('allows safe color values', () => {
    assert.equal(cssValue('red'), 'red');
    assert.equal(cssValue('#ff0000'), '#ff0000');
    assert.equal(cssValue('rgb(255, 0, 0)'), 'rgb(255, 0, 0)');
  });

  it('allows safe numeric values', () => {
    assert.equal(cssValue('16px'), '16px');
    assert.equal(cssValue('1.5em'), '1.5em');
    assert.equal(cssValue('100%'), '100%');
  });
});

describe('Security: reactive expressions cannot inject HTML', () => {
  it('reactive string expression renders as text', () => {
    const content = createSignal('<script>alert(1)</script>');
    const el = html`<div>${() => content()}</div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.ok(el.textContent?.includes('<script>'));
  });

  it('reactive expression changing to malicious value stays safe', () => {
    const content = createSignal('safe');
    const el = html`<div>${() => content()}</div>` as HTMLElement;
    assert.equal(el.textContent, 'safe');

    content.set('<img src=x onerror=alert(1)>');
    assert.equal(el.querySelector('img'), null);
    assert.ok(el.textContent?.includes('<img'));
  });

  it('reactive attribute cannot inject event handlers', () => {
    const cls = createSignal('normal" onclick="alert(1)" class="hacked');
    const el = html`<div class=${() => cls()}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onclick'), null);
    // Class should be the full string (harmless in class attribute)
    assert.ok(el.className.includes('normal'));
  });
});

describe('Security: mount() does not parse HTML', () => {
  it('mount replaces content safely', () => {
    const container = document.createElement('div');
    container.innerHTML = '<script>alert(1)</script>';
    const node = html`<p>safe</p>` as HTMLElement;
    mount(node, container);
    assert.equal(container.querySelector('script'), null);
    assert.equal(container.querySelector('p')?.textContent, 'safe');
  });
});

describe('Security: attribute value edge cases', () => {
  it('boolean false removes attribute', () => {
    const el = html`<button disabled=${false}></button>` as HTMLElement;
    assert.equal(el.hasAttribute('disabled'), false);
  });

  it('null removes attribute', () => {
    const el = html`<div data-x=${null}></div>` as HTMLElement;
    assert.equal(el.hasAttribute('data-x'), false);
  });

  it('undefined removes attribute', () => {
    const el = html`<div data-x=${undefined}></div>` as HTMLElement;
    assert.equal(el.hasAttribute('data-x'), false);
  });

  it('boolean true sets empty attribute', () => {
    const el = html`<button disabled=${true}></button>` as HTMLElement;
    assert.equal(el.hasAttribute('disabled'), true);
    assert.equal(el.getAttribute('disabled'), '');
  });

  it('numeric values are safely stringified', () => {
    const el = html`<div data-count=${42}></div>` as HTMLElement;
    assert.equal(el.getAttribute('data-count'), '42');
  });
});

describe('Security: no eval or innerHTML in default path', () => {
  it('text content never becomes HTML', () => {
    const userInput = '<!DOCTYPE html><html><body onload="alert(1)"><script>document.cookie</script></body></html>';
    const el = html`<pre>${userInput}</pre>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.equal(el.querySelector('body'), null);
    assert.ok(el.textContent?.includes('<!DOCTYPE'));
  });

  it('template literals with backticks in content are safe', () => {
    const code = 'const x = `<script>${evil}</script>`;';
    const el = html`<code>${code}</code>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.equal(el.textContent, code);
  });
});

describe('Security: prototype pollution via persisted signals', () => {
  it('strips __proto__ key from stored JSON', async () => {
    const key = '__test_proto_' + Date.now();
    localStorage.setItem(key, JSON.stringify({ __proto__: { admin: true }, name: 'test' }));

    const { createPersisted } = await import('../src/core/persist.ts');
    const signal = createPersisted(key, { name: 'default' });
    const value = signal() as Record<string, unknown>;

    assert.equal(value.name, 'test');
    assert.equal((value as any).admin, undefined);
    assert.equal(({} as any).admin, undefined);

    signal.clear();
    localStorage.removeItem(key);
  });

  it('strips constructor key from stored JSON', async () => {
    const key = '__test_ctor_' + Date.now();
    localStorage.setItem(key, JSON.stringify({ constructor: { prototype: { hacked: true } }, data: 'ok' }));

    const { createPersisted } = await import('../src/core/persist.ts');
    const signal = createPersisted(key, { data: 'default' });
    const value = signal() as Record<string, unknown>;

    assert.equal(value.data, 'ok');
    assert.equal(({} as any).hacked, undefined);

    signal.clear();
    localStorage.removeItem(key);
  });

  it('strips prototype key from nested objects', async () => {
    const key = '__test_nested_' + Date.now();
    localStorage.setItem(key, JSON.stringify({ user: { prototype: { isAdmin: true }, name: 'Bob' } }));

    const { createPersisted } = await import('../src/core/persist.ts');
    const signal = createPersisted(key, { user: { name: 'default' } });
    const value = signal() as any;

    assert.equal(value.user.name, 'Bob');
    assert.equal(({} as any).isAdmin, undefined);

    signal.clear();
    localStorage.removeItem(key);
  });
});

describe('Security: template injection / breakout attempts', () => {
  it('cannot break out of text node with closing tags', () => {
    const malicious = '</div><script>alert(1)</script><div>';
    const el = html`<div>${malicious}</div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.equal(el.textContent, malicious);
  });

  it('cannot inject attributes via class value', () => {
    const malicious = '" onclick="alert(1)" data-x="';
    const el = html`<div class=${malicious}></div>` as HTMLElement;
    assert.equal(el.getAttribute('onclick'), null);
  });

  it('cannot inject new elements via attribute values', () => {
    const malicious = '"><script>alert(1)</script><div title="';
    const el = html`<div title=${malicious}></div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.equal(el.getAttribute('title'), malicious);
  });

  it('nested template results are safe', () => {
    const userInput = '<img src=x onerror=alert(1)>';
    const inner = html`<span>${userInput}</span>`;
    const outer = html`<div>${inner}</div>` as HTMLElement;
    assert.equal(outer.querySelector('img'), null);
    assert.equal(outer.querySelector('span')?.textContent, userInput);
  });

  it('multiple interpolations cannot combine into HTML', () => {
    const part1 = '<scr';
    const part2 = 'ipt>alert(1)</script>';
    const el = html`<div>${part1}${part2}</div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
  });
});

describe('Security: i18n cannot inject HTML', () => {
  it('translation strings with HTML render as text', async () => {
    const { createI18n } = await import('../src/core/i18n.ts');
    const i18n = createI18n({
      defaultLocale: 'en',
      messages: { en: { greeting: '<script>alert(1)</script>Hello {name}!' } },
    });

    const result = i18n.t('greeting', { name: 'World' });
    const el = html`<p>${result}</p>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
    assert.ok(el.textContent?.includes('<script>'));
  });

  it('interpolation params with HTML render as text', async () => {
    const { createI18n } = await import('../src/core/i18n.ts');
    const i18n = createI18n({
      defaultLocale: 'en',
      messages: { en: { hello: 'Hello {name}' } },
    });

    const result = i18n.t('hello', { name: '<img src=x onerror=alert(1)>' });
    const el = html`<p>${result}</p>` as HTMLElement;
    assert.equal(el.querySelector('img'), null);
  });
});

describe('Security: store data rendered safely', () => {
  it('store values with HTML render as text', async () => {
    const { createStore } = await import('../src/store/store.ts');
    const store = createStore({ message: '<script>alert(1)</script>' });
    const el = html`<div>${() => (store() as any).message}</div>` as HTMLElement;
    assert.equal(el.querySelector('script'), null);
  });

  it('store update with malicious data stays safe', async () => {
    const { createStore } = await import('../src/store/store.ts');
    const store = createStore({ name: 'safe' });
    const el = html`<span>${() => (store() as any).name}</span>` as HTMLElement;
    assert.equal(el.textContent, 'safe');

    store.update({ name: '<iframe src="evil.com"></iframe>' });
    assert.equal(el.querySelector('iframe'), null);
  });
});

describe('Security: HTTP client open redirect prevention', () => {
  it('blocks protocol-relative URLs (//evil.com)', async () => {
    const { createHttpClient } = await import('../src/core/http.ts');
    const http = createHttpClient({ baseUrl: '/api' });

    try {
      await http.get('//evil.com/steal');
      assert.fail('Should have thrown');
    } catch (e: any) {
      assert.ok(e.message.includes('Protocol-relative URLs are blocked'));
    }
  });
});

describe('Security: signal disposal prevents memory leaks', () => {
  it('disposed effects do not receive updates', async () => {
    const { createEffect } = await import('../src/core/signal.ts');
    const count = createSignal(0);
    let runs = 0;
    const dispose = createEffect(() => { count(); runs++; });

    assert.equal(runs, 1);
    count.set(1);
    assert.equal(runs, 2);

    dispose();
    count.set(2);
    count.set(3);
    assert.equal(runs, 2); // no more runs after dispose
  });

  it('computed signals derive correctly', async () => {
    const { createComputed } = await import('../src/core/signal.ts');
    const source = createSignal(1);
    const derived = createComputed(() => source() * 2);

    assert.equal(derived(), 2);
    source.set(5);
    assert.equal(derived(), 10);
  });
});

describe('Security: DOM clobbering resistance', () => {
  it('user text cannot create elements with IDs that shadow globals', () => {
    const el = html`<div>${'<form id="location"><input name="href" value="evil"></form>'}</div>` as HTMLElement;
    assert.equal(el.querySelector('form'), null);
  });

  it('attribute values cannot create id/name that clobbers document', () => {
    const el = html`<input id=${'__proto__'} name=${'constructor'} />` as HTMLElement;
    assert.equal(el.getAttribute('id'), '__proto__');
    assert.equal(el.getAttribute('name'), 'constructor');
    // These are harmless as attribute values — the concern is innerHTML creating elements
    // that shadow window properties, which textContent/createElement prevents
  });
});
