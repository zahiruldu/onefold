// ../../dist/core/extend.js
var effectHook = null;
function runWithHook(label, fn) {
  if (effectHook)
    effectHook(label, fn);
  else
    fn();
}
var directives = /* @__PURE__ */ new Map();
function getDirective(name) {
  return directives.get(name);
}

// ../../dist/core/signal.js
var activeEffect = null;
var batchDepth = 0;
var pendingEffects = /* @__PURE__ */ new Set();
var _devUpdateCounter = 0;
var _devUpdateResetTimer = null;
var _DEV_UPDATE_THRESHOLD = 200;
var ReactiveEffect = class {
  constructor(fn, label) {
    this.deps = /* @__PURE__ */ new Set();
    this.active = true;
    this.fn = fn;
    this.label = label;
  }
  run() {
    if (!this.active)
      return;
    this.cleanup();
    const prevEffect = activeEffect;
    activeEffect = this;
    try {
      runWithHook(this.label, this.fn);
    } finally {
      activeEffect = prevEffect;
    }
  }
  cleanup() {
    for (const dep of this.deps)
      dep.subscribers.delete(this);
    this.deps.clear();
  }
  dispose() {
    this.active = false;
    this.cleanup();
  }
};
var SignalImpl = class {
  constructor(value) {
    this.value = value;
    this.subscribers = /* @__PURE__ */ new Set();
  }
  get() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
      activeEffect.deps.add(this);
    }
    return this.value;
  }
  set(next) {
    const newValue = typeof next === "function" ? next(this.value) : next;
    if (Object.is(newValue, this.value))
      return;
    this.value = newValue;
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      _devUpdateCounter++;
      if (!_devUpdateResetTimer) {
        _devUpdateResetTimer = setTimeout(() => {
          _devUpdateCounter = 0;
          _devUpdateResetTimer = null;
        }, 1e3);
      }
      if (_devUpdateCounter > _DEV_UPDATE_THRESHOLD) {
        console.warn(`[onefold] Signal updated ${_devUpdateCounter} times in <1s. Possible infinite loop in an effect.`);
        _devUpdateCounter = 0;
      }
    }
    this.notify();
  }
  peek() {
    return this.value;
  }
  notify() {
    if (batchDepth > 0) {
      for (const e of this.subscribers)
        pendingEffects.add(e);
    } else {
      const subs = Array.from(this.subscribers);
      for (let i = 0; i < subs.length; i++)
        subs[i].run();
    }
  }
};
function createSignal(initial) {
  const impl = new SignalImpl(initial);
  const accessor = (() => impl.get());
  accessor.set = (v) => impl.set(v);
  accessor.peek = () => impl.peek();
  return accessor;
}
function createEffect(fn, label = "effect") {
  let resolvedLabel = label;
  if (typeof __DEV__ !== "undefined" && __DEV__ && label === "effect") {
    try {
      const stack = new Error().stack ?? "";
      const lines = stack.split("\n");
      for (let i = 2; i < lines.length && i < 8; i++) {
        const line = lines[i]?.trim() ?? "";
        if (!line)
          continue;
        if (/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(line))
          continue;
        const fnMatch = line.match(/at\s+([A-Z]\w+)\s+\(/);
        if (fnMatch) {
          const locMatch = line.match(/:(\d+):\d+\)?$/);
          resolvedLabel = locMatch ? `${fnMatch[1]} (:${locMatch[1]})` : fnMatch[1];
          break;
        }
        const locOnly = line.match(/([^/\\:]+):(\d+):\d+\)?$/);
        if (locOnly) {
          resolvedLabel = `${locOnly[1]}:${locOnly[2]}`;
          break;
        }
      }
    } catch {
    }
  }
  const effect = new ReactiveEffect(fn, resolvedLabel);
  effect.run();
  return () => effect.dispose();
}

// ../../dist/security/sanitize.js
var UNSAFE_URL_SCHEME = /^\s*(javascript|data|vbscript):/i;
var EVENT_ATTR_PREFIX = /^on/i;
function isUnsafeUrl(value) {
  return UNSAFE_URL_SCHEME.test(value);
}
function isEventAttribute(name) {
  return EVENT_ATTR_PREFIX.test(name);
}
function minimalSanitize(html2) {
  const template = document.createElement("template");
  template.innerHTML = html2;
  const walk = (node) => {
    const toRemove = [];
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child;
        const tag = el.tagName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object" || tag === "embed" || tag === "form") {
          toRemove.push(child);
          return;
        }
        Array.from(el.attributes).forEach((attr) => {
          if (isEventAttribute(attr.name)) {
            el.removeAttribute(attr.name);
          } else if ((attr.name === "href" || attr.name === "src") && isUnsafeUrl(attr.value)) {
            el.removeAttribute(attr.name);
          }
        });
        walk(el);
      }
    });
    toRemove.forEach((n) => n.remove());
  };
  walk(template.content);
  return template.innerHTML;
}
var trustedPolicy = null;
function getTrustedPolicy() {
  if (trustedPolicy)
    return trustedPolicy;
  if (typeof window !== "undefined" && window.trustedTypes) {
    trustedPolicy = window.trustedTypes.createPolicy("onefold-sanitized", {
      createHTML: (input) => minimalSanitize(input)
    });
  }
  return trustedPolicy;
}
function toTrustedHtml(html2) {
  const policy = getTrustedPolicy();
  return policy ? policy.createHTML(html2) : minimalSanitize(html2);
}
function isRawHtml(value) {
  return typeof value === "object" && value !== null && value.__onefoldRaw === true;
}

// ../../dist/core/lifecycle.js
var disposersByNode = /* @__PURE__ */ new WeakMap();
var observer = null;
function ensureObserver() {
  if (observer || typeof MutationObserver === "undefined" || typeof document === "undefined")
    return;
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.removedNodes.forEach(runDisposersForSubtree);
    }
  });
  const root = document.documentElement ?? document;
  observer.observe(root, { childList: true, subtree: true });
}
function runDisposersForSubtree(node) {
  const disposers = disposersByNode.get(node);
  if (disposers) {
    for (const dispose of disposers) {
      try {
        dispose();
      } catch (err) {
        console.error("[onefold] Error while disposing a reactive binding:", err);
      }
    }
    disposersByNode.delete(node);
  }
  node.childNodes.forEach(runDisposersForSubtree);
}
function disposeOnRemove(node, dispose) {
  ensureObserver();
  let set = disposersByNode.get(node);
  if (!set) {
    set = /* @__PURE__ */ new Set();
    disposersByNode.set(node, set);
  }
  set.add(dispose);
}

// ../../dist/core/template.js
var _ssrInterceptor = null;
var PLACEHOLDER_PREFIX = "\0nf_";
var PLACEHOLDER_RE = /\x00nf_(\d+)\x00/g;
function placeholder(index) {
  return `${PLACEHOLDER_PREFIX}${index}\0`;
}
function charAt(s, i) {
  return s.charAt(i);
}
function captureInt(match) {
  return parseInt(match[1] ?? "0", 10);
}
function tokenize(strings, values) {
  let source = "";
  for (let i = 0; i < strings.length; i++) {
    source += strings[i];
    if (i < values.length) {
      source += placeholder(i);
    }
  }
  const tokens = [];
  let pos = 0;
  const len = source.length;
  while (pos < len) {
    if (charAt(source, pos) === "<") {
      if (source.startsWith("<!--", pos)) {
        const commentEnd = source.indexOf("-->", pos + 4);
        pos = commentEnd === -1 ? len : commentEnd + 3;
        continue;
      }
      if (charAt(source, pos + 1) === "/") {
        const end = source.indexOf(">", pos);
        const tag2 = source.slice(pos + 2, end).trim();
        tokens.push({ kind: 1, tag: tag2 });
        pos = end + 1;
        continue;
      }
      const tagEnd = findTagEnd(source, pos);
      const selfClosing = charAt(source, tagEnd - 1) === "/";
      const inner = source.slice(pos + 1, selfClosing ? tagEnd - 1 : tagEnd);
      const { tag, attrs } = parseOpenTag(inner, values);
      tokens.push({ kind: 0, tag });
      for (const attr of attrs)
        tokens.push(attr);
      if (selfClosing) {
        tokens.push({ kind: 1, tag });
      }
      pos = tagEnd + 1;
      continue;
    }
    const nextTag = source.indexOf("<", pos);
    const text = nextTag === -1 ? source.slice(pos) : source.slice(pos, nextTag);
    pos = nextTag === -1 ? len : nextTag;
    if (text.trim() || PLACEHOLDER_RE.test(text)) {
      PLACEHOLDER_RE.lastIndex = 0;
      let lastIdx = 0;
      let match;
      while ((match = PLACEHOLDER_RE.exec(text)) !== null) {
        const before = text.slice(lastIdx, match.index);
        if (before)
          tokens.push({ kind: 3, value: before });
        tokens.push({ kind: 4, value: values[captureInt(match)] });
        lastIdx = match.index + match[0].length;
      }
      const after = text.slice(lastIdx);
      if (after && after.trim())
        tokens.push({ kind: 3, value: after });
    }
  }
  return tokens;
}
function findTagEnd(source, start) {
  let inQuote = null;
  for (let i = start + 1; i < source.length; i++) {
    const ch = charAt(source, i);
    if (inQuote) {
      if (ch === inQuote)
        inQuote = null;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return source.length - 1;
}
function isWhitespace(ch) {
  return ch === " " || ch === "	" || ch === "\n" || ch === "\r" || ch === "\f";
}
function parseOpenTag(inner, values) {
  const firstSpace = inner.search(/[\s/]/);
  const tag = firstSpace === -1 ? inner : inner.slice(0, firstSpace);
  const attrs = [];
  if (firstSpace === -1)
    return { tag, attrs };
  const rest = inner.slice(firstSpace).trim();
  if (!rest)
    return { tag, attrs };
  let pos = 0;
  const len = rest.length;
  while (pos < len) {
    while (pos < len && isWhitespace(charAt(rest, pos)))
      pos++;
    if (pos >= len)
      break;
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf("\0", pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      const propsObj = values[idx];
      if (propsObj && typeof propsObj === "object") {
        for (const [k, v] of Object.entries(propsObj)) {
          attrs.push({ kind: 2, name: k, value: v });
        }
      }
      pos = endMarker + 1;
      continue;
    }
    const nameStart = pos;
    while (pos < len && charAt(rest, pos) !== "=" && !isWhitespace(charAt(rest, pos)))
      pos++;
    const name = rest.slice(nameStart, pos);
    if (!name) {
      pos++;
      continue;
    }
    while (pos < len && isWhitespace(charAt(rest, pos)))
      pos++;
    if (pos >= len || charAt(rest, pos) !== "=") {
      attrs.push({ kind: 2, name, value: true });
      continue;
    }
    pos++;
    while (pos < len && isWhitespace(charAt(rest, pos)))
      pos++;
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf("\0", pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      attrs.push({ kind: 2, name, value: values[idx] });
      pos = endMarker + 1;
    } else if (charAt(rest, pos) === '"' || charAt(rest, pos) === "'") {
      const quote = charAt(rest, pos);
      pos++;
      const valStart = pos;
      while (pos < len && charAt(rest, pos) !== quote)
        pos++;
      const rawVal = rest.slice(valStart, pos);
      pos++;
      attrs.push({ kind: 2, name, value: resolveAttrValue(rawVal, values) });
    } else {
      const valStart = pos;
      while (pos < len && !isWhitespace(charAt(rest, pos)))
        pos++;
      const rawVal = rest.slice(valStart, pos);
      attrs.push({ kind: 2, name, value: resolveAttrValue(rawVal, values) });
    }
  }
  return { tag, attrs };
}
function resolveAttrValue(rawVal, values) {
  PLACEHOLDER_RE.lastIndex = 0;
  const firstMatch = PLACEHOLDER_RE.exec(rawVal);
  if (!firstMatch)
    return rawVal;
  if (firstMatch.index === 0 && firstMatch[0].length === rawVal.length) {
    return values[captureInt(firstMatch)];
  }
  PLACEHOLDER_RE.lastIndex = 0;
  const parts = [];
  let lastPh = 0;
  let phm;
  while ((phm = PLACEHOLDER_RE.exec(rawVal)) !== null) {
    if (phm.index > lastPh)
      parts.push(rawVal.slice(lastPh, phm.index));
    const val = values[captureInt(phm)];
    parts.push(typeof val === "function" ? val : () => val);
    lastPh = phm.index + phm[0].length;
  }
  if (lastPh < rawVal.length)
    parts.push(rawVal.slice(lastPh));
  return () => parts.map((p) => typeof p === "function" ? p() : p).join("");
}
function buildDom(tokens) {
  const root = document.createDocumentFragment();
  const stack = [root];
  let current = root;
  for (const token of tokens) {
    switch (token.kind) {
      case 0: {
        const el = document.createElement(token.tag);
        current.appendChild(el);
        stack.push(el);
        current = el;
        break;
      }
      case 1: {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          const closedEl = current;
          const tag = closedEl.tagName?.toLowerCase();
          if ((tag === "input" || tag === "textarea") && !closedEl.hasAttribute("value")) {
            const hasInputHandler = closedEl.getAttribute("data-nf-has-input") === "1";
            if (hasInputHandler) {
              console.warn(`[onefold] <${tag}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`, closedEl);
            }
          }
        }
        stack.pop();
        current = stack.length > 0 ? stack[stack.length - 1] : root;
        break;
      }
      case 2: {
        applyAttr(current, token.name, token.value);
        break;
      }
      case 3: {
        current.appendChild(document.createTextNode(token.value));
        break;
      }
      case 4: {
        appendExpr(current, token.value);
        break;
      }
    }
  }
  if (root.childNodes.length === 1 && root.firstChild instanceof HTMLElement) {
    return root.firstChild;
  }
  return root;
}
function applyAttr(el, name, value) {
  if (name === "ref") {
    if (typeof value === "function")
      value(el);
    return;
  }
  if (name === "class") {
    bindReactive(value, (v) => applyClass(el, v), el);
    return;
  }
  if (name === "style") {
    bindReactive(value, (v) => {
      if (typeof v === "string") {
        el.style.cssText = v;
      } else {
        Object.assign(el.style, v ?? {});
      }
    }, el);
    return;
  }
  if (isEventAttribute(name) && typeof value === "function") {
    el.addEventListener(name.slice(2).toLowerCase(), value);
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      const evtName = name.slice(2).toLowerCase();
      if (evtName === "input" || evtName === "change") {
        el.setAttribute("data-nf-has-input", "1");
      }
    }
    return;
  }
  if (name.startsWith("d-")) {
    const directive = getDirective(name.slice(2));
    if (directive) {
      bindReactive(value, (v) => directive(el, v), el);
    } else {
      console.warn(`[onefold] No directive registered for "${name}". Call registerDirective() first.`);
    }
    return;
  }
  bindReactive(value, (v) => setAttr(el, name, v), el);
}
function bindReactive(value, apply, ownerEl) {
  if (typeof value === "function") {
    const dispose = createEffect(() => apply(value()));
    disposeOnRemove(ownerEl, dispose);
  } else {
    apply(value);
  }
}
function applyClass(el, value) {
  if (!value) {
    el.className = "";
  } else if (typeof value === "string") {
    el.className = value;
  } else if (typeof value === "object") {
    el.className = Object.entries(value).filter(([, on]) => on).map(([n]) => n).join(" ");
  }
}
function setAttr(el, key, value) {
  if (value === false || value == null) {
    el.removeAttribute(key);
    return;
  }
  if (value === true) {
    el.setAttribute(key, "");
    return;
  }
  const str = String(value);
  if (isEventAttribute(key)) {
    console.warn(`[onefold] Blocked string event handler "${key}". Use a function instead.`);
    return;
  }
  if ((key === "href" || key === "src" || key === "action" || key === "formaction" || key === "xlink:href") && isUnsafeUrl(str)) {
    console.warn(`[onefold] Blocked unsafe "${key}" value:`, str);
    el.removeAttribute(key);
    return;
  }
  if (key === "value" && "value" in el) {
    el.value = str;
    return;
  }
  if (key === "checked" && el instanceof HTMLInputElement) {
    el.checked = value === true || str === "true" || str === "";
    return;
  }
  if (key === "selected" && el instanceof HTMLOptionElement) {
    el.selected = value === true || str === "true" || str === "";
    return;
  }
  el.setAttribute(key, str);
}
function appendExpr(parent, value) {
  if (value == null || value === false || value === true)
    return;
  if (value instanceof Node) {
    parent.appendChild(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value)
      appendExpr(parent, item);
    return;
  }
  if (typeof value === "function") {
    const startAnchor = document.createComment("expr-start");
    const endAnchor = document.createComment("expr-end");
    parent.appendChild(startAnchor);
    parent.appendChild(endAnchor);
    const dispose = createEffect(() => {
      const result = value();
      const parentEl = startAnchor.parentNode;
      if (!parentEl)
        return;
      let node = startAnchor.nextSibling;
      while (node && node !== endAnchor) {
        const next = node.nextSibling;
        parentEl.removeChild(node);
        node = next;
      }
      const newContent = toNode(result);
      parentEl.insertBefore(newContent, endAnchor);
    });
    disposeOnRemove(parent, dispose);
    return;
  }
  if (isRawHtml(value)) {
    const wrapper = document.createElement("span");
    wrapper.innerHTML = toTrustedHtml(value.html);
    parent.appendChild(wrapper);
    return;
  }
  parent.appendChild(document.createTextNode(String(value)));
}
function toNode(value) {
  if (value == null || value === false || value === true)
    return document.createComment("");
  if (value instanceof Node)
    return value;
  if (isRawHtml(value)) {
    const wrapper = document.createElement("span");
    wrapper.innerHTML = toTrustedHtml(value.html);
    return wrapper;
  }
  if (Array.isArray(value)) {
    const frag = document.createDocumentFragment();
    for (const item of value)
      frag.appendChild(toNode(item));
    return frag;
  }
  return document.createTextNode(String(value));
}
function html(strings, ...values) {
  if (_ssrInterceptor) {
    return _ssrInterceptor(strings, ...values);
  }
  const tokens = tokenize(strings, values);
  return buildDom(tokens);
}

// ../../dist/core/css.js
var scopeCounter = 0;
var cache = /* @__PURE__ */ new Map();
function generateScopeId() {
  return `nf-${(scopeCounter++).toString(36)}`;
}
function scopeCSS(raw, scopeClass) {
  const prefix = `.${scopeClass}`;
  let result = "";
  let i = 0;
  const len = raw.length;
  while (i < len) {
    while (i < len && /\s/.test(raw[i])) {
      result += raw[i];
      i++;
    }
    if (i >= len)
      break;
    if (raw[i] === "@") {
      const atStart = i;
      while (i < len && raw[i] !== "{")
        i++;
      result += raw.slice(atStart, i);
      if (i < len) {
        result += raw[i];
        i++;
      }
      const body = extractBlock(raw, i - 1);
      const inner = body.slice(1, -1);
      result += scopeCSS(inner, scopeClass);
      result += "}";
      i += body.length - 1;
      continue;
    }
    const selStart = i;
    while (i < len && raw[i] !== "{")
      i++;
    const selectors = raw.slice(selStart, i).trim();
    if (!selectors || i >= len)
      break;
    const scopedSelectors = selectors.split(",").map((sel) => {
      sel = sel.trim();
      if (!sel)
        return sel;
      if (sel === ":root" || sel === ":host")
        return prefix;
      if (sel.startsWith("&"))
        return prefix + sel.slice(1);
      return `${prefix} ${sel}`;
    }).join(", ");
    result += scopedSelectors;
    const block = extractBlock(raw, i);
    result += block;
    i += block.length;
  }
  return result;
}
function extractBlock(source, start) {
  if (source[start] !== "{")
    return "";
  let depth = 0;
  let i = start;
  while (i < source.length) {
    if (source[i] === "{")
      depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0)
        return source.slice(start, i + 1);
    }
    i++;
  }
  return source.slice(start);
}
function injectStyle(cssText, id) {
  if (typeof document === "undefined")
    return;
  if (document.getElementById(id))
    return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}
function css(strings, ...values) {
  let raw = "";
  for (let i = 0; i < strings.length; i++) {
    raw += strings[i];
    if (i < values.length)
      raw += String(values[i]);
  }
  const cached = cache.get(raw);
  if (cached)
    return cached;
  const scopeClass = generateScopeId();
  const scopedCSS = scopeCSS(raw, scopeClass);
  injectStyle(scopedCSS, `style-${scopeClass}`);
  const result = { scope: scopeClass, css: scopedCSS };
  cache.set(raw, result);
  return result;
}

// remotes/billing-widget.ts
var styles = css`
  .billing-widget {
    font-family: -apple-system, sans-serif;
  }
  .billing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .billing-header h3 {
    margin: 0;
    font-size: 16px;
  }
  .badge {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 12px;
    background: rgba(34,197,94,0.1);
    color: #16a34a;
    font-weight: 600;
  }
  .plan-card {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 12px;
    padding: 20px;
    color: white;
    margin-bottom: 16px;
  }
  .plan-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .plan-price { font-size: 14px; opacity: 0.8; }
  .usage-bar {
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    margin-top: 12px;
    overflow: hidden;
  }
  .usage-fill {
    height: 100%;
    background: white;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .invoices { list-style: none; padding: 0; margin: 0; }
  .invoices li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
  }
  .invoices li:last-child { border-bottom: none; }
  .amount { font-weight: 600; }
  button {
    width: 100%;
    padding: 10px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 12px;
  }
  button:hover { background: #4338ca; }
`;
function BillingWidget(props) {
  const usage = createSignal(67);
  const invoices = [
    { date: "Jul 2026", amount: "$49.00", status: "Paid" },
    { date: "Jun 2026", amount: "$49.00", status: "Paid" },
    { date: "May 2026", amount: "$39.00", status: "Paid" }
  ];
  const simulateUsage = () => {
    usage.set(Math.min(100, Math.floor(Math.random() * 40) + 60));
  };
  return html`
    <div class=${styles.scope}>
      <div class="billing-widget">
        <div class="billing-header">
          <h3>Billing — ${props.accountId ?? "Default"}</h3>
          <span class="badge">Active</span>
        </div>

        <div class="plan-card">
          <div class="plan-name">Pro Plan</div>
          <div class="plan-price">$49/month · Renews Aug 1</div>
          <div class="usage-bar">
            <div class="usage-fill" style=${() => ({ width: `${usage()}%` })}></div>
          </div>
          <div class="plan-price" style=${{ marginTop: "6px" }}>
            ${() => `${usage()}% of API quota used`}
          </div>
        </div>

        <h4 style=${{ fontSize: "14px", margin: "0 0 8px" }}>Recent Invoices</h4>
        <ul class="invoices">
          ${invoices.map((inv) => html`
            <li>
              <span>${inv.date}</span>
              <span class="amount">${inv.amount}</span>
              <span>${inv.status}</span>
            </li>
          `)}
        </ul>

        <button onclick=${simulateUsage}>Simulate API Usage</button>
      </div>
    </div>
  `;
}
export {
  BillingWidget as default
};
