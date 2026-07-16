import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import path from 'node:path';

const tsExtensions = ['.ts', '.tsx'];

export async function resolve(specifier, context, nextResolve) {
  // If specifier already has .ts, let it through
  if (tsExtensions.some(ext => specifier.endsWith(ext))) {
    return nextResolve(specifier, context);
  }

  // Try adding .ts to bare/relative specifiers
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('file:')) {
    for (const ext of tsExtensions) {
      try {
        return await nextResolve(specifier + ext, context);
      } catch { /* continue */ }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!tsExtensions.some(ext => url.endsWith(ext))) {
    return nextLoad(url, context);
  }

  const filePath = fileURLToPath(url);
  const source = await readFile(filePath, 'utf8');

  const { code } = await transform(source, {
    loader: filePath.endsWith('.tsx') ? 'tsx' : 'ts',
    format: 'esm',
    target: 'es2020',
    sourcemap: 'inline',
  });

  return { format: 'module', source: code, shortCircuit: true };
}
