import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPersisted, localStorageAdapter } from '../src/core/persist.ts';

describe('createPersisted', () => {
  it('uses initial value when storage is empty', () => {
    localStorage.clear();
    const s = createPersisted('test-key-1', { theme: 'dark' });
    assert.deepEqual(s(), { theme: 'dark' });
  });

  it('persists to localStorage on set', () => {
    localStorage.clear();
    const s = createPersisted('test-key-2', 0);
    s.set(42);
    const stored = JSON.parse(localStorage.getItem('test-key-2')!);
    assert.equal(stored, 42);
  });

  it('rehydrates from localStorage', () => {
    localStorage.setItem('test-key-3', JSON.stringify('hello'));
    const s = createPersisted('test-key-3', 'default');
    assert.equal(s(), 'hello');
  });

  it('clear removes from storage and resets', () => {
    localStorage.clear();
    const s = createPersisted('test-key-4', 'init');
    s.set('changed');
    s.clear();
    assert.equal(s(), 'init');
    assert.equal(localStorage.getItem('test-key-4'), null);
  });

  it('strips __proto__ from stored data (prototype pollution guard)', () => {
    localStorage.setItem('test-key-5', '{"__proto__":{"admin":true},"name":"ok"}');
    const s = createPersisted('test-key-5', { name: '' });
    const val = s() as any;
    assert.equal(val.name, 'ok');
    assert.equal(val.__proto__?.admin, undefined);
    // Ensure Object.prototype was not polluted
    assert.equal(({} as any).admin, undefined);
  });
});
