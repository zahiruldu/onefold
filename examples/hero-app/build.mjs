import { build, context } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const outDir = resolve(__dirname, 'dist');

mkdirSync(outDir, { recursive: true });

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
  .replace('./dist/hero-app.js', './app.js');
writeFileSync(resolve(outDir, 'index.html'), outputHtml);

if (!isWatch) {
  console.log('Built → dist/ (index.html + style.css + app.js)');
}
