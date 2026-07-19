/**
 * Build-time constant replaced by esbuild's `define` option.
 * - `true` in dev mode (enables warnings, profiling, rich errors)
 * - `false` in production (all __DEV__ blocks are tree-shaken)
 *
 * Consumer projects set this in their build scripts:
 *   define: { '__DEV__': 'true' }   // dev.mjs
 *   define: { '__DEV__': 'false' }  // build.mjs
 */
declare const __DEV__: boolean;
