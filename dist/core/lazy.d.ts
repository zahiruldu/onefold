/**
 * Code-splitting helper. Wraps a dynamic `import()` so route-level or feature-level
 * bundles only load when actually rendered — standard enterprise-scale technique,
 * works with any bundler's native `import()` splitting (Vite, esbuild, webpack, Rollup).
 */
export declare function lazy<P extends object>(loader: () => Promise<{
    default: (props: P) => Node;
}>, fallback: () => Node): (props: P) => Node;
