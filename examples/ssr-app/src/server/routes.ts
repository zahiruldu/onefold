import { Router } from 'express';
import { renderHTML } from 'onefold/ssr';
import { htmlShell } from './html-shell';
import { getUsers } from './data';
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { UsersPage } from '../pages/UsersPage';
import { CounterPage } from '../pages/CounterPage';
import { TodoPage } from '../pages/TodoPage';
import { SearchPage } from '../pages/SearchPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const router = Router();

// Static pages (SSR only — no client JS needed)
router.get('/', (_req, res) => {
  res.send(htmlShell('Home', renderHTML(() => HomePage()) as string));
});

router.get('/about', (_req, res) => {
  res.send(htmlShell('About', renderHTML(() => AboutPage()) as string));
});

router.get('/users', async (_req, res) => {
  const users = await getUsers();
  const body = await renderHTML(async () => UsersPage(users));
  res.send(htmlShell('Users', body as string));
});

// Interactive pages (SSR shell + client hydration)
router.get('/counter', (_req, res) => {
  res.send(htmlShell('Counter', renderHTML(() => CounterPage()) as string));
});

router.get('/todo', (_req, res) => {
  res.send(htmlShell('Todo', renderHTML(() => TodoPage()) as string));
});

router.get('/search', (_req, res) => {
  res.send(htmlShell('Search', renderHTML(() => SearchPage()) as string));
});

export { router };
