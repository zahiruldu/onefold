/**
 * AOT Compiler Plugin for esbuild.
 *
 * Pre-compiles `html` and `css` tagged templates at build time into direct
 * DOM calls, eliminating the runtime parser overhead entirely for production.
 *
 * Usage in your build script:
 * ```ts
 * import esbuild from 'esbuild';
 * import { onefoldPlugin } from 'onefold/compiler';
 *
 * esbuild.build({
 *   entryPoints: ['src/main.ts'],
 *   bundle: true,
 *   plugins: [onefoldPlugin()],
 *   outfile: 'dist/app.js',
 * });
 * ```
 *
 * What it does today:
 * - Finds `css\`...\`` calls and pre-generates the scope class + CSS string
 *   so the runtime just injects a pre-built string (no parsing at runtime).
 *
 * What it does NOT do (yet): there is no `html` AOT transform. `html`\`...\`
 * templates are always parsed at runtime by template.ts, with or without this
 * plugin — a static-template compiler for `html` is a real, separate project
 * (source-to-source rewriting into `document.createElement`/`setAttribute`
 * calls, handling dynamic vs. static children, etc.) that has not been built.
 * Do not claim this plugin AOT-compiles `html` templates; it only handles `css`.
 *
 * This is an OPTIONAL optimization. The runtime works identically without it.
 * Use it for production builds when you want to skip CSS parsing at runtime.
 */
import type { Plugin } from 'esbuild';
/**
 * The esbuild plugin. Currently only transforms `css`\`...\` templates — see
 * the module-level doc comment above for why `html` is out of scope for now.
 *
 * Options:
 * - `css`: Enable CSS AOT compilation (default: true)
 * - `filter`: Regex for files to process (default: /\.(ts|tsx|js|jsx)$/)
 */
export interface NanoframePluginOptions {
    /** Enable CSS template AOT compilation. Default: true. */
    css?: boolean;
    /** File filter regex. Default: /\.(ts|tsx|js|jsx)$/ */
    filter?: RegExp;
}
export declare function onefoldPlugin(options?: NanoframePluginOptions): Plugin;
