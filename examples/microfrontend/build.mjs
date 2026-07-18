import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const outDir = resolve(__dirname, 'dist');

mkdirSync(outDir, { recursive: true });

// Build host shell
await build({
  entryPoints: [resolve(__dirname, 'host/main.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(outDir, 'host.js'),
  minify: !isWatch,
});

// Build remote widgets (each is independently deployable)
await build({
  entryPoints: [resolve(__dirname, 'remotes/billing-widget.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(outDir, 'billing-widget.js'),
  minify: !isWatch,
});

await build({
  entryPoints: [resolve(__dirname, 'remotes/analytics-widget.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(outDir, 'analytics-widget.js'),
  minify: !isWatch,
});

// Extract global CSS → style.css, replace inline <style> with <link>
const html = readFileSync(resolve(__dirname, 'index.html'), 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  const minifiedCSS = styleMatch[1].trim()
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
  writeFileSync(resolve(outDir, 'style.css'), minifiedCSS);
}

const outputHtml = html
  .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="./style.css" />')
  .replace('./dist/host.js', './host.js');
writeFileSync(resolve(outDir, 'index.html'), outputHtml);

if (!isWatch) {
  console.log('Built → dist/');
  console.log('  index.html        (references style.css + host.js)');
  console.log('  style.css         (global styles, minified)');
  console.log('  host.js           (host shell bundle)');
  console.log('  billing-widget.js (remote widget)');
  console.log('  analytics-widget.js (remote widget)');
}
