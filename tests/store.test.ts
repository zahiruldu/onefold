import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/store/store.ts';
import { createEffect } from '../src/core/signal.ts';

describe('createStore', () => {
  it('reads initial value', () => {
    const store = createStore({ name: 'Alice', age: 30 });
    assert.deepEqual(store(), { name: 'Alice', age: 30 });
  });

  it('updates with partial patch', () => {
    const store = createStore({ x: 1, y: 2 });
    store.update({ x: 10 });
    assert.deepEqual(store(), { x: 10, y: 2 });
  });

  it('updates with updater function', () => {
    const store = createStore({ count: 0 });
    store.update((prev) => ({ count: prev.count + 1 }));
    assert.deepEqual(store(), { count: 1 });
  });

  it('triggers effects on update', () => {
    const store = createStore({ val: 'a' });
    let observed = '';
    createEffect(() => { observed = store().val; });
    assert.equal(observed, 'a');
    store.update({ val: 'b' });
    assert.equal(observed, 'b');
  });
});
