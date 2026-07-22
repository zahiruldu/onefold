import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  const fixed = content.replace(/(from\s+['"])(\.\.?\/[^'"]+?)(?<!\.js)(['"])/g, '$1$2.js$3');
  if (fixed !== content) writeFileSync(filePath, fixed);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.js')) fixFile(full);
  }
}

walk(DIST);
console.log('Fixed .js extensions in dist/');
