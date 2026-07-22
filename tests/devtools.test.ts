import './setup.ts';
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal, createEffect } from '../src/core/signal.ts';
import { enableDevtools, disableDevtools } from '../src/core/devtools.ts';

afterEach(() => {
  disableDevtools();
});

describe('enableDevtools (effect-hook wiring regression)', () => {
  it('actually observes effect runs — this is the wiring the whole feature depends on', () => {
    // Regression test: setEffectHook()/enableDevtools() previously did nothing
    // because the reactive core in signal.ts never routed effect execution
    // through runWithHook(). This test fails loudly if that wiring regresses.
    const api = enableDevtools();
    assert.equal(api.stats().totalRenders, 0);

    const s = createSignal(0);
    createEffect(() => { s(); });

    assert.ok(api.stats().totalRenders > 0, 'enableDevtools() must observe at least the initial effect run');
  });

  it('tracks additional renders when a dependency changes', () => {
    const api = enableDevtools();
    const s = createSignal(0);
    createEffect(() => { s(); });

    const before = api.stats().totalRenders;
    s.set(1);
    s.set(2);

    assert.equal(api.stats().totalRenders, before + 2);
  });

  it('records errors thrown inside an effect and rethrows them', () => {
    const api = enableDevtools();
    let errorEvents = 0;
    api.on('error', () => { errorEvents++; });

    assert.throws(() => {
      createEffect(() => { throw new Error('boom'); });
    }, /boom/);

    assert.equal(errorEvents, 1);
    assert.equal(api.stats().totalErrors, 1);
  });

  it('exposes the global __ONEFOLD_DEVTOOLS__ handle', () => {
    enableDevtools();
    assert.ok((window as any).__ONEFOLD_DEVTOOLS__);
  });

  it('disableDevtools() stops further tracking and removes the global handle', () => {
    const api = enableDevtools();
    disableDevtools();

    const before = api.stats().totalRenders;
    const s = createSignal(0);
    createEffect(() => { s(); });

    assert.equal(api.stats().totalRenders, before, 'no new renders should be recorded on the now-detached api object');
    assert.equal((window as any).__ONEFOLD_DEVTOOLS__, undefined);
  });

  it('clear() resets render history and error count', () => {
    const api = enableDevtools();
    const s = createSignal(0);
    createEffect(() => { s(); });
    assert.ok(api.stats().totalRenders > 0);

    api.clear();
    assert.equal(api.stats().totalRenders, 0);
    assert.equal(api.stats().totalErrors, 0);
  });
});
