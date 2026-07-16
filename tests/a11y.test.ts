import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FocusTrap, announce, useKeyboard, SkipLink } from '../src/core/a11y.ts';

describe('FocusTrap', () => {
  it('activates and tracks state', () => {
    const container = document.createElement('div');
    container.innerHTML = '<button>A</button><button>B</button>';
    document.body.appendChild(container);
    const trap = FocusTrap(container);
    assert.equal(trap.active, false);
    trap.activate();
    assert.equal(trap.active, true);
    trap.deactivate();
    assert.equal(trap.active, false);
    container.remove();
  });
});

describe('announce', () => {
  it('creates a live region in the DOM', () => {
    announce('test message');
    const region = document.querySelector('[aria-live]');
    assert.ok(region);
  });
});

describe('useKeyboard', () => {
  it('registers and fires shortcuts', () => {
    let fired = false;
    const shortcuts = useKeyboard({ 'Escape': () => { fired = true; } });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(fired, true);
    shortcuts.destroy();
  });

  it('handles modifier combos', () => {
    let fired = false;
    const shortcuts = useKeyboard({ 'Ctrl+S': () => { fired = true; } });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
    assert.equal(fired, true);
    shortcuts.destroy();
  });

  it('add/remove at runtime', () => {
    let count = 0;
    const shortcuts = useKeyboard({});
    shortcuts.add('Enter', () => { count++; });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert.equal(count, 1);
    shortcuts.remove('Enter');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert.equal(count, 1);
    shortcuts.destroy();
  });
});

describe('SkipLink', () => {
  it('creates an accessible link element', () => {
    const link = SkipLink('#main') as HTMLElement;
    assert.equal(link.tagName.toLowerCase(), 'a');
    assert.equal(link.getAttribute('href'), '#main');
    assert.equal(link.textContent, 'Skip to main content');
  });
});
