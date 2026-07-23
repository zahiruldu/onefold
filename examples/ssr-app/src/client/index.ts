/**
 * Client entry — selective hydration.
 *
 * Only mounts interactive components on pages that need them.
 * Static pages (/, /about, /users) keep their server-rendered HTML untouched.
 *
 * Pattern: check pathname → mount the corresponding component into #interactive.
 */
import { mount, createSignal, html } from 'onefold';

const root = document.getElementById('interactive');
if (!root) {
  // Static page — no interactive container. Do nothing.
} else {
  const path = window.location.pathname;

  if (path === '/counter') {
    mountCounter(root);
  } else if (path === '/todo') {
    mountTodo(root);
  } else if (path === '/search') {
    mountSearch(root);
  }
}

// ─── Counter ───
function mountCounter(container: Element): void {
  const count = createSignal(0);
  mount(html`
    <div style="text-align:center">
      <div style="font-size:48px;font-weight:700;margin-bottom:16px">${() => count()}</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button onclick=${() => count.set(n => n - 1)} style="padding:8px 20px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;font-size:18px">−</button>
        <button onclick=${() => count.set(0)} style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer">Reset</button>
        <button onclick=${() => count.set(n => n + 1)} style="padding:8px 20px;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;font-size:18px">+</button>
      </div>
    </div>
  `, container);
}

// ─── Todo ───
function mountTodo(container: Element): void {
  interface Todo { id: number; text: string; done: boolean; }
  const todos = createSignal<Todo[]>([
    { id: 1, text: 'Learn onefold signals', done: true },
    { id: 2, text: 'Build an SSR app', done: false },
    { id: 3, text: 'Deploy to production', done: false },
  ]);
  const input = createSignal('');

  const add = () => {
    const text = input().trim();
    if (!text) return;
    todos.set(prev => [...prev, { id: Date.now(), text, done: false }]);
    input.set('');
    const el = document.getElementById('todo-input') as HTMLInputElement | null;
    if (el) el.value = '';
  };

  mount(html`
    <div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input id="todo-input" placeholder="Add a task..."
          oninput=${(e: Event) => input.set((e.target as HTMLInputElement).value)}
          onkeydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') add(); }}
          style="flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px" />
        <button onclick=${add} style="padding:8px 14px;background:#4338CA;color:white;border:none;border-radius:6px;cursor:pointer">Add</button>
      </div>
      <p style="color:#64748b;font-size:13px;margin-bottom:8px">${() => todos().filter(t => !t.done).length} remaining</p>
      <ul style="list-style:none;padding:0">
        ${() => todos().map(t => html`
          <li style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0">
            <input type="checkbox" checked=${t.done} onchange=${() => todos.set(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} />
            <span style=${t.done ? 'text-decoration:line-through;color:#94a3b8;flex:1' : 'flex:1'}>${t.text}</span>
            <button onclick=${() => todos.set(prev => prev.filter(x => x.id !== t.id))} style="color:#ef4444;border:none;background:none;cursor:pointer">✕</button>
          </li>
        `)}
      </ul>
    </div>
  `, container);
}

// ─── Search ───
function mountSearch(container: Element): void {
  const query = createSignal('');
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon', 'Mango', 'Nectarine', 'Orange', 'Papaya'];

  mount(html`
    <div>
      <input placeholder="Type to filter fruits..."
        value=${() => query()}
        oninput=${(e: Event) => query.set((e.target as HTMLInputElement).value)}
        style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:12px" />
      <p style="color:#64748b;font-size:13px;margin-bottom:8px">${() => {
        const filtered = fruits.filter(f => f.toLowerCase().includes(query().toLowerCase()));
        return filtered.length + ' results';
      }}</p>
      <ul style="list-style:none;padding:0">
        ${() => fruits
          .filter(f => f.toLowerCase().includes(query().toLowerCase()))
          .map(f => html`<li style="padding:6px 0;border-bottom:1px solid #f5f5f5">${f}</li>`)
        }
      </ul>
    </div>
  `, container);
}
