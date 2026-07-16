/**
 * Custom module loader that resolves .ts extensions and strips TypeScript types.
 * Uses esbuild (already a devDep) for fast transforms.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./loader.mjs', pathToFileURL('./tests/'));
