import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { css, cssValue } from '../src/core/css.ts';

describe('css scoped styles', () => {
  it('returns a scope class', () => {
    const styles = css`.card { color: red; }`;
    assert.ok(styles.scope.startsWith('nf-'));
  });

  it('prefixes selectors with scope class', () => {
    const styles = css`.card { color: red; }`;
    assert.ok(styles.css.includes(`.${styles.scope} .card`));
  });

  it('handles multiple selectors', () => {
    const styles = css`
      .a { color: red; }
      .b { color: blue; }
    `;
    assert.ok(styles.css.includes(`.${styles.scope} .a`));
    assert.ok(styles.css.includes(`.${styles.scope} .b`));
  });

  it('deduplicates identical templates', () => {
    const a = css`.x { color: red; }`;
    const b = css`.x { color: red; }`;
    assert.equal(a.scope, b.scope);
  });

  it('injects style element into head', () => {
    const styles = css`.injected { display: block; }`;
    const styleEl = document.getElementById(`style-${styles.scope}`);
    assert.ok(styleEl);
    assert.ok(styleEl!.textContent!.includes('.injected'));
  });

  it('handles @media rules', () => {
    const styles = css`
      @media (max-width: 768px) {
        .mobile { display: block; }
      }
    `;
    assert.ok(styles.css.includes('@media'));
    assert.ok(styles.css.includes(`.${styles.scope} .mobile`));
  });
});

describe('cssValue', () => {
  it('strips dangerous characters', () => {
    assert.equal(cssValue('red'), 'red');
    const result = cssValue('red; } .evil { display: none');
    assert.ok(!result.includes(';'));
    assert.ok(!result.includes('{'));
    assert.ok(!result.includes('}'));
  });

  it('strips url() expressions', () => {
    const result = cssValue('url(http://evil.com)');
    assert.ok(!result.includes('url('));
  });

  it('strips @import', () => {
    const result = cssValue('@import evil.css');
    assert.ok(!result.includes('@import'));
  });

  it('strips expression()', () => {
    assert.equal(cssValue('expression(alert(1))'), 'alert(1))');
  });
});
