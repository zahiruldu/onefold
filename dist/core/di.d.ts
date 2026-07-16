/**
 * Lightweight Dependency Injection — provide/inject pattern.
 *
 * No decorators, no classes required. Uses a context stack so services
 * can be scoped to component subtrees, similar to Vue's provide/inject
 * or React's Context, but simpler.
 *
 * Usage:
 * ```ts
 * // Define a token
 * const AuthService = createToken<{ user: Signal<User | null> }>('AuthService');
 *
 * // Provide at app root
 * provide(AuthService, { user: createSignal(null) });
 *
 * // Inject anywhere deeper in the call stack
 * const auth = inject(AuthService);
 * ```
 *
 * For scoped providers (e.g. per-route or per-feature), use `runWithProviders`:
 * ```ts
 * runWithProviders([
 *   [AuthService, { user: createSignal(null) }],
 * ], () => MyComponent());
 * ```
 */
/** A token identifies a service. Tokens are compared by identity (===). */
export interface Token<T> {
    readonly id: symbol;
    readonly __type?: T;
}
/** Create a typed injection token. */
export declare function createToken<T>(name: string): Token<T>;
/**
 * Provide a value for a token. Available to all subsequent `inject()` calls.
 * Call at app startup or inside `runWithProviders` for scoped instances.
 */
export declare function provide<T>(token: Token<T>, value: T): void;
/**
 * Retrieve a provided value by token. Searches scoped providers first (innermost
 * to outermost), then the global registry.
 *
 * Throws if the token was never provided — fail-fast prevents silent bugs.
 */
export declare function inject<T>(token: Token<T>): T;
/**
 * Try to inject — returns undefined instead of throwing if not provided.
 */
export declare function tryInject<T>(token: Token<T>): T | undefined;
/**
 * Run a function with a set of scoped providers. Providers are only visible
 * to code executed synchronously within `fn`. Useful for per-route or
 * per-feature service instances.
 */
export declare function runWithProviders<R>(providers: [Token<unknown>, unknown][], fn: () => R): R;
