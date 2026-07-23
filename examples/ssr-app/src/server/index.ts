import express from 'express';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from './routes';
import { renderHTML } from 'onefold';
import { htmlShell } from './html-shell';
import { NotFoundPage } from '../pages/NotFoundPage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Static assets
app.use('/public', express.static(join(__dirname, 'public')));

// Routes
app.use(router);

// 404
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).send(htmlShell('404', renderHTML(() => NotFoundPage()) as string));
});

// Start
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`\n  onefold SSR`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  Static:      /  /about  /users`);
  console.log(`  Interactive: /counter  /todo  /search\n`);
});
