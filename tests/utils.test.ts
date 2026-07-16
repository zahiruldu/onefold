import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  timeAgo,
  formatCurrency,
  formatNumber,
  truncate,
  slugify,
  pluralize,
  capitalize,
  debounce,
  throttle,
  pipe,
} from '../src/core/utils.ts';

describe('formatDate', () => {
  const date = new Date('2026-07-14T10:30:00Z');

  it('formats as ISO', () => {
    assert.equal(formatDate(date, 'iso'), '2026-07-14');
  });

  it('formats short by default', () => {
    const result = formatDate(date);
    assert.ok(result.includes('2026'));
    assert.ok(result.includes('14'));
  });

  it('accepts timestamps', () => {
    assert.equal(formatDate(date.getTime(), 'iso'), '2026-07-14');
  });

  it('accepts ISO strings', () => {
    assert.equal(formatDate('2026-07-14T00:00:00Z', 'iso'), '2026-07-14');
  });

  it('returns empty string for invalid dates', () => {
    assert.equal(formatDate('not-a-date'), '');
    assert.equal(formatDate(NaN), '');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for very recent times', () => {
    assert.equal(timeAgo(new Date()), 'just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    assert.equal(timeAgo(fiveMinAgo), '5 minutes ago');
  });

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    assert.equal(timeAgo(twoHoursAgo), '2 hours ago');
  });

  it('returns "yesterday" for 1 day ago', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    assert.equal(timeAgo(yesterday), 'yesterday');
  });

  it('returns days ago for 3 days', () => {
    const threeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    assert.equal(timeAgo(threeDays), '3 days ago');
  });

  it('handles future dates', () => {
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    assert.equal(timeAgo(inTwoHours), 'in 2 hours');
  });
});

describe('formatCurrency', () => {
  it('formats USD', () => {
    const result = formatCurrency(1234.5, 'USD', 'en-US');
    assert.ok(result.includes('1,234.50') || result.includes('1234.50'));
  });

  it('formats EUR', () => {
    const result = formatCurrency(99.99, 'EUR', 'en-US');
    assert.ok(result.includes('99.99'));
  });

  it('formats zero', () => {
    const result = formatCurrency(0, 'USD', 'en-US');
    assert.ok(result.includes('0.00'));
  });

  it('formats BDT in Bengali locale', () => {
    const result = formatCurrency(1500.75, 'BDT', 'bn-BD');
    assert.ok(result.includes('৳') || result.includes('BDT'));
    assert.ok(result.includes('১,৫০০') || result.includes('1,500'));
  });

  it('formats BDT in English locale', () => {
    const result = formatCurrency(1500.75, 'BDT', 'en-US');
    assert.ok(result.includes('1,500.75'));
    assert.ok(result.includes('BDT'));
  });
});

describe('formatNumber', () => {
  it('formats with locale grouping', () => {
    const result = formatNumber(1234567, 'en-US');
    assert.ok(result.includes('1,234,567'));
  });
});

describe('truncate', () => {
  it('returns original if shorter than max', () => {
    assert.equal(truncate('hello', 10), 'hello');
  });

  it('truncates with ellipsis', () => {
    assert.equal(truncate('hello world this is long', 10), 'hello w...');
  });

  it('uses custom suffix', () => {
    assert.equal(truncate('abcdefghij', 8, '…'), 'abcdefg…');
  });

  it('handles exact boundary', () => {
    assert.equal(truncate('12345', 5), '12345');
  });
});

describe('slugify', () => {
  it('converts to lowercase kebab-case', () => {
    assert.equal(slugify('Hello World'), 'hello-world');
  });

  it('removes special characters', () => {
    assert.equal(slugify('Hello! @World#'), 'hello-world');
  });

  it('collapses multiple dashes', () => {
    assert.equal(slugify('a   b   c'), 'a-b-c');
  });

  it('trims leading/trailing dashes', () => {
    assert.equal(slugify(' --hello-- '), 'hello');
  });

  it('handles empty string', () => {
    assert.equal(slugify(''), '');
  });
});

describe('pluralize', () => {
  it('singular for count 1', () => {
    assert.equal(pluralize(1, 'item'), '1 item');
  });

  it('adds "s" for count > 1 by default', () => {
    assert.equal(pluralize(5, 'item'), '5 items');
  });

  it('uses custom plural', () => {
    assert.equal(pluralize(3, 'child', 'children'), '3 children');
  });

  it('plural for count 0', () => {
    assert.equal(pluralize(0, 'item'), '0 items');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    assert.equal(capitalize('hello'), 'Hello');
  });

  it('handles empty string', () => {
    assert.equal(capitalize(''), '');
  });

  it('handles single character', () => {
    assert.equal(capitalize('a'), 'A');
  });

  it('does not change already capitalized', () => {
    assert.equal(capitalize('Hello'), 'Hello');
  });
});

describe('debounce', () => {
  it('delays execution', async () => {
    let calls = 0;
    const fn = debounce(() => { calls++; }, 50);
    fn();
    fn();
    fn();
    assert.equal(calls, 0);
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(calls, 1);
  });

  it('cancel prevents execution', async () => {
    let calls = 0;
    const fn = debounce(() => { calls++; }, 50);
    fn();
    fn.cancel();
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(calls, 0);
  });
});

describe('throttle', () => {
  it('executes immediately on first call', () => {
    let calls = 0;
    const fn = throttle(() => { calls++; }, 100);
    fn();
    assert.equal(calls, 1);
  });

  it('blocks subsequent calls within the interval', () => {
    let calls = 0;
    const fn = throttle(() => { calls++; }, 100);
    fn();
    fn();
    fn();
    assert.equal(calls, 1);
  });

  it('allows calls after the interval', async () => {
    let calls = 0;
    const fn = throttle(() => { calls++; }, 50);
    fn();
    assert.equal(calls, 1);
    await new Promise((r) => setTimeout(r, 80));
    fn();
    assert.equal(calls, 2);
  });
});

describe('pipe', () => {
  it('passes value through a single transform', () => {
    assert.equal(pipe('hello', capitalize), 'Hello');
  });

  it('chains multiple transforms left to right', () => {
    const result = pipe('Hello World!', slugify, capitalize);
    assert.equal(result, 'Hello-world');
  });

  it('works with inline arrow functions', () => {
    const result = pipe('  hello world  ', (s: string) => s.trim(), capitalize, (s: string) => truncate(s, 8));
    assert.equal(result, 'Hello...');
  });

  it('works with numbers', () => {
    const result = pipe(3, (n: number) => pluralize(n, 'item'));
    assert.equal(result, '3 items');
  });

  it('returns value unchanged with zero transforms', () => {
    assert.equal(pipe(42), 42);
  });
});
