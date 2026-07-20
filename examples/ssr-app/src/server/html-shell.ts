/** Wraps rendered content in a full HTML document. */
export function htmlShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — onefold SSR</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; }
    a { color: #4338CA; }
  </style>
</head>
<body>
  <div id="app" style="max-width:800px;margin:0 auto;padding:24px">${body}</div>
  <footer style="max-width:800px;margin:40px auto 0;padding:16px 24px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px;text-align:center">
    onefold SSR — zero dependencies
  </footer>
  <script type="module" src="/public/app.js"></script>
</body>
</html>`;
}
