import { createSignal, html, css, Link } from 'onefold';
import type { RouteParams } from 'onefold';

/**
 * This page demonstrates component-scoped styling in onefold using the `css` tagged template.
 *
 * Each component defines its own styles inline. The `css` utility:
 * 1. Generates a unique scope class (e.g. `nf-0`, `nf-1`)
 * 2. Prefixes all selectors so they're scoped to that component
 * 3. Injects a <style> into <head> (deduplicated)
 * 4. Returns { scope } — attach it to your root element
 */

// ─── Page-level scoped styles ─────────────────────────────────────────────
const page = css`
  .header { margin-bottom: 32px; }
  .header h1 { font-size: 28px; margin-bottom: 8px; }
  .intro { color: #6b7280; font-size: 15px; line-height: 1.6; }
  .intro code {
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
  }
  .demos { display: flex; flex-direction: column; gap: 20px; }
`;

export function StylingPage(_params: RouteParams): Node {
  return html`
    <div class=${page.scope}>
      <div class="header">
        <h1>Component-Scoped Styling</h1>
        <p class="intro">
          Each component defines its styles with <code>css\`...\`</code>. Styles are automatically
          scoped — they never leak to other components. No global CSS file needed.
        </p>
      </div>

      <div class="demos">
        ${CounterCard()}
        ${ThemeSwitcher()}
        ${TextFormatter()}
        ${StyleObjectDemo()}
        ${BadgeShowcase()}
        ${CodeExample()}
      </div>

      <div style=${{ marginTop: '32px' }}>
        ${Link('/', '← Back to Home', 'btn')}
      </div>
    </div>
  `;
}

// ─── Demo 1: Counter Card ─────────────────────────────────────────────────
const counterStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .count { font-size: 48px; font-weight: 700; margin: 8px 0; }
  .row { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
  button {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }
  button:hover { border-color: #4f46e5; color: #4f46e5; }
`;

function CounterCard(): Node {
  const count = createSignal(0);

  return html`
    <div class=${counterStyles.scope}>
      <div class="card">
        <h2>1. Scoped Counter</h2>
        <p class="desc">Styles defined with <code>css\`...\`</code> — the button styles here won't affect buttons elsewhere.</p>
        <div class="count">${() => String(count())}</div>
        <div class="row">
          <button onclick=${() => count.set((c) => c - 1)}>−</button>
          <button onclick=${() => count.set(0)}>Reset</button>
          <button onclick=${() => count.set((c) => c + 1)}>+</button>
        </div>
      </div>
    </div>
  `;
}

// ─── Demo 2: Theme Switcher ───────────────────────────────────────────────
const themeStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .preview {
    padding: 20px;
    border-radius: 10px;
    border: 2px solid transparent;
    margin-bottom: 12px;
    transition: all 0.3s;
  }
  .preview p { margin: 4px 0; font-size: 14px; }
  .label { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  button {
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
  }
  button:hover { border-color: #4f46e5; color: #4f46e5; }
`;

const THEMES = [
  { name: 'Indigo', border: '#6366f1', bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
  { name: 'Emerald', border: '#10b981', bg: 'rgba(16,185,129,0.08)', color: '#10b981' },
  { name: 'Amber', border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' },
  { name: 'Rose', border: '#f43f5e', bg: 'rgba(244,63,94,0.08)', color: '#f43f5e' },
] as const;

function ThemeSwitcher(): Node {
  const idx = createSignal(0);
  const theme = () => THEMES[idx()% THEMES.length]!;
  const next = () => idx.set((i) => (i + 1) % THEMES.length);

  return html`
    <div class=${themeStyles.scope}>
      <div class="card">
        <h2>2. Dynamic Styles (Reactive)</h2>
        <p class="desc">Use <code>style=\${() => ({...})}</code> for reactive inline styles driven by signals.</p>
        <div class="preview" style=${() => ({
          borderColor: theme().border,
          backgroundColor: theme().bg,
        })}>
          <p class="label" style=${() => ({ color: theme().color })}>${() => theme().name}</p>
          <p>Border and background react to signal changes</p>
        </div>
        <button onclick=${next}>Next Theme</button>
      </div>
    </div>
  `;
}

// ─── Demo 3: Text Formatter ───────────────────────────────────────────────
const textStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .sample {
    font-size: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    margin-bottom: 12px;
    transition: all 0.2s;
    min-height: 48px;
  }
  .bold { font-weight: 700; }
  .italic { font-style: italic; }
  .underline { text-decoration: underline; }
  .highlight { background: #fef08a; }
  .toggles { display: flex; gap: 16px; flex-wrap: wrap; }
  .toggles label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
`;

function TextFormatter(): Node {
  const bold = createSignal(false);
  const italic = createSignal(false);
  const underline = createSignal(false);
  const highlight = createSignal(false);

  return html`
    <div class=${textStyles.scope}>
      <div class="card">
        <h2>3. Class Object Map</h2>
        <p class="desc">Pass an object to <code>class</code> — keys are class names, values are booleans.</p>
        <p class=${() => ({
          sample: true,
          bold: bold(),
          italic: italic(),
          underline: underline(),
          highlight: highlight(),
        })}>The quick brown fox jumps over the lazy dog</p>
        <div class="toggles">
          <label><input type="checkbox" onchange=${() => bold.set((v) => !v)} /> Bold</label>
          <label><input type="checkbox" onchange=${() => italic.set((v) => !v)} /> Italic</label>
          <label><input type="checkbox" onchange=${() => underline.set((v) => !v)} /> Underline</label>
          <label><input type="checkbox" onchange=${() => highlight.set((v) => !v)} /> Highlight</label>
        </div>
      </div>
    </div>
  `;
}

// ─── Demo 4: Style Object with Sliders ────────────────────────────────────
const sliderStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 140px;
    margin-bottom: 16px;
  }
  .sliders { display: flex; flex-direction: column; gap: 10px; }
  .sliders label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6b7280; }
  .sliders input[type="range"] { flex: 1; cursor: pointer; }
`;

function StyleObjectDemo(): Node {
  const size = createSignal(48);
  const rotation = createSignal(0);
  const hue = createSignal(250);

  return html`
    <div class=${sliderStyles.scope}>
      <div class="card">
        <h2>4. Reactive Inline Style Object</h2>
        <p class="desc">Style as a JS object with camelCase keys. Wrap in a function for reactivity.</p>
        <div class="area">
          <div style=${() => ({
            width: `${size()}px`,
            height: `${size()}px`,
            transform: `rotate(${rotation()}deg)`,
            backgroundColor: `hsl(${hue()}, 70%, 60%)`,
            borderRadius: `${Math.min(size() / 4, 20)}px`,
            transition: 'all 0.15s ease',
          })}></div>
        </div>
        <div class="sliders">
          <label>Size: ${() => `${size()}px`}
            <input type="range" min="24" max="120" value="48"
              oninput=${(e: Event) => size.set(Number((e.target as HTMLInputElement).value))} />
          </label>
          <label>Rotation: ${() => `${rotation()}°`}
            <input type="range" min="0" max="360" value="0"
              oninput=${(e: Event) => rotation.set(Number((e.target as HTMLInputElement).value))} />
          </label>
          <label>Hue: ${() => String(hue())}
            <input type="range" min="0" max="360" value="250"
              oninput=${(e: Event) => hue.set(Number((e.target as HTMLInputElement).value))} />
          </label>
        </div>
      </div>
    </div>
  `;
}

// ─── Demo 5: Badges (Reusable styled component) ───────────────────────────
const badgeStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 8px; }
  .desc { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: white;
  }
`;

function Badge(label: string, color: string): Node {
  return html`<span class="badge" style=${{ backgroundColor: color }}>${label}</span>`;
}

function BadgeShowcase(): Node {
  return html`
    <div class=${badgeStyles.scope}>
      <div class="card">
        <h2>5. Reusable Styled Components</h2>
        <p class="desc">Define styles once, use the component anywhere. The .badge class is scoped — won't leak.</p>
        <div class="row">
          ${Badge('Success', '#22c55e')}
          ${Badge('Warning', '#eab308')}
          ${Badge('Error', '#ef4444')}
          ${Badge('Info', '#3b82f6')}
          ${Badge('Neutral', '#6b7280')}
        </div>
      </div>
    </div>
  `;
}

// ─── Demo 6: Code example showing the API ─────────────────────────────────
const codeStyles = css`
  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
  }
  h2 { font-size: 18px; margin: 0 0 12px; }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
    line-height: 1.5;
  }
  .summary {
    margin-top: 16px;
    font-size: 14px;
    color: #374151;
    line-height: 1.7;
  }
  .summary strong { color: #1f2937; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; }
  code {
    background: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', Menlo, monospace;
  }
`;

function CodeExample(): Node {
  return html`
    <div class=${codeStyles.scope}>
      <div class="card">
        <h2>How It Works</h2>
        <pre>import { css, html } from 'onefold';

// Define scoped styles for a component
const styles = css\`
  .card { background: white; padding: 16px; }
  .title { font-size: 20px; color: #333; }
  button { padding: 8px; border-radius: 4px; }
\`;

function MyCard() {
  return html\`
    &lt;div class=\${styles.scope}&gt;
      &lt;h2 class="title"&gt;Scoped!&lt;/h2&gt;
      &lt;div class="card"&gt;...&lt;/div&gt;
    &lt;/div&gt;
  \`;
}</pre>
        <div class="summary">
          <table>
            <thead><tr><th>Feature</th><th>Syntax</th></tr></thead>
            <tbody>
              <tr><td>Scoped CSS</td><td><code>css\`...\`</code> → attach <code>styles.scope</code> to root</td></tr>
              <tr><td>Static class</td><td><code>class="foo"</code></td></tr>
              <tr><td>Reactive class</td><td><code>class=\${() => expr}</code></td></tr>
              <tr><td>Class map</td><td><code>class=\${() => ({ active: bool })}</code></td></tr>
              <tr><td>Static style</td><td><code>style=\${{ color: 'red' }}</code></td></tr>
              <tr><td>Reactive style</td><td><code>style=\${() => ({ ... })}</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
