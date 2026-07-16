/**
 * Code-splitting helper. Wraps a dynamic `import()` so route-level or feature-level
 * bundles only load when actually rendered — standard enterprise-scale technique,
 * works with any bundler's native `import()` splitting (Vite, esbuild, webpack, Rollup).
 */
export function lazy(loader, fallback) {
    return (props) => {
        const placeholder = document.createElement('div');
        placeholder.appendChild(fallback());
        loader().then((mod) => {
            placeholder.textContent = '';
            placeholder.appendChild(mod.default(props));
        }).catch((err) => {
            console.error('[onefold] lazy() failed to load module:', err);
        });
        return placeholder;
    };
}
