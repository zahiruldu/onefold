// src/server/index.ts
import express from "express";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// src/server/routes.ts
import { Router } from "express";
import { renderHTML } from "onefold";

// src/server/html-shell.ts
function htmlShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} \u2014 onefold SSR</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; }
    a { color: #4338CA; }
  </style>
</head>
<body>
  <div id="app" style="max-width:800px;margin:0 auto;padding:24px">${body}</div>
  <footer style="max-width:800px;margin:40px auto 0;padding:16px 24px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px;text-align:center">
    onefold SSR \u2014 zero dependencies
  </footer>
  <script type="module" src="/public/app.js"></script>
</body>
</html>`;
}

// src/server/data.ts
var USERS = [
  { id: 1, name: "Alice Johnson", role: "Admin", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", role: "Developer", email: "bob@example.com" },
  { id: 3, name: "Charlie Brown", role: "Designer", email: "charlie@example.com" },
  { id: 4, name: "Diana Prince", role: "PM", email: "diana@example.com" },
  { id: 5, name: "Eve Wilson", role: "DevOps", email: "eve@example.com" }
];
async function getUsers() {
  await new Promise((r) => setTimeout(r, 20));
  return USERS;
}

// src/pages/HomePage.ts
import { html as html3 } from "onefold";

// src/shared/layouts/PageLayout.ts
import { html as html2 } from "onefold";

// src/shared/components/Nav.ts
import { html } from "onefold";
var LINKS = [
  ["/", "Home"],
  ["/about", "About"],
  ["/users", "Users"],
  ["/counter", "Counter"],
  ["/todo", "Todo"],
  ["/search", "Search"]
];
function Nav(activePath) {
  return html`
    <nav style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #e5e7eb;margin-bottom:24px;flex-wrap:wrap">
      ${LINKS.map(([href, label]) => html`
        <a href=${href} style=${`color:#4338CA;text-decoration:none;font-weight:${activePath === href ? "700" : "400"}`}>${label}</a>
      `)}
    </nav>
  `;
}

// src/shared/layouts/PageLayout.ts
function PageLayout(activePath, content) {
  return html2`
    <div>
      ${Nav(activePath)}
      ${content}
    </div>
  `;
}

// src/pages/HomePage.ts
function HomePage() {
  return PageLayout("/", html3`
    <div>
      <h1>onefold SSR</h1>
      <p style="color:#64748b;margin-bottom:20px">Server-rendered with zero dependencies. View page source to see full HTML.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="margin-bottom:8px">Static Pages</h3>
          <p style="color:#64748b;font-size:14px">Home, About, Users — rendered on server. Zero client JavaScript.</p>
        </div>
        <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
          <h3 style="margin-bottom:8px">Interactive Pages</h3>
          <p style="color:#64748b;font-size:14px">Counter, Todo, Search — server renders shell, client mounts live components.</p>
        </div>
      </div>
    </div>
  `);
}

// src/pages/AboutPage.ts
import { html as html4 } from "onefold";
function AboutPage() {
  return PageLayout("/about", html4`
    <div>
      <h1>About</h1>
      <p style="color:#64748b;margin-bottom:16px">Static page — no JavaScript required.</p>
      <div style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
        <h3 style="margin-bottom:8px">Architecture</h3>
        <p style="color:#64748b;font-size:14px">The html template tokenizes strings. renderHTML() converts tokens to HTML — no jsdom, no DOM simulation. ~0.5ms per page.</p>
      </div>
    </div>
  `);
}

// src/pages/UsersPage.ts
import { html as html5 } from "onefold";
function UsersPage(users) {
  return PageLayout("/users", html5`
    <div>
      <h1>Users <span style="background:#4338CA;color:white;padding:2px 8px;border-radius:10px;font-size:12px">${String(users.length)}</span></h1>
      <p style="color:#64748b;margin-bottom:16px">Server-fetched data rendered to HTML before sending to browser.</p>
      <ul style="list-style:none;padding:0">
        ${users.map((u) => html5`
          <li style="padding:12px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>${u.name}</strong>
              <div style="color:#64748b;font-size:13px">${u.email}</div>
            </div>
            <span style="background:#4338CA;color:white;padding:2px 8px;border-radius:10px;font-size:12px">${u.role}</span>
          </li>
        `)}
      </ul>
    </div>
  `);
}

// src/pages/CounterPage.ts
import { html as html6 } from "onefold";
function CounterPage() {
  return PageLayout("/counter", html6`
    <div>
      <h1>Counter</h1>
      <p style="color:#64748b;margin-bottom:16px">Interactive — buttons work after JavaScript loads.</p>
      <div id="interactive" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;min-height:120px;display:flex;align-items:center;justify-content:center">
        <p style="color:#94a3b8">Loading...</p>
      </div>
    </div>
  `);
}

// src/pages/TodoPage.ts
import { html as html7 } from "onefold";
function TodoPage() {
  return PageLayout("/todo", html7`
    <div>
      <h1>Todo List</h1>
      <p style="color:#64748b;margin-bottom:16px">Interactive — add, check, and remove tasks.</p>
      <div id="interactive" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;min-height:200px">
        <p style="color:#94a3b8">Loading...</p>
      </div>
    </div>
  `);
}

// src/pages/SearchPage.ts
import { html as html8 } from "onefold";
function SearchPage() {
  return PageLayout("/search", html8`
    <div>
      <h1>Live Search</h1>
      <p style="color:#64748b;margin-bottom:16px">Interactive — type to filter in real-time.</p>
      <div id="interactive" style="background:#f8f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;min-height:200px">
        <p style="color:#94a3b8">Loading...</p>
      </div>
    </div>
  `);
}

// src/server/routes.ts
var router = Router();
router.get("/", (_req, res) => {
  res.send(htmlShell("Home", renderHTML(() => HomePage())));
});
router.get("/about", (_req, res) => {
  res.send(htmlShell("About", renderHTML(() => AboutPage())));
});
router.get("/users", async (_req, res) => {
  const users = await getUsers();
  const body = await renderHTML(async () => UsersPage(users));
  res.send(htmlShell("Users", body));
});
router.get("/counter", (_req, res) => {
  res.send(htmlShell("Counter", renderHTML(() => CounterPage())));
});
router.get("/todo", (_req, res) => {
  res.send(htmlShell("Todo", renderHTML(() => TodoPage())));
});
router.get("/search", (_req, res) => {
  res.send(htmlShell("Search", renderHTML(() => SearchPage())));
});

// src/server/index.ts
import { renderHTML as renderHTML2 } from "onefold";

// src/pages/NotFoundPage.ts
import { html as html9 } from "onefold";
function NotFoundPage() {
  return PageLayout("", html9`
    <div style="text-align:center;padding:60px 0">
      <h1 style="font-size:64px;color:#e5e7eb">404</h1>
      <p style="color:#64748b;margin-bottom:16px">Page not found</p>
      <a href="/" style="color:#4338CA">Go home</a>
    </div>
  `);
}

// src/server/index.ts
var __dirname = dirname(fileURLToPath(import.meta.url));
var app = express();
app.use("/public", express.static(join(__dirname, "public")));
app.use(router);
app.use((_req, res) => {
  res.status(404).send(htmlShell("404", renderHTML2(() => NotFoundPage())));
});
var PORT = Number(process.env.PORT) || 3e3;
app.listen(PORT, () => {
  console.log(`
  onefold SSR`);
  console.log(`  http://localhost:${PORT}
`);
  console.log(`  Static:      /  /about  /users`);
  console.log(`  Interactive: /counter  /todo  /search
`);
});
