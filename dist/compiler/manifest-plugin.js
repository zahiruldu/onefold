/// <reference types="node" />
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
/**
 * esbuild plugin that generates a machine-readable app manifest.
 */
export function manifestPlugin(options) {
    const outDir = options?.outDir ?? '.onefold';
    const includePaths = options?.includePaths !== false;
    const manifest = {
        version: '1.0',
        framework: 'onefold',
        generatedAt: '',
        components: [],
        routes: [],
        state: [],
        api: [],
    };
    return {
        name: 'onefold-manifest',
        setup(build) {
            const sources = new Map();
            build.onLoad({ filter: /\.(ts|tsx|js|jsx)$/ }, async (args) => {
                const fs = await import('fs/promises');
                const source = await fs.readFile(args.path, 'utf8');
                sources.set(args.path, source);
                return undefined; // Don't modify, just collect
            });
            build.onEnd(async () => {
                manifest.generatedAt = new Date().toISOString();
                manifest.components = [];
                manifest.routes = [];
                manifest.state = [];
                manifest.api = [];
                for (const [filePath, source] of sources) {
                    const relPath = includePaths ? filePath : '';
                    // Scan for component() registrations
                    const compRegex = /component\(\s*\{([^}]*name:\s*['"]([^'"]+)['"][^}]*)}/g;
                    let match;
                    while ((match = compRegex.exec(source)) !== null) {
                        const block = match[1] ?? '';
                        const name = match[2] ?? 'Unknown';
                        const descMatch = /description:\s*['"]([^'"]+)['"]/.exec(block);
                        const tagsMatch = /tags:\s*\[([^\]]*)]/.exec(block);
                        const eventsMatch = /events:\s*\[([^\]]*)]/.exec(block);
                        manifest.components.push({
                            name,
                            file: relPath,
                            description: descMatch?.[1],
                            events: eventsMatch?.[1]?.split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean),
                            tags: tagsMatch?.[1]?.split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean),
                        });
                    }
                    // Scan for Router definitions with paths
                    const routeRegex = /path:\s*['"]([^'"]+)['"]/g;
                    while ((match = routeRegex.exec(source)) !== null) {
                        const path = match[1] ?? '';
                        if (path.startsWith('/')) {
                            // Check for guard
                            const guardMatch = /guard\(\s*\[([^\]]*)]/.exec(source.slice(Math.max(0, match.index - 200), match.index + 200));
                            manifest.routes.push({
                                path,
                                guard: guardMatch?.[1]?.split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean),
                            });
                        }
                    }
                    // Scan for state (createSignal, createStore, createPersisted exports)
                    const stateRegex = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(createSignal|createStore|createPersisted)/g;
                    while ((match = stateRegex.exec(source)) !== null) {
                        const name = match[1] ?? '';
                        const type = match[2] === 'createStore' ? 'store'
                            : match[2] === 'createPersisted' ? 'persisted'
                                : 'signal';
                        manifest.state.push({ name, file: relPath, type: type });
                    }
                    // Scan for API endpoints (http.get/post/put/delete calls)
                    const apiRegex = /(?:http|client)\.(get|post|put|patch|delete)\s*[<(]\s*['"]([^'"]+)['"]/g;
                    while ((match = apiRegex.exec(source)) !== null) {
                        manifest.api.push({ endpoint: match[2] ?? '', file: relPath });
                    }
                }
                // Deduplicate routes
                manifest.routes = [...new Map(manifest.routes.map((r) => [r.path, r])).values()];
                // Write manifest
                const fs = await import('fs/promises');
                const path = await import('path');
                const dir = path.resolve(outDir);
                await fs.mkdir(dir, { recursive: true });
                await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
            });
        },
    };
}
