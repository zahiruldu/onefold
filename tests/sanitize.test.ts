import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUnsafeUrl, isEventAttribute, minimalSanitize, raw, isRawHtml } from '../src/security/sanitize.ts';

describe('isUnsafeUrl', () => {
  it('blocks javascript: protocol', () => {
    assert.equal(isUnsafeUrl('javascript:alert(1)'), true);
    assert.equal(isUnsafeUrl('  JavaScript:void(0)'), true);
  });

  it('blocks data: protocol', () => {
    assert.equal(isUnsafeUrl('data:text/html,<script>alert(1)</script>'), true);
    assert.equal(isUnsafeUrl('data:image/png;base64,abc'), true);
  });

  it('blocks vbscript:', () => {
    assert.equal(isUnsafeUrl('vbscript:MsgBox'), true);
  });

  it('allows https/http', () => {
    assert.equal(isUnsafeUrl('https://example.com'), false);
    assert.equal(isUnsafeUrl('http://example.com'), false);
  });

  it('allows relative URLs', () => {
    assert.equal(isUnsafeUrl('/path/to/page'), false);
    assert.equal(isUnsafeUrl('./relative'), false);
  });
});

describe('isEventAttribute', () => {
  it('detects on* attributes', () => {
    assert.equal(isEventAttribute('onclick'), true);
    assert.equal(isEventAttribute('onMouseOver'), true);
    assert.equal(isEventAttribute('onerror'), true);
  });

  it('rejects non-event attributes', () => {
    assert.equal(isEventAttribute('class'), false);
    assert.equal(isEventAttribute('oneword'), true); // starts with on — intentional
  });
});

describe('minimalSanitize', () => {
  it('strips script tags', () => {
    const result = minimalSanitize('<div><script>alert(1)</script><p>safe</p></div>');
    assert.ok(!result.includes('script'));
    assert.ok(result.includes('<p>safe</p>'));
  });

  it('strips style tags', () => {
    const result = minimalSanitize('<style>body{display:none}</style><p>ok</p>');
    assert.ok(!result.includes('style'));
  });

  it('strips iframe tags', () => {
    const result = minimalSanitize('<iframe src="evil.com"></iframe><p>ok</p>');
    assert.ok(!result.includes('iframe'));
  });

  it('strips object/embed tags', () => {
    const result = minimalSanitize('<object data="evil"></object><embed src="x">');
    assert.ok(!result.includes('object'));
    assert.ok(!result.includes('embed'));
  });

  it('strips form tags', () => {
    const result = minimalSanitize('<form action="evil"><input></form>');
    assert.ok(!result.includes('form'));
  });

  it('strips on* event handlers', () => {
    const result = minimalSanitize('<div onclick="alert(1)" onmouseover="x">safe</div>');
    assert.ok(!result.includes('onclick'));
    assert.ok(!result.includes('onmouseover'));
    assert.ok(result.includes('safe'));
  });

  it('strips javascript: from href', () => {
    const result = minimalSanitize('<a href="javascript:alert(1)">click</a>');
    assert.ok(!result.includes('javascript'));
  });

  it('preserves safe HTML', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = minimalSanitize(input);
    assert.equal(result, input);
  });
});

describe('raw()', () => {
  it('returns RawHtml marker', () => {
    const r = raw('<b>bold</b>');
    assert.equal(isRawHtml(r), true);
    assert.equal(r.__onefoldRaw, true);
  });

  it('sanitizes the content', () => {
    const r = raw('<script>bad</script><p>good</p>');
    assert.ok(!r.html.includes('script'));
    assert.ok(r.html.includes('<p>good</p>'));
  });
});
