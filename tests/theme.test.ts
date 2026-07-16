import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTheme } from '../src/core/theme.ts';

describe('createTheme', () => {
  it('initializes with default theme', () => {
    const theme = createTheme({
      light: { bg: '#fff', text: '#000' },
      dark: { bg: '#000', text: '#fff' },
    }, 'light');
    assert.equal(theme.current(), 'light');
  });

  it('sets CSS custom properties on documentElement', () => {
    const theme = createTheme({
      light: { bg: '#ffffff', accent: '#blue' },
    }, 'light');
    assert.equal(document.documentElement.style.getPropertyValue('--bg'), '#ffffff');
    assert.equal(document.documentElement.style.getPropertyValue('--accent'), '#blue');
  });

  it('switches theme', () => {
    const theme = createTheme({
      light: { bg: 'white' },
      dark: { bg: 'black' },
    }, 'light');
    theme.set('dark');
    assert.equal(theme.current(), 'dark');
    assert.equal(document.documentElement.style.getPropertyValue('--bg'), 'black');
  });

  it('toggles through themes', () => {
    const theme = createTheme({
      a: { x: '1' },
      b: { x: '2' },
      c: { x: '3' },
    }, 'a');
    theme.toggle();
    assert.equal(theme.current(), 'b');
    theme.toggle();
    assert.equal(theme.current(), 'c');
    theme.toggle();
    assert.equal(theme.current(), 'a');
  });

  it('lists available themes', () => {
    const theme = createTheme({ light: { a: '1' }, dark: { a: '2' } });
    assert.deepEqual(theme.themes(), ['light', 'dark']);
  });

  it('tokens returns current theme values', () => {
    const theme = createTheme({ x: { color: 'red' } }, 'x');
    assert.deepEqual(theme.tokens(), { color: 'red' });
  });
});
