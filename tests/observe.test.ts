import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createObserver } from '../src/core/observe.ts';

describe('createObserver', () => {
  it('emits and receives events', () => {
    const obs = createObserver();
    let received: any = null;
    obs.on('error', (e) => { received = e; });
    obs.emit('error', { error: new Error('test'), context: 'unit' });
    assert.ok(received);
    assert.equal((received.error as Error).message, 'test');
    assert.ok(received.timestamp > 0);
  });

  it('unsubscribes correctly', () => {
    const obs = createObserver();
    let count = 0;
    const unsub = obs.on('metric', () => { count++; });
    obs.emit('metric', { name: 'x', value: 1 });
    assert.equal(count, 1);
    unsub();
    obs.emit('metric', { name: 'x', value: 2 });
    assert.equal(count, 1);
  });

  it('trackRender measures duration', () => {
    const obs = createObserver();
    let entry: any = null;
    obs.on('render', (e) => { entry = e; });
    const result = obs.trackRender('TestComp', () => 42);
    assert.equal(result, 42);
    assert.ok(entry);
    assert.equal(entry.component, 'TestComp');
    assert.ok(entry.duration >= 0);
  });

  it('trackError catches and emits', () => {
    const obs = createObserver();
    let errorEvent: any = null;
    obs.on('error', (e) => { errorEvent = e; });
    const result = obs.trackError(() => { throw new Error('boom'); }, 'ctx');
    assert.equal(result, undefined);
    assert.ok(errorEvent);
    assert.equal(errorEvent.context, 'ctx');
  });

  it('log emits structured log', () => {
    const obs = createObserver();
    let logEntry: any = null;
    obs.on('log', (e) => { logEntry = e; });
    obs.log('info', 'hello', { extra: 1 });
    assert.equal(logEntry.level, 'info');
    assert.equal(logEntry.message, 'hello');
  });

  it('clear removes all subscribers', () => {
    const obs = createObserver();
    let count = 0;
    obs.on('metric', () => { count++; });
    obs.clear();
    obs.emit('metric', { name: 'x', value: 1 });
    assert.equal(count, 0);
  });
});
