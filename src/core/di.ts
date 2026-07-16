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
  readonly __type?: T; // phantom type for inference
}

/** Create a typed injection token. */
export function createToken<T>(name: string): Token<T> {
  return { id: Symbol(name) };
}

/** The global provider registry. */
const registry = new Map<symbol, unknown>();

/** Scoped provider stack for runWithProviders. */
const scopeStack: Map<symbol, unknown>[] = [];

/**
 * Provide a value for a token. Available to all subsequent `inject()` calls.
 * Call at app startup or inside `runWithProviders` for scoped instances.
 */
export function provide<T>(token: Token<T>, value: T): void {
  if (scopeStack.length > 0) {
    scopeStack[scopeStack.length - 1]!.set(token.id, value);
  } else {
    registry.set(token.id, value);
  }
}

/**
 * Retrieve a provided value by token. Searches scoped providers first (innermost
 * to outermost), then the global registry.
 *
 * Throws if the token was never provided — fail-fast prevents silent bugs.
 */
export function inject<T>(token: Token<T>): T {
  // Check scopes from innermost to outermost
  for (let i = scopeStack.length - 1; i >= 0; i--) {
    const scope = scopeStack[i]!;
    if (scope.has(token.id)) return scope.get(token.id) as T;
  }
  // Check global
  if (registry.has(token.id)) return registry.get(token.id) as T;
  throw new Error(`[onefold] No provider found for token: ${token.id.toString()}`);
}

/**
 * Try to inject — returns undefined instead of throwing if not provided.
 */
export function tryInject<T>(token: Token<T>): T | undefined {
  for (let i = scopeStack.length - 1; i >= 0; i--) {
    const scope = scopeStack[i]!;
    if (scope.has(token.id)) return scope.get(token.id) as T;
  }
  if (registry.has(token.id)) return registry.get(token.id) as T;
  return undefined;
}

/**
 * Run a function with a set of scoped providers. Providers are only visible
 * to code executed synchronously within `fn`. Useful for per-route or
 * per-feature service instances.
 */
export function runWithProviders<R>(
  providers: [Token<unknown>, unknown][],
  fn: () => R
): R {
  const scope = new Map<symbol, unknown>();
  for (const [token, value] of providers) {
    scope.set(token.id, value);
  }
  scopeStack.push(scope);
  try {
    return fn();
  } finally {
    scopeStack.pop();
  }
}
