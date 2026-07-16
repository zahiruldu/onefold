import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ErrorBoundary } from '../src/core/error-boundary.ts';

describe('ErrorBoundary', () => {
  it('renders component on success', () => {
    const node = ErrorBoundary(
      () => document.createTextNode('hello'),
      () => document.createTextNode('error')
    );
    assert.equal(node.textContent, 'hello');
  });

  it('renders fallback on error', () => {
    const node = ErrorBoundary(
      () => { throw new Error('boom'); },
      (err) => document.createTextNode(`Error: ${err.message}`)
    );
    assert.equal(node.textContent, 'Error: boom');
  });

  it('retry re-attempts render', () => {
    let attempt = 0;
    const node = ErrorBoundary(
      () => {
        attempt++;
        if (attempt < 2) throw new Error('fail');
        return document.createTextNode('recovered');
      },
      (_err, retry) => {
        const btn = document.createElement('button');
        btn.onclick = retry;
        btn.textContent = 'retry';
        return btn;
      }
    ) as HTMLElement;

    // First render fails
    assert.ok(node.textContent!.includes('retry'));
    // Click retry
    const btn = node.querySelector('button');
    btn?.click();
    // Second attempt succeeds
    assert.equal(node.textContent, 'recovered');
  });
});
