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

import { createSignal, createEffect, batch, type Signal } from './signal';

/* ────────────────── Types ────────────────── */

/** A validation rule: returns an error message string, or null/undefined if valid. */
export type ValidationRule<T = unknown> = (value: T) => string | null | undefined;

/** Configuration for a single form field. */
export interface FieldConfig<T> {
  initial: T;
  rules?: ValidationRule<T>[];
}

/** The reactive state for a single form field. */
export interface FormField<T> {
  /** Current value (reactive). */
  value: Signal<T>;
  /** First validation error, or '' if valid (reactive). */
  error: Signal<string>;
  /** Whether the field has been interacted with (reactive). */
  touched: Signal<boolean>;
  /** Whether the field currently passes all validation rules (reactive). */
  valid: Signal<boolean>;
  /** Event handler for `oninput` — updates value and marks as touched. */
  handle: (e: Event) => void;
  /** Set the value programmatically. */
  set: (value: T) => void;
  /** Reset to initial value. */
  reset: () => void;
}

/** A form instance with typed fields. */
export interface Form<T extends Record<string, FieldConfig<unknown>>> {
  /** Individual field state objects. */
  fields: { [K in keyof T]: FormField<T[K]['initial']> };
  /** Whether all fields are valid (reactive). */
  valid: Signal<boolean>;
  /** Whether any field has been touched (reactive). */
  dirty: Signal<boolean>;
  /** Get all current values as a plain object. */
  values: () => { [K in keyof T]: T[K]['initial'] };
  /** Validate all fields (touches them) and call handler if valid. */
  submit: (handler: (values: { [K in keyof T]: T[K]['initial'] }) => void) => void;
  /** Reset all fields to initial values. */
  reset: () => void;
  /**
   * Stop all of this form's internal validation effects (one per field, plus
   * the aggregate valid/dirty effect). `createForm` has no DOM node of its own
   * to key automatic cleanup off of — call this yourself if the form can be
   * created and discarded repeatedly (e.g. inside a modal that reopens) rather
   * than living for the app's whole lifetime.
   */
  dispose: () => void;
}

/* ────────────────── Built-in validation rules ────────────────── */

/** Field must have a non-empty value. */
export function required(msg = 'Required'): ValidationRule {
  return (value) => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return msg;
    }
    return null;
  };
}

/** String must match email pattern. */
export function email(msg = 'Invalid email'): ValidationRule<string> {
  return (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg;
}

/** String must be at least `n` characters. */
export function minLength(n: number, msg?: string): ValidationRule<string> {
  return (value) => value.length >= n ? null : (msg ?? `Minimum ${n} characters`);
}

/** String must be at most `n` characters. */
export function maxLength(n: number, msg?: string): ValidationRule<string> {
  return (value) => value.length <= n ? null : (msg ?? `Maximum ${n} characters`);
}

/** Value must match regex. */
export function pattern(re: RegExp, msg = 'Invalid format'): ValidationRule<string> {
  return (value) => re.test(value) ? null : msg;
}

/** Number must be at least `n`. */
export function min(n: number, msg?: string): ValidationRule<number> {
  return (value) => value >= n ? null : (msg ?? `Minimum value is ${n}`);
}

/** Number must be at most `n`. */
export function max(n: number, msg?: string): ValidationRule<number> {
  return (value) => value <= n ? null : (msg ?? `Maximum value is ${n}`);
}

/** Custom validation with a predicate. */
export function custom<T>(predicate: (value: T) => boolean, msg: string): ValidationRule<T> {
  return (value) => predicate(value) ? null : msg;
}

/* ────────────────── createForm ────────────────── */

/**
 * Create a reactive form with typed fields and validation.
 */
export function createForm<T extends Record<string, FieldConfig<any>>>(config: T): Form<T> {
  const fieldEntries = Object.entries(config) as [string, FieldConfig<unknown>][];
  const fields: Record<string, FormField<unknown>> = {};
  const disposers: (() => void)[] = [];

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
      handle: (e: Event) => {
        const target = e.target as HTMLInputElement;
        const newValue = target.type === 'checkbox' ? target.checked
          : target.type === 'number' ? Number(target.value)
          : target.value;
        batch(() => {
          value.set(newValue);
          touched.set(true);
        });
      },
      set: (v: unknown) => {
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
      if (!field.valid()) allValid = false;
      if (field.touched()) anyTouched = true;
    }
    formValid.set(allValid);
    formDirty.set(anyTouched);
  }));

  return {
    fields: fields as Form<T>['fields'],
    valid: formValid,
    dirty: formDirty,
    values: () => {
      const result: Record<string, unknown> = {};
      for (const [name, field] of Object.entries(fields)) {
        result[name] = field.value.peek();
      }
      return result as { [K in keyof T]: T[K]['initial'] };
    },
    submit: (handler) => {
      // Touch all fields to show errors
      batch(() => {
        for (const field of Object.values(fields)) {
          field.touched.set(true);
        }
      });
      if (formValid.peek()) {
        const result: Record<string, unknown> = {};
        for (const [name, field] of Object.entries(fields)) {
          result[name] = field.value.peek();
        }
        handler(result as { [K in keyof T]: T[K]['initial'] });
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
      for (const dispose of disposers) dispose();
    },
  };
}

/** Run rules sequentially, return first error or null. */
function runRules(rules: ValidationRule<unknown>[], value: unknown): string | null {
  for (const rule of rules) {
    const err = rule(value);
    if (err) return err;
  }
  return null;
}
