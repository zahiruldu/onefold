import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createI18n } from '../src/core/i18n.ts';
import { createEffect } from '../src/core/signal.ts';

describe('createI18n', () => {
  const i18n = createI18n({
    defaultLocale: 'en',
    messages: {
      en: { hello: 'Hello', greeting: 'Hi, {name}!', count: '{n} items' },
      es: { hello: 'Hola', greeting: '¡Hola, {name}!', count: '{n} elementos' },
    },
    fallbackLocale: 'en',
  });

  it('translates a key', () => {
    assert.equal(i18n.t('hello'), 'Hello');
  });

  it('interpolates params', () => {
    assert.equal(i18n.t('greeting', { name: 'Alice' }), 'Hi, Alice!');
  });

  it('returns key if not found', () => {
    assert.equal(i18n.t('missing.key'), 'missing.key');
  });

  it('switches locale reactively', () => {
    let result = '';
    createEffect(() => { result = i18n.t('hello'); });
    assert.equal(result, 'Hello');
    i18n.setLocale('es');
    assert.equal(result, 'Hola');
    i18n.setLocale('en'); // reset
  });

  it('falls back to fallback locale', () => {
    i18n.setLocale('fr'); // no 'fr' messages
    assert.equal(i18n.t('hello'), 'Hello'); // falls back to 'en'
    i18n.setLocale('en'); // reset
  });

  it('addMessages extends a locale', () => {
    i18n.addMessages('en', { farewell: 'Goodbye' });
    assert.equal(i18n.t('farewell'), 'Goodbye');
  });

  it('addMessages reactively updates an already-mounted t() binding (regression)', () => {
    // Regression test: addMessages() previously mutated the internal messages
    // object without any signal write, so a `${() => i18n.t(...)}`-style
    // reactive binding created BEFORE the lazy-loaded translation arrived
    // would never pick it up — exactly the "lazy-load translations" use case
    // the doc comment on addMessages describes.
    const inst = createI18n({
      defaultLocale: 'en',
      messages: { en: {} },
    });

    let result = '';
    let runs = 0;
    createEffect(() => { result = inst.t('lazy_key'); runs++; });

    assert.equal(result, 'lazy_key', 'missing key falls back to returning the key itself');
    assert.equal(runs, 1);

    inst.addMessages('en', { lazy_key: 'Loaded!' });

    assert.equal(runs, 2, 'the effect must re-run when a new message is added, not just when locale changes');
    assert.equal(result, 'Loaded!');
  });

  it('availableLocales lists all', () => {
    assert.deepEqual(i18n.availableLocales(), ['en', 'es']);
  });
});
