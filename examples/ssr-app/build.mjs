/**
 * Build script — produces a deployable dist/ folder.
 * 
 * Output:
 *   dist/
 *     server.mjs         Server bundle (Node.js)
 *     public/
 *       app.js           Client bundle (browser)
 *       style.css        Styles
 */
import { build } from 'esbuild';
import { mkdirSync, cpSync, existsSync } from 'node:fs';

mkdirSync('dist/public', { recursive: true });

// Server bundle
await build({
  entryPoints: ['src/server/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: 'dist/server.mjs',
  packages: 'external',
  define: { '__DEV__': 'false' },
});

// Client bundle
await build({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/public/app.js',
  minify: true,
  define: { '__DEV__': 'false' },
});

// Copy public assets
if (existsSync('public')) {
  cpSync('public', 'dist/public', { recursive: true });
}

console.log('Build complete → dist/');
console.log('  dist/server.mjs    (run with: node dist/server.mjs)');
console.log('  dist/public/app.js (client bundle)');
