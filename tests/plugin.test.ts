import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPluginHost } from '../src/core/plugin.ts';

describe('createPluginHost', () => {
  it('registers and starts a plugin', () => {
    const host = createPluginHost();
    let setupCalled = false;
    host.register({
      name: 'test',
      version: '1.0.0',
      setup: () => { setupCalled = true; },
    });
    assert.equal(host.getStatus('test'), 'registered');
    host.start();
    assert.equal(setupCalled, true);
    assert.equal(host.getStatus('test'), 'active');
  });

  it('stops a plugin and calls teardown', () => {
    const host = createPluginHost();
    let tornDown = false;
    host.register({
      name: 'td',
      version: '1.0.0',
      setup: () => {},
      teardown: () => { tornDown = true; },
    });
    host.start();
    host.stop();
    assert.equal(tornDown, true);
    assert.equal(host.getStatus('td'), 'stopped');
  });

  it('sandboxes errors by default', () => {
    const host = createPluginHost();
    host.register({
      name: 'bad',
      version: '1.0.0',
      setup: () => { throw new Error('crash'); },
    });
    // Should not throw
    host.start();
    assert.equal(host.getStatus('bad'), 'error');
  });

  it('propagates errors when sandbox=false', () => {
    const host = createPluginHost();
    host.register({
      name: 'strict',
      version: '1.0.0',
      sandbox: false,
      setup: () => { throw new Error('crash'); },
    });
    assert.throws(() => host.start(), /crash/);
  });

  it('plugin context emits events', () => {
    const host = createPluginHost();
    let received = false;
    host.on('plugin:event:ping', () => { received = true; });
    host.register({
      name: 'emitter',
      version: '1.0.0',
      setup: (ctx) => { ctx.emit('ping'); },
    });
    host.start();
    assert.equal(received, true);
  });

  it('lists registered plugins', () => {
    const host = createPluginHost();
    host.register({ name: 'a', version: '1', setup: () => {} });
    host.register({ name: 'b', version: '1', setup: () => {} });
    assert.deepEqual(host.list(), ['a', 'b']);
  });

  it('unregister removes plugin', () => {
    const host = createPluginHost();
    host.register({ name: 'temp', version: '1', setup: () => {} });
    host.unregister('temp');
    assert.equal(host.getStatus('temp'), null);
  });
});
