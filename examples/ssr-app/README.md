# onefold SSR Example

Server-side rendering with onefold — zero jsdom, zero dependencies.

## Quick Start

```bash
npm install
npm run build
npm start
# → http://localhost:3000
```

## Architecture

```
src/
  shared/         Components shared between server + client (zero duplication)
  pages/          Page components (rendered by server, referenced by client)
  server/         Server entry, routes, data layer, HTML shell
  client/         Client entry — selective hydration for interactive pages
```

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page — pure HTML, no JS |
| `/about` | Static | Info page — pure HTML, no JS |
| `/users` | Static + Data | Server fetches users, renders HTML |
| `/counter` | Interactive | Server renders shell, client mounts counter |
| `/todo` | Interactive | Server renders shell, client mounts todo list |
| `/search` | Interactive | Server renders shell, client mounts filter |

## Build Output

After `npm run build`:

```
dist/
  server.mjs        ← Node.js server (run with: node dist/server.mjs)
  public/
    app.js           ← Client bundle (loaded by browser)
```

Deploy `dist/` to any Node.js host. Set `PORT` env var to configure.

## Deploy

```bash
npm run build
PORT=8080 node dist/server.mjs
```
