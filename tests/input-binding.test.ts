import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal, batch } from '../src/core/signal.ts';
import { html } from '../src/core/template.ts';
import { createForm, required, minLength } from '../src/core/form.ts';

describe('Input value binding', () => {
  it('sets initial value on input via property', () => {
    const name = createSignal('hello');
    const el = html`<input value=${() => name()} />` as HTMLInputElement;
    assert.equal(el.value, 'hello');
  });

  it('updates input value when signal changes', () => {
    const name = createSignal('initial');
    const el = html`<input value=${() => name()} />` as HTMLInputElement;
    assert.equal(el.value, 'initial');

    name.set('updated');
    assert.equal(el.value, 'updated');
  });

  it('clears input value when signal set to empty string', () => {
    const name = createSignal('some text');
    const el = html`<input value=${() => name()} />` as HTMLInputElement;
    assert.equal(el.value, 'some text');

    name.set('');
    assert.equal(el.value, '');
  });

  it('clears input after simulated user interaction', () => {
    const text = createSignal('user typed this');
    const el = html`<input value=${() => text()} />` as HTMLInputElement;

    // Simulate user typing (changes .value property, not attribute)
    el.value = 'something else typed by user';

    // Signal reset should override the user-typed value
    text.set('');
    assert.equal(el.value, '');
  });

  it('works with numeric values', () => {
    const count = createSignal(42);
    const el = html`<input value=${() => String(count())} />` as HTMLInputElement;
    assert.equal(el.value, '42');

    count.set(0);
    assert.equal(el.value, '0');
  });

  it('static value attribute sets initial value', () => {
    const el = html`<input value=${'static'} />` as HTMLInputElement;
    assert.equal(el.value, 'static');
  });
});

describe('Checkbox checked binding', () => {
  it('sets initial checked state', () => {
    const on = createSignal(true);
    const el = html`<input type="checkbox" checked=${() => on()} />` as HTMLInputElement;
    assert.equal(el.checked, true);
  });

  it('unchecks when signal becomes false', () => {
    const on = createSignal(true);
    const el = html`<input type="checkbox" checked=${() => on()} />` as HTMLInputElement;
    assert.equal(el.checked, true);

    on.set(false);
    assert.equal(el.checked, false);
  });

  it('toggles checked state', () => {
    const on = createSignal(false);
    const el = html`<input type="checkbox" checked=${() => on()} />` as HTMLInputElement;
    assert.equal(el.checked, false);

    on.set(true);
    assert.equal(el.checked, true);

    on.set(false);
    assert.equal(el.checked, false);
  });
});

describe('Form reset clears input values', () => {
  it('form.reset() resets field values to initial', () => {
    const form = createForm({
      email: { initial: '', rules: [required()] },
      password: { initial: '', rules: [required(), minLength(8)] },
    });

    // Simulate setting values
    form.fields.email.set('test@example.com');
    form.fields.password.set('secretpass');

    assert.equal(form.fields.email.value(), 'test@example.com');
    assert.equal(form.fields.password.value(), 'secretpass');

    // Reset
    form.reset();

    assert.equal(form.fields.email.value(), '');
    assert.equal(form.fields.password.value(), '');
  });

  it('form.reset() clears touched state', () => {
    const form = createForm({
      name: { initial: '', rules: [required()] },
    });

    form.fields.name.set('Bob');
    assert.equal(form.fields.name.touched(), true);

    form.reset();
    assert.equal(form.fields.name.touched(), false);
  });

  it('form.reset() clears errors', () => {
    const form = createForm({
      email: { initial: '', rules: [required()] },
    });

    // Touch the field to trigger validation
    form.fields.email.set('x');
    form.fields.email.set('');
    // After touching and clearing, error should show
    assert.ok(form.fields.email.error().length > 0);

    form.reset();
    // After reset, error should be cleared (untouched)
    assert.equal(form.fields.email.error(), '');
  });

  it('individual field reset works', () => {
    const form = createForm({
      name: { initial: 'default', rules: [] },
    });

    form.fields.name.set('changed');
    assert.equal(form.fields.name.value(), 'changed');

    form.fields.name.reset();
    assert.equal(form.fields.name.value(), 'default');
    assert.equal(form.fields.name.touched(), false);
  });

  it('form reset reflects in bound input elements', () => {
    const form = createForm({
      search: { initial: '', rules: [] },
    });

    // Create an input bound to the form field
    const el = html`<input value=${() => form.fields.search.value()} />` as HTMLInputElement;

    form.fields.search.set('hello world');
    assert.equal(el.value, 'hello world');

    form.reset();
    assert.equal(el.value, '');
  });
});

describe('Signal-driven input clearing (common pattern)', () => {
  it('signal.set("") clears a bound input', () => {
    const query = createSignal('search term');
    const el = html`<input value=${() => query()} />` as HTMLInputElement;
    assert.equal(el.value, 'search term');

    query.set('');
    assert.equal(el.value, '');
  });

  it('batch update clears input correctly', () => {
    const items = createSignal<string[]>([]);
    const input = createSignal('new item');
    const el = html`<input value=${() => input()} />` as HTMLInputElement;

    // Add item and clear input in batch
    batch(() => {
      items.set(prev => [...prev, input()]);
      input.set('');
    });

    assert.equal(el.value, '');
    assert.deepEqual(items(), ['new item']);
  });

  it('multiple rapid signal changes update input correctly', () => {
    const val = createSignal('a');
    const el = html`<input value=${() => val()} />` as HTMLInputElement;

    val.set('b');
    val.set('c');
    val.set('');
    assert.equal(el.value, '');

    val.set('final');
    assert.equal(el.value, 'final');
  });
});
