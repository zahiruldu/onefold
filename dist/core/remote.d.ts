/**
 * Secure Microfrontend Remote Loader.
 *
 * Security layers:
 * 1. **Trusted Origins** — only pre-approved URLs/origins can be loaded
 * 2. **Subresource Integrity (SRI)** — verify remote code hash before execution
 * 3. **Sandbox Isolation** — full iframe sandbox for untrusted remotes
 * 4. **Permission Model** — restrict what remotes can access
 * 5. **Shadow DOM** — CSS isolation to prevent style attacks
 *
 * Usage:
 * ```ts
 * // Configure trusted remotes at app startup
 * configureSecurity({
 *   trustedOrigins: ['https://billing.company.com', 'http://localhost:3033'],
 *   requireIntegrity: true, // enforce SRI in production
 * });
 *
 * const BillingWidget = loadRemote({
 *   url: 'http://localhost:3033/billing-widget.js',
 *   integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
 *   isolate: 'shadow',
 *   permissions: ['dom'],
 *   fallback: () => Spinner(),
 *   onError: (err) => ErrorBox(err.message),
 * });
 * ```
 */
export interface SecurityConfig {
    /** List of trusted origins (protocol + host + port). Wildcards not allowed. */
    trustedOrigins?: string[];
    /** If true, all remotes MUST provide an integrity hash. Default: false. */
    requireIntegrity?: boolean;
    /** If true, block all remotes (kill switch). Default: false. */
    blockAll?: boolean;
    /** Max time (ms) to wait for a remote to load before timing out. Default: 10000. */
    timeout?: number;
}
/**
 * Configure the security policy for remote loading.
 * Call once at app startup before loading any remotes.
 */
export declare function configureSecurity(config: SecurityConfig): void;
/** Permissions a remote can be granted. */
export type RemotePermission = 'dom' | 'storage' | 'network' | 'navigation' | 'clipboard';
export interface RemoteOptions<P = Record<string, unknown>> {
    /** URL to the remote module (ES module format). */
    url: string;
    /** Name of the exported function. Default: 'default'. */
    exportName?: string;
    /**
     * Isolation level:
     * - 'none': mounted directly into host DOM (trusted code only)
     * - 'shadow': Shadow DOM encapsulation (CSS isolation)
     * - 'iframe': full sandboxed iframe (JS + CSS + DOM isolation)
     */
    isolate?: 'none' | 'shadow' | 'iframe';
    /** SRI hash (e.g., 'sha384-...'). If requireIntegrity is on, this is mandatory. */
    integrity?: string;
    /** Permissions granted to this remote. Default: ['dom']. */
    permissions?: RemotePermission[];
    /** Fallback node shown while loading. */
    fallback?: () => Node;
    /** Error handler — return a node to show on failure. */
    onError?: (error: Error) => Node;
    /** Props to pass to the remote component. */
    props?: P;
    /** Override the global timeout for this specific remote (ms). */
    timeout?: number;
}
export interface RemoteComponent<P = Record<string, unknown>> {
    (props?: P): Node;
}
/**
 * Create a secure remote component loader.
 */
export declare function loadRemote<P = Record<string, unknown>>(options: RemoteOptions<P>): RemoteComponent<P>;
/**
 * Preload a remote module (fetches + verifies but doesn't mount).
 * Useful for prefetching on hover or route anticipation.
 */
export declare function preloadRemote(url: string, integrity?: string): Promise<void>;
/**
 * Invalidate the module cache for a specific URL or all remotes.
 * Use when you detect a compromised remote or need to force a fresh load.
 */
export declare function clearRemoteCache(url?: string): void;
