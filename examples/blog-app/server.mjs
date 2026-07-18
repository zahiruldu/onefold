// SPA-aware static server for the blog app.
// All routes that don't match a real file fall back to index.html (History API support).
// Run with: node examples/blog-app/server.mjs
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 3031;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
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

    // SPA fallback: if the file doesn't exist and has no extension, serve index.html
    if (!info && !path.extname(filePath)) {
      filePath = path.join(ROOT, 'index.html');
    } else if (info?.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    // Final fallback to index.html for SPA routing
    try {
      const data = await readFile(path.join(ROOT, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Blog app running at http://localhost:${PORT}`);
  console.log(`  Routes: /, /about, /styling, /posts/:id`);
});
