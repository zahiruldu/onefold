/**
 * Signal-driven form state management with validation.
 *
 * No dependencies, no class instances. A form is just a collection of signals
 * with validation rules attached. Validation runs reactively when values change.
 *
 * Usage:
 * ```ts
 * const form = createForm({
 *   email: { initial: '', rules: [required(), email()] },
 *   password: { initial: '', rules: [required(), minLength(8)] },
 * });
 *
 * // Read values reactively
 * form.fields.email.value()    // ''
 * form.fields.email.error()    // 'Required' (after touch)
 * form.valid()                 // false
 *
 * // Bind to inputs
 * html`<input oninput=${form.fields.email.handle} />`
 *
 * // Submit
 * form.submit((values) => { ... });
 * ```
 */
import { createSignal, createEffect, batch } from './signal.js';
/* ────────────────── Built-in validation rules ────────────────── */
/** Field must have a non-empty value. */
export function required(msg = 'Required') {
    return (value) => {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            return msg;
        }
        return null;
    };
}
/** String must match email pattern. */
export function email(msg = 'Invalid email') {
    return (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg;
}
/** String must be at least `n` characters. */
export function minLength(n, msg) {
    return (value) => value.length >= n ? null : (msg ?? `Minimum ${n} characters`);
}
/** String must be at most `n` characters. */
export function maxLength(n, msg) {
    return (value) => value.length <= n ? null : (msg ?? `Maximum ${n} characters`);
}
/** Value must match regex. */
export function pattern(re, msg = 'Invalid format') {
    return (value) => re.test(value) ? null : msg;
}
/** Number must be at least `n`. */
export function min(n, msg) {
    return (value) => value >= n ? null : (msg ?? `Minimum value is ${n}`);
}
/** Number must be at most `n`. */
export function max(n, msg) {
    return (value) => value <= n ? null : (msg ?? `Maximum value is ${n}`);
}
/** Custom validation with a predicate. */
export function custom(predicate, msg) {
    return (value) => predicate(value) ? null : msg;
}
/* ────────────────── createForm ────────────────── */
/**
 * Create a reactive form with typed fields and validation.
 */
export function createForm(config) {
    const fieldEntries = Object.entries(config);
    const fields = {};
    const disposers = [];
    for (const [name, fieldConfig] of fieldEntries) {
        const value = createSignal(fieldConfig.initial);
        const touched = createSignal(false);
        const error = createSignal('');
        const valid = createSignal(true);
        const rules = fieldConfig.rules ?? [];
        // Run validation reactively whenever value changes
        disposers.push(createEffect(() => {
            const val = value();
            // Only show errors if touched
            if (!touched()) {
                error.set('');
                valid.set(runRules(rules, val) === null);
                return;
            }
            const err = runRules(rules, val);
            error.set(err ?? '');
            valid.set(err === null);
        }));
        fields[name] = {
            value,
            error,
            touched,
            valid,
            handle: (e) => {
                const target = e.target;
                const newValue = target.type === 'checkbox' ? target.checked
                    : target.type === 'number' ? Number(target.value)
                        : target.value;
                batch(() => {
                    value.set(newValue);
                    touched.set(true);
                });
            },
            set: (v) => {
                batch(() => {
                    value.set(v);
                    touched.set(true);
                });
            },
            reset: () => {
                batch(() => {
                    value.set(fieldConfig.initial);
                    touched.set(false);
                });
            },
        };
    }
    // Aggregate signals
    const formValid = createSignal(true);
    const formDirty = createSignal(false);
    disposers.push(createEffect(() => {
        let allValid = true;
        let anyTouched = false;
        for (const field of Object.values(fields)) {
            if (!field.valid())
                allValid = false;
            if (field.touched())
                anyTouched = true;
        }
        formValid.set(allValid);
        formDirty.set(anyTouched);
    }));
    return {
        fields: fields,
        valid: formValid,
        dirty: formDirty,
        values: () => {
            const result = {};
            for (const [name, field] of Object.entries(fields)) {
                result[name] = field.value.peek();
            }
            return result;
        },
        submit: (handler) => {
            // Touch all fields to show errors
            batch(() => {
                for (const field of Object.values(fields)) {
                    field.touched.set(true);
                }
            });
            if (formValid.peek()) {
                const result = {};
                for (const [name, field] of Object.entries(fields)) {
                    result[name] = field.value.peek();
                }
                handler(result);
            }
        },
        reset: () => {
            batch(() => {
                for (const field of Object.values(fields)) {
                    field.reset();
                }
            });
        },
        dispose: () => {
            for (const dispose of disposers)
                dispose();
        },
    };
}
/** Run rules sequentially, return first error or null. */
function runRules(rules, value) {
    for (const rule of rules) {
        const err = rule(value);
        if (err)
            return err;
    }
    return null;
}
