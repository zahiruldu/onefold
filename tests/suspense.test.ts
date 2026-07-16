import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Suspense, SuspenseAll } from '../src/core/suspense.ts';

describe('Suspense', () => {
  it('shows fallback then resolves', async () => {
    const node = Suspense(
      () => Promise.resolve(document.createTextNode('loaded')),
      { fallback: () => document.createTextNode('loading...') }
    ) as HTMLElement;
    assert.equal(node.textContent, 'loading...');
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(node.textContent, 'loaded');
  });

  it('shows error on rejection', async () => {
    const node = Suspense(
      () => Promise.reject(new Error('fail')),
      { onError: (err) => document.createTextNode(`err: ${err.message}`) }
    ) as HTMLElement;
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(node.textContent, 'err: fail');
  });

  it('works without fallback', async () => {
    const node = Suspense(
      () => Promise.resolve(document.createTextNode('hi'))
    ) as HTMLElement;
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(node.textContent, 'hi');
  });
});

describe('SuspenseAll', () => {
  it('waits for all promises', async () => {
    const node = SuspenseAll([
      () => Promise.resolve(document.createTextNode('A')),
      () => Promise.resolve(document.createTextNode('B')),
    ], { fallback: () => document.createTextNode('wait') }) as HTMLElement;
    assert.equal(node.textContent, 'wait');
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(node.textContent, 'AB');
  });
});
