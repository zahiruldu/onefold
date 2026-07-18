import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const outDir = resolve(__dirname, 'dist');

mkdirSync(outDir, { recursive: true });

// Bundle JS
const buildOptions = {
  entryPoints: [resolve(__dirname, 'main.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(outDir, 'app.js'),
  minify: !isWatch,
};

if (isWatch) {
  const ctx = await context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build(buildOptions);
}

// Copy index.html → dist/
copyFileSync(resolve(__dirname, 'index.html'), resolve(outDir, 'index.html'));

// Minify and copy style.css → dist/
const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8');
const minifiedCss = css
  .replace(/\/\*[\s\S]*?\*\//g, '')   // strip comments
  .replace(/\s*([{};:,])\s*/g, '$1')  // collapse whitespace around syntax
  .replace(/\n+/g, '')                 // remove newlines
  .trim();
writeFileSync(resolve(outDir, 'style.css'), minifiedCss);

if (!isWatch) {
  console.log('Built → dist/ (index.html + app.js + style.css, ready to deploy)');
}
