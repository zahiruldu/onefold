/// <reference types="node" />
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
let scopeCounter = 0;
function nextScopeId() {
    return `nf-${(scopeCounter++).toString(36)}`;
}
/**
 * Simple CSS scoper (build-time version — same logic as runtime but runs at compile time).
 */
function scopeCSS(raw, scopeClass) {
    const prefix = `.${scopeClass}`;
    let result = '';
    let i = 0;
    const len = raw.length;
    while (i < len) {
        while (i < len && /\s/.test(raw[i])) {
            result += raw[i];
            i++;
        }
        if (i >= len)
            break;
        if (raw[i] === '@') {
            const atStart = i;
            while (i < len && raw[i] !== '{')
                i++;
            result += raw.slice(atStart, i);
            if (i < len) {
                result += raw[i];
                i++;
            }
            const body = extractBlock(raw, i - 1);
            const inner = body.slice(1, -1);
            result += scopeCSS(inner, scopeClass);
            result += '}';
            i += body.length - 1;
            continue;
        }
        const selStart = i;
        while (i < len && raw[i] !== '{')
            i++;
        const selectors = raw.slice(selStart, i).trim();
        if (!selectors || i >= len)
            break;
        const scopedSelectors = selectors.split(',').map((sel) => {
            sel = sel.trim();
            if (!sel)
                return sel;
            if (sel === ':root' || sel === ':host')
                return prefix;
            if (sel.startsWith('&'))
                return prefix + sel.slice(1);
            return `${prefix} ${sel}`;
        }).join(', ');
        result += scopedSelectors;
        const block = extractBlock(raw, i);
        result += block;
        i += block.length;
    }
    return result;
}
function extractBlock(source, start) {
    if (source[start] !== '{')
        return '';
    let depth = 0;
    let i = start;
    while (i < source.length) {
        if (source[i] === '{')
            depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0)
                return source.slice(start, i + 1);
        }
        i++;
    }
    return source.slice(start);
}
/**
 * Transform `css\`...\`` into pre-computed scope + injection code.
 */
function transformCSS(source) {
    // Match: css`...` (handles backtick template strings)
    const cssTagRe = /\bcss\s*`([^`]*)`/g;
    return source.replace(cssTagRe, (_match, rawCSS) => {
        const scopeClass = nextScopeId();
        const scopedCSS = scopeCSS(rawCSS, scopeClass);
        const escapedCSS = JSON.stringify(scopedCSS);
        const escapedId = JSON.stringify(`style-${scopeClass}`);
        // Replace with pre-computed result — injects style on first call
        return `(()=>{` +
            `if(typeof document!=="undefined"&&!document.getElementById(${escapedId})){` +
            `const s=document.createElement("style");s.id=${escapedId};s.textContent=${escapedCSS};document.head.appendChild(s);}` +
            `return{scope:${JSON.stringify(scopeClass)},css:${escapedCSS}};` +
            `})()`;
    });
}
export function onefoldPlugin(options) {
    const enableCSS = options?.css !== false;
    const filter = options?.filter ?? /\.(ts|tsx|js|jsx)$/;
    return {
        name: 'onefold-aot',
        setup(build) {
            if (!enableCSS)
                return;
            build.onLoad({ filter }, async (args) => {
                const fs = await import('fs/promises');
                const source = await fs.readFile(args.path, 'utf8');
                // Only process files that actually use css``
                if (!source.includes('css`')) {
                    return undefined;
                }
                const transformed = transformCSS(source);
                if (transformed === source)
                    return undefined;
                return {
                    contents: transformed,
                    loader: args.path.endsWith('.ts') || args.path.endsWith('.tsx') ? 'ts' : 'js',
                };
            });
        },
    };
}
