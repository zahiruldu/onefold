/**
 * Code-splitting helper. Wraps a dynamic `import()` so route-level or feature-level
 * bundles only load when actually rendered — standard enterprise-scale technique,
 * works with any bundler's native `import()` splitting (Vite, esbuild, webpack, Rollup).
 */
export function lazy<P extends object>(
  loader: () => Promise<{ default: (props: P) => Node }>,
  fallback: () => Node
): (props: P) => Node {
  return (props: P) => {
    const placeholder = document.createElement('div');
    placeholder.appendChild(fallback());

    let hadParent = false;
    loader().then((mod) => {
      // If the placeholder was parented (rendered) then removed, skip the update
      if (hadParent && !placeholder.parentNode) return;
      placeholder.textContent = '';
      placeholder.appendChild(mod.default(props));
    }).catch((err) => {
      if (hadParent && !placeholder.parentNode) return;
      console.error('[onefold] lazy() failed to load module:', err);
    });

    // Track when the placeholder gets attached to a parent
    queueMicrotask(() => { if (placeholder.parentNode) hadParent = true; });

    return placeholder;
  };
}
