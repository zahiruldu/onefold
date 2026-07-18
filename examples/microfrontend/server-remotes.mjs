/**
 * Remote widgets server — simulates a separate origin/CDN where
 * independent teams deploy their microfrontend bundles.
 *
 * Runs on port 3033 (different origin from the host on 3032).
 * Serves CORS headers so the host can dynamically import() these modules.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = 3033;

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);

  // CORS headers — required for cross-origin dynamic import()
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (urlPath === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h2>Remote Widget Server (port ${PORT})</h2>
      <ul>
        <li><a href="/billing-widget.js">billing-widget.js</a></li>
        <li><a href="/analytics-widget.js">analytics-widget.js</a></li>
      </ul>
    `);
    return;
  }

  try {
    const filePath = path.join(DIST, urlPath);
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`[Remotes] Widget server at http://localhost:${PORT}`);
  console.log(`  → billing-widget.js`);
  console.log(`  → analytics-widget.js`);
});
