# Todo App — Complete Example

A full-featured todo application built with onefold demonstrating signals, computed values, persisted state, conditional rendering, list rendering, and event handling.

Framework: onefold
Language: TypeScript
Source: https://onefoldjs.com/examples/todo.md

---

## Project Structure

```
todo-app/
├── index.html
├── style.css
├── dev.mjs
├── build.mjs
├── preview.mjs
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts
    ├── types.ts
    ├── state/
    │   └── todos.ts
    └── components/
        ├── TodoInput.ts
        ├── TodoItem.ts
        ├── TodoList.ts
        ├── TodoFilter.ts
        └── TodoStats.ts
```

---

## package.json

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node dev.mjs",
    "build": "node build.mjs",
    "preview": "node preview.mjs"
  },
  "dependencies": {
    "onefold": "latest"
  },
  "devDependencies": {
    "esbuild": "^0.28.0",
    "typescript": "^5.5.0"
  }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Todo App — onefold</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/app.js"></script>
</body>
</html>
```

---

## src/types.ts

```ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type FilterMode = 'all' | 'active' | 'completed';
```

---

## src/state/todos.ts

```ts
import { createSignal, createComputed, createPersisted } from 'onefold';
import type { Todo, FilterMode } from '../types';

export const todos = createPersisted<Todo[]>('todos', []);
export const filter = createSignal<FilterMode>('all');

export const filteredTodos = createComputed(() => {
  const items = todos();
  const mode = filter();
  switch (mode) {
    case 'active': return items.filter(t => !t.completed);
    case 'completed': return items.filter(t => t.completed);
    default: return items;
  }
});

export const totalCount = createComputed(() => todos().length);
export const activeCount = createComputed(() => todos().filter(t => !t.completed).length);
export const completedCount = createComputed(() => todos().filter(t => t.completed).length);
export const allCompleted = createComputed(() => todos().length > 0 && activeCount() === 0);

export function addTodo(text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.set(prev => [...prev, {
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  }]);
}

export function toggleTodo(id: string): void {
  todos.set(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
}

export function removeTodo(id: string): void {
  todos.set(prev => prev.filter(t => t.id !== id));
}

export function editTodo(id: string, newText: string): void {
  const trimmed = newText.trim();
  if (!trimmed) { removeTodo(id); return; }
  todos.set(prev => prev.map(t => t.id === id ? { ...t, text: trimmed } : t));
}

export function toggleAll(): void {
  const allDone = allCompleted();
  todos.set(prev => prev.map(t => ({ ...t, completed: !allDone })));
}

export function clearCompleted(): void {
  todos.set(prev => prev.filter(t => !t.completed));
}
```

---

## src/components/TodoInput.ts

```ts
import { createSignal, html } from 'onefold';
import { addTodo } from '../state/todos';

export function TodoInput(): Node {
  const input = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    addTodo(input());
    input.set('');
  };

  return html`
    <form class="todo-input" onsubmit=${handleSubmit}>
      <input type="text" placeholder="What needs to be done?" value=${() => input()} oninput=${(e: Event) => input.set((e.target as HTMLInputElement).value)} />
      <button type="submit" disabled=${() => !input().trim()}>Add</button>
    </form>
  `;
}
```

---

## src/components/TodoItem.ts

```ts
import { createSignal, html } from 'onefold';
import { toggleTodo, removeTodo, editTodo } from '../state/todos';
import type { Todo } from '../types';

export function TodoItem(todo: Todo): Node {
  const editing = createSignal(false);
  const editText = createSignal(todo.text);

  const startEdit = () => { editText.set(todo.text); editing.set(true); };
  const commitEdit = () => { editTodo(todo.id, editText()); editing.set(false); };
  const cancelEdit = () => { editing.set(false); };
  const handleEditKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return html`
    <li class=${() => 'todo-item' + (todo.completed ? ' completed' : '')}>
      <input type="checkbox" class="todo-checkbox" checked=${todo.completed} onchange=${() => toggleTodo(todo.id)} />
      ${() => editing()
        ? html`<input class="todo-edit" type="text" value=${() => editText()} oninput=${(e: Event) => editText.set((e.target as HTMLInputElement).value)} onblur=${commitEdit} onkeydown=${handleEditKeydown} ref=${(el: HTMLInputElement) => requestAnimationFrame(() => el.focus())} />`
        : html`<span class="todo-text" ondblclick=${startEdit}>${todo.text}</span>`
      }
      <button class="todo-delete" onclick=${() => removeTodo(todo.id)}>✕</button>
    </li>
  `;
}
```

---

## src/components/TodoList.ts

```ts
import { html } from 'onefold';
import { filteredTodos, toggleAll, allCompleted, totalCount } from '../state/todos';
import { TodoItem } from './TodoItem';

export function TodoList(): Node {
  return html`
    <div>
      ${() => totalCount() > 0
        ? html`
            <label class="toggle-all">
              <input type="checkbox" checked=${() => allCompleted()} onchange=${toggleAll} />
              Mark all as complete
            </label>
            <ul class="todo-list">
              ${() => filteredTodos().map(todo => TodoItem(todo))}
            </ul>
          `
        : html`<div class="empty-state">No todos yet. Add one above!</div>`
      }
    </div>
  `;
}
```

---

## src/components/TodoFilter.ts

```ts
import { html } from 'onefold';
import { filter } from '../state/todos';
import type { FilterMode } from '../types';

export function TodoFilter(): Node {
  const setFilter = (mode: FilterMode) => () => filter.set(mode);
  const btnClass = (mode: FilterMode) => () => 'filter-btn' + (filter() === mode ? ' active' : '');

  return html`
    <div class="todo-filter">
      <button class=${btnClass('all')} onclick=${setFilter('all')}>All</button>
      <button class=${btnClass('active')} onclick=${setFilter('active')}>Active</button>
      <button class=${btnClass('completed')} onclick=${setFilter('completed')}>Completed</button>
    </div>
  `;
}
```

---

## src/components/TodoStats.ts

```ts
import { html } from 'onefold';
import { activeCount, completedCount, clearCompleted } from '../state/todos';

export function TodoStats(): Node {
  return html`
    <div class="todo-stats">
      <span>${() => activeCount()} ${() => activeCount() === 1 ? 'item' : 'items'} left</span>
      ${() => completedCount() > 0
        ? html`<button class="clear-btn" onclick=${clearCompleted}>Clear completed (${() => completedCount()})</button>`
        : html`<span></span>`
      }
    </div>
  `;
}
```

---

## src/main.ts

```ts
import { html, mount } from 'onefold';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoStats } from './components/TodoStats';

function App(): Node {
  return html`
    <div class="todo-app">
      <h1>Todos</h1>
      ${TodoInput()}
      ${TodoFilter()}
      ${TodoList()}
      ${TodoStats()}
    </div>
  `;
}

mount(App(), document.getElementById('app')!);
```

---

## style.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f1f5f9;
  min-height: 100vh;
  color: #1e293b;
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

#app {
  width: 100%;
  max-width: 520px;
}

.todo-app {
  background: white;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.todo-app h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 28px;
}

.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  font-size: 15px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
}

.todo-input input[type="text"]:focus {
  border-color: #3b82f6;
}

.todo-input button {
  padding: 12px 22px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.todo-input button:hover {
  background: #2563eb;
}

.todo-input button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.todo-filter {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 7px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toggle-all {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
}

.toggle-all input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 8px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.1s;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #f8fafc;
  border-radius: 8px;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #94a3b8;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.todo-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.4;
}

.todo-edit {
  flex: 1;
  font-size: 15px;
  padding: 6px 10px;
  border: 1.5px solid #3b82f6;
  border-radius: 6px;
  outline: none;
}

.todo-delete {
  opacity: 0;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: opacity 0.15s, background 0.15s;
}

.todo-item:hover .todo-delete {
  opacity: 1;
}

.todo-delete:hover {
  background: #fef2f2;
}

.todo-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 4px 0;
  margin-top: 16px;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
}

.clear-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.clear-btn:hover {
  background: #fef2f2;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #cbd5e1;
  font-size: 15px;
}
```

---

## dev.mjs

```js
import { context } from 'esbuild';
import http from 'node:http';
import { readFileSync, existsSync, copyFileSync, watch, mkdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

mkdirSync(resolve(__dirname, 'dist'), { recursive: true });

const ctx = await context({
  entryPoints: [resolve(__dirname, 'src/main.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(__dirname, 'dist/app.js'),
  sourcemap: 'linked',
  target: 'es2022',
  define: { '__DEV__': 'true' },
});
await ctx.watch();

copyFileSync(resolve(__dirname, 'index.html'), resolve(__dirname, 'dist/index.html'));
copyFileSync(resolve(__dirname, 'style.css'), resolve(__dirname, 'dist/style.css'));

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  let url = req.url?.split('?')[0] ?? '/';
  if (url === '/' || !extname(url)) url = '/index.html';

  const distPath = resolve(__dirname, 'dist', url.slice(1));
  const rootPath = resolve(__dirname, url.slice(1));

  let filePath;
  if (existsSync(distPath)) filePath = distPath;
  else if (existsSync(rootPath)) filePath = rootPath;
  else filePath = resolve(__dirname, 'index.html');

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Todo App dev server`);
  console.log(`  Local: http://localhost:${PORT}\n`);
});

watch(resolve(__dirname, 'style.css'), () => {
  copyFileSync(resolve(__dirname, 'style.css'), resolve(__dirname, 'dist/style.css'));
});
```

---

## build.mjs

```js
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, 'dist');
mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [resolve(__dirname, 'src/main.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(outDir, 'app.js'),
  minify: true,
  define: { '__DEV__': 'false' },
  drop: ['debugger'],
});

copyFileSync(resolve(__dirname, 'index.html'), resolve(outDir, 'index.html'));

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8');
const minified = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{};:,])\s*/g, '$1').replace(/\n+/g, '').trim();
writeFileSync(resolve(outDir, 'style.css'), minified);

console.log('Built → dist/');
```

---

## Key Patterns Demonstrated

1. **Signals for state** — `createSignal` for local UI state (input text, editing mode)
2. **Persisted signals** — `createPersisted` keeps todos in localStorage across page refreshes
3. **Computed values** — `createComputed` for filtered list, counts, and allCompleted flag
4. **Immutable updates** — always producing a new reference with `.set(prev => [...prev])`
5. **Reactive closures** — `${() => expr}` in templates for automatic UI updates
6. **Event handling** — `onclick`, `oninput`, `onsubmit`, `onkeydown`, `onblur`
7. **Conditional rendering** — ternary inside `${() => condition ? html`...` : html`...`}`
8. **List rendering** — `.map()` inside a reactive closure
9. **Two-way binding** — `value=${() => signal()} oninput=${handler}` for form inputs
10. **Form handling** — `onsubmit` with `e.preventDefault()`
11. **Refs** — `ref=${(el) => el.focus()}` for imperative DOM access
12. **Global CSS** — plain CSS file with class-based styling (no build tool needed)

---

## How to Run

```bash
npm create onefold@latest todo-app -- --template spa
cd todo-app
# Replace src/ and style.css with the code above
npm install
npm run dev     # → http://localhost:3000
npm run build   # → dist/
npm run preview # → http://localhost:4000 (serves built dist)
```
