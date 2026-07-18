/**
 * Microfrontend demo server.
 *
 * Serves the host shell and remote widgets from the same origin for demo purposes.
 * In production, each remote would be on its own domain/CDN.
 *
 * Run with: node examples/microfrontend/server.mjs
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 3032;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const info = await stat(filePath).catch(() => null);
    if (!info) {
      // SPA fallback
      filePath = path.join(ROOT, 'index.html');
    } else if (info.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath);

    // Add CORS headers so remotes could theoretically be on different origins
    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Microfrontend demo running at http://localhost:${PORT}`);
  console.log(`  Host shell:        /`);
  console.log(`  Billing widget:    /dist/billing-widget.js`);
  console.log(`  Analytics widget:  /dist/analytics-widget.js`);
});
