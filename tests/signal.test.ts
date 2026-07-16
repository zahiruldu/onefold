import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal, createEffect, createComputed, batch } from '../src/core/signal.ts';

describe('createSignal', () => {
  it('reads initial value', () => {
    const s = createSignal(42);
    assert.equal(s(), 42);
  });

  it('sets value directly', () => {
    const s = createSignal(0);
    s.set(5);
    assert.equal(s(), 5);
  });

  it('sets value with updater function', () => {
    const s = createSignal(10);
    s.set((prev) => prev + 5);
    assert.equal(s(), 15);
  });

  it('peek reads without subscribing', () => {
    const s = createSignal(99);
    let runs = 0;
    createEffect(() => { runs++; s.peek(); });
    assert.equal(runs, 1);
    s.set(100);
    assert.equal(runs, 1); // effect did not re-run
  });

  it('does not notify if value unchanged (Object.is)', () => {
    const s = createSignal(7);
    let runs = 0;
    createEffect(() => { s(); runs++; });
    assert.equal(runs, 1);
    s.set(7);
    assert.equal(runs, 1);
  });

  it('treats NaN as equal to NaN', () => {
    const s = createSignal(NaN);
    let runs = 0;
    createEffect(() => { s(); runs++; });
    s.set(NaN);
    assert.equal(runs, 1);
  });
});

describe('createEffect', () => {
  it('runs immediately', () => {
    let ran = false;
    createEffect(() => { ran = true; });
    assert.equal(ran, true);
  });

  it('re-runs when dependency changes', () => {
    const s = createSignal(0);
    const values: number[] = [];
    createEffect(() => { values.push(s()); });
    s.set(1);
    s.set(2);
    assert.deepEqual(values, [0, 1, 2]);
  });

  it('disposer stops further updates', () => {
    const s = createSignal(0);
    let runs = 0;
    const dispose = createEffect(() => { s(); runs++; });
    assert.equal(runs, 1);
    dispose();
    s.set(1);
    assert.equal(runs, 1);
  });

  it('cleans up stale dependencies', () => {
    const a = createSignal(true);
    const b = createSignal(0);
    const c = createSignal(0);
    let runs = 0;
    createEffect(() => {
      runs++;
      if (a()) b(); else c();
    });
    assert.equal(runs, 1);
    b.set(1); // subscribed
    assert.equal(runs, 2);
    a.set(false); // now subscribes to c, not b
    assert.equal(runs, 3);
    b.set(2); // no longer subscribed
    assert.equal(runs, 3);
    c.set(1); // subscribed now
    assert.equal(runs, 4);
  });
});

describe('createComputed', () => {
  it('derives value from signals', () => {
    const a = createSignal(2);
    const b = createSignal(3);
    const sum = createComputed(() => a() + b());
    assert.equal(sum(), 5);
  });

  it('updates when dependencies change', () => {
    const a = createSignal(1);
    const double = createComputed(() => a() * 2);
    a.set(5);
    assert.equal(double(), 10);
  });

  it('throws on write', () => {
    const c = createComputed(() => 42);
    assert.throws(() => c.set(99), /Cannot write/);
  });
});

describe('batch', () => {
  it('defers effects until batch completes', () => {
    const a = createSignal(0);
    const b = createSignal(0);
    let runs = 0;
    createEffect(() => { a(); b(); runs++; });
    assert.equal(runs, 1);
    batch(() => {
      a.set(1);
      b.set(1);
    });
    assert.equal(runs, 2); // only 1 extra run, not 2
  });

  it('nested batches only flush at outermost', () => {
    const s = createSignal(0);
    let runs = 0;
    createEffect(() => { s(); runs++; });
    batch(() => {
      batch(() => { s.set(1); });
      s.set(2);
    });
    assert.equal(runs, 2);
  });
});
