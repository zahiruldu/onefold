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
import { type Signal } from './signal';
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
    fields: {
        [K in keyof T]: FormField<T[K]['initial']>;
    };
    /** Whether all fields are valid (reactive). */
    valid: Signal<boolean>;
    /** Whether any field has been touched (reactive). */
    dirty: Signal<boolean>;
    /** Get all current values as a plain object. */
    values: () => {
        [K in keyof T]: T[K]['initial'];
    };
    /** Validate all fields (touches them) and call handler if valid. */
    submit: (handler: (values: {
        [K in keyof T]: T[K]['initial'];
    }) => void) => void;
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
/** Field must have a non-empty value. */
export declare function required(msg?: string): ValidationRule;
/** String must match email pattern. */
export declare function email(msg?: string): ValidationRule<string>;
/** String must be at least `n` characters. */
export declare function minLength(n: number, msg?: string): ValidationRule<string>;
/** String must be at most `n` characters. */
export declare function maxLength(n: number, msg?: string): ValidationRule<string>;
/** Value must match regex. */
export declare function pattern(re: RegExp, msg?: string): ValidationRule<string>;
/** Number must be at least `n`. */
export declare function min(n: number, msg?: string): ValidationRule<number>;
/** Number must be at most `n`. */
export declare function max(n: number, msg?: string): ValidationRule<number>;
/** Custom validation with a predicate. */
export declare function custom<T>(predicate: (value: T) => boolean, msg: string): ValidationRule<T>;
/**
 * Create a reactive form with typed fields and validation.
 */
export declare function createForm<T extends Record<string, FieldConfig<any>>>(config: T): Form<T>;
