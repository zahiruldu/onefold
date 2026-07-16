import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createForm, required, email, minLength, maxLength, min, max, pattern, custom } from '../src/core/form.ts';

describe('createForm', () => {
  it('initializes fields with initial values', () => {
    const form = createForm({
      name: { initial: '', rules: [] },
      age: { initial: 0, rules: [] },
    });
    assert.equal(form.fields.name.value(), '');
    assert.equal(form.fields.age.value(), 0);
  });

  it('validates on touch', () => {
    const form = createForm({
      email: { initial: '', rules: [required()] },
    });
    // Not touched yet — no error shown
    assert.equal(form.fields.email.error(), '');
    // Touch it
    form.fields.email.set('');
    assert.equal(form.fields.email.error(), 'Required');
  });

  it('clears error when valid', () => {
    const form = createForm({
      name: { initial: '', rules: [required()] },
    });
    form.fields.name.set('Alice');
    assert.equal(form.fields.name.error(), '');
    assert.equal(form.fields.name.valid(), true);
  });

  it('form.valid reflects all fields', () => {
    const form = createForm({
      a: { initial: 'ok', rules: [required()] },
      b: { initial: '', rules: [required()] },
    });
    // b is invalid but untouched — form reports structural validity
    assert.equal(form.valid(), false);
  });

  it('submit touches all and calls handler if valid', () => {
    const form = createForm({
      name: { initial: 'Bob', rules: [required()] },
    });
    let submitted = false;
    form.submit((values) => { submitted = true; assert.equal(values.name, 'Bob'); });
    assert.equal(submitted, true);
  });

  it('submit does not call handler if invalid', () => {
    const form = createForm({
      name: { initial: '', rules: [required()] },
    });
    let submitted = false;
    form.submit(() => { submitted = true; });
    assert.equal(submitted, false);
    assert.equal(form.fields.name.error(), 'Required');
  });

  it('reset restores initial values', () => {
    const form = createForm({
      name: { initial: 'default', rules: [] },
    });
    form.fields.name.set('changed');
    form.reset();
    assert.equal(form.fields.name.value(), 'default');
    assert.equal(form.fields.name.touched(), false);
  });
});

describe('Validation rules', () => {
  it('required', () => {
    assert.equal(required()(''), 'Required');
    assert.equal(required()('a'), null);
    assert.equal(required()(null), 'Required');
    assert.equal(required()([]), 'Required');
  });

  it('email', () => {
    assert.equal(email()('bad'), 'Invalid email');
    assert.equal(email()('a@b.c'), null);
  });

  it('minLength', () => {
    assert.ok(minLength(3)('ab'));
    assert.equal(minLength(3)('abc'), null);
  });

  it('maxLength', () => {
    assert.equal(maxLength(3)('abc'), null);
    assert.ok(maxLength(3)('abcd'));
  });

  it('min', () => {
    assert.ok(min(5)(4));
    assert.equal(min(5)(5), null);
  });

  it('max', () => {
    assert.equal(max(10)(10), null);
    assert.ok(max(10)(11));
  });

  it('pattern', () => {
    assert.equal(pattern(/^\d+$/)('123'), null);
    assert.ok(pattern(/^\d+$/)('abc'));
  });

  it('custom', () => {
    const even = custom<number>((v) => v % 2 === 0, 'Must be even');
    assert.equal(even(4), null);
    assert.equal(even(3), 'Must be even');
  });
});
