/**
 * AI Manifest Plugin for esbuild.
 *
 * Auto-generates a `.onefold/manifest.json` at build time by scanning
 * the source for component registrations, routes, state, and API usage.
 * AI tools consume this file to understand the app without parsing source.
 *
 * Usage:
 * ```ts
 * import { manifestPlugin } from 'onefold/compiler';
 *
 * esbuild.build({
 *   plugins: [manifestPlugin({ outDir: '.onefold' })],
 * });
 * ```
 */
import type { Plugin } from 'esbuild';
export interface ManifestPluginOptions {
    /** Output directory for manifest.json. Default: '.onefold'. */
    outDir?: string;
    /** Include file paths in manifest. Default: true. */
    includePaths?: boolean;
}
/**
 * esbuild plugin that generates a machine-readable app manifest.
 */
export declare function manifestPlugin(options?: ManifestPluginOptions): Plugin;
