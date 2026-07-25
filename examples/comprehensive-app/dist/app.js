// ../../src/core/extend.ts
var effectHook = null;
function setEffectHook(hook) {
  effectHook = hook;
}
function runWithHook(label, fn) {
  if (effectHook) effectHook(label, fn);
  else fn();
}
var directives = /* @__PURE__ */ new Map();
function getDirective(name) {
  return directives.get(name);
}

// ../../src/core/signal.ts
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
    if (!this.active) return;
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
    for (const dep of this.deps) dep.subscribers.delete(this);
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
    if (Object.is(newValue, this.value)) return;
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
        console.warn(
          `[onefold] Signal updated ${_devUpdateCounter} times in <1s. Possible infinite loop in an effect.`
        );
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
      for (const e of this.subscribers) pendingEffects.add(e);
    } else {
      const subs = Array.from(this.subscribers);
      for (let i = 0; i < subs.length; i++) subs[i].run();
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
        if (!line) continue;
        if (/\bcreateEffect\b|\bcreateComputed\b|\bbindReactive\b|\bapplyAttr\b|\bbuildDom\b|\bappendExpr\b|\brunWithHook\b|ReactiveEffect/.test(line)) continue;
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
function createComputed(fn) {
  const internal = createSignal(void 0);
  createEffect(() => internal.set(fn()), "computed");
  const accessor = (() => internal());
  accessor.peek = internal.peek;
  accessor.set = () => {
    throw new Error("[onefold] Cannot write to a computed signal.");
  };
  return accessor;
}
function batch(fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const effects = [...pendingEffects];
      pendingEffects.clear();
      for (const e of effects) e.run();
    }
  }
}

// ../../src/security/sanitize.ts
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
  if (trustedPolicy) return trustedPolicy;
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
function raw(html2) {
  return { __onefoldRaw: true, html: minimalSanitize(html2) };
}
function isRawHtml(value) {
  return typeof value === "object" && value !== null && value.__onefoldRaw === true;
}

// ../../src/core/dom.ts
function mount(node, container) {
  container.replaceChildren(node);
}

// ../../src/core/lifecycle.ts
var disposersByNode = /* @__PURE__ */ new WeakMap();
var observer = null;
function ensureObserver() {
  if (observer || typeof MutationObserver === "undefined" || typeof document === "undefined") return;
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

// ../../src/core/template.ts
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
        tokens.push({ kind: 1 /* CloseTag */, tag: tag2 });
        pos = end + 1;
        continue;
      }
      const tagEnd = findTagEnd(source, pos);
      const selfClosing = charAt(source, tagEnd - 1) === "/";
      const inner = source.slice(pos + 1, selfClosing ? tagEnd - 1 : tagEnd);
      const { tag, attrs } = parseOpenTag(inner, values);
      tokens.push({ kind: 0 /* OpenTag */, tag });
      for (const attr of attrs) tokens.push(attr);
      if (selfClosing) {
        tokens.push({ kind: 1 /* CloseTag */, tag });
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
        if (before) tokens.push({ kind: 3 /* Text */, value: before });
        tokens.push({ kind: 4 /* Expr */, value: values[captureInt(match)] });
        lastIdx = match.index + match[0].length;
      }
      const after = text.slice(lastIdx);
      if (after && after.trim()) tokens.push({ kind: 3 /* Text */, value: after });
    }
  }
  return tokens;
}
function findTagEnd(source, start) {
  let inQuote = null;
  for (let i = start + 1; i < source.length; i++) {
    const ch = charAt(source, i);
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
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
  if (firstSpace === -1) return { tag, attrs };
  const rest = inner.slice(firstSpace).trim();
  if (!rest) return { tag, attrs };
  let pos = 0;
  const len = rest.length;
  while (pos < len) {
    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;
    if (pos >= len) break;
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf("\0", pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      const propsObj = values[idx];
      if (propsObj && typeof propsObj === "object") {
        for (const [k, v] of Object.entries(propsObj)) {
          attrs.push({ kind: 2 /* Attr */, name: k, value: v });
        }
      }
      pos = endMarker + 1;
      continue;
    }
    const nameStart = pos;
    while (pos < len && charAt(rest, pos) !== "=" && !isWhitespace(charAt(rest, pos))) pos++;
    const name = rest.slice(nameStart, pos);
    if (!name) {
      pos++;
      continue;
    }
    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;
    if (pos >= len || charAt(rest, pos) !== "=") {
      attrs.push({ kind: 2 /* Attr */, name, value: true });
      continue;
    }
    pos++;
    while (pos < len && isWhitespace(charAt(rest, pos))) pos++;
    if (rest.startsWith(PLACEHOLDER_PREFIX, pos)) {
      const endMarker = rest.indexOf("\0", pos + PLACEHOLDER_PREFIX.length);
      const idx = parseInt(rest.slice(pos + PLACEHOLDER_PREFIX.length, endMarker), 10);
      attrs.push({ kind: 2 /* Attr */, name, value: values[idx] });
      pos = endMarker + 1;
    } else if (charAt(rest, pos) === '"' || charAt(rest, pos) === "'") {
      const quote = charAt(rest, pos);
      pos++;
      const valStart = pos;
      while (pos < len && charAt(rest, pos) !== quote) pos++;
      const rawVal = rest.slice(valStart, pos);
      pos++;
      attrs.push({ kind: 2 /* Attr */, name, value: resolveAttrValue(rawVal, values) });
    } else {
      const valStart = pos;
      while (pos < len && !isWhitespace(charAt(rest, pos))) pos++;
      const rawVal = rest.slice(valStart, pos);
      attrs.push({ kind: 2 /* Attr */, name, value: resolveAttrValue(rawVal, values) });
    }
  }
  return { tag, attrs };
}
function resolveAttrValue(rawVal, values) {
  PLACEHOLDER_RE.lastIndex = 0;
  const firstMatch = PLACEHOLDER_RE.exec(rawVal);
  if (!firstMatch) return rawVal;
  if (firstMatch.index === 0 && firstMatch[0].length === rawVal.length) {
    return values[captureInt(firstMatch)];
  }
  PLACEHOLDER_RE.lastIndex = 0;
  const parts = [];
  let lastPh = 0;
  let phm;
  while ((phm = PLACEHOLDER_RE.exec(rawVal)) !== null) {
    if (phm.index > lastPh) parts.push(rawVal.slice(lastPh, phm.index));
    const val = values[captureInt(phm)];
    parts.push(typeof val === "function" ? val : () => val);
    lastPh = phm.index + phm[0].length;
  }
  if (lastPh < rawVal.length) parts.push(rawVal.slice(lastPh));
  return () => parts.map((p) => typeof p === "function" ? p() : p).join("");
}
function buildDom(tokens) {
  const root = document.createDocumentFragment();
  const stack = [root];
  let current = root;
  for (const token of tokens) {
    switch (token.kind) {
      case 0 /* OpenTag */: {
        const el = document.createElement(token.tag);
        current.appendChild(el);
        stack.push(el);
        current = el;
        break;
      }
      case 1 /* CloseTag */: {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          const closedEl = current;
          const tag = closedEl.tagName?.toLowerCase();
          if ((tag === "input" || tag === "textarea") && !closedEl.hasAttribute("value")) {
            const hasInputHandler = closedEl.getAttribute("data-nf-has-input") === "1";
            if (hasInputHandler) {
              console.warn(
                `[onefold] <${tag}> has oninput/onchange but no value=\${() => signal()} binding. The input won't clear on signal.set('') or form.reset(). Add: value=\${() => yourSignal()} for two-way binding.`,
                closedEl
              );
            }
          }
        }
        stack.pop();
        current = stack.length > 0 ? stack[stack.length - 1] : root;
        break;
      }
      case 2 /* Attr */: {
        applyAttr(current, token.name, token.value);
        break;
      }
      case 3 /* Text */: {
        current.appendChild(document.createTextNode(token.value));
        break;
      }
      case 4 /* Expr */: {
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
    if (typeof value === "function") value(el);
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
  if (value == null || value === false || value === true) return;
  if (value instanceof Node) {
    parent.appendChild(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) appendExpr(parent, item);
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
      if (!parentEl) return;
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
  if (value == null || value === false || value === true) return document.createComment("");
  if (value instanceof Node) return value;
  if (isRawHtml(value)) {
    const wrapper = document.createElement("span");
    wrapper.innerHTML = toTrustedHtml(value.html);
    return wrapper;
  }
  if (Array.isArray(value)) {
    const frag = document.createDocumentFragment();
    for (const item of value) frag.appendChild(toNode(item));
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

// ../../src/core/css.ts
var scopeCounter = 0;
var cache = /* @__PURE__ */ new Map();
function generateScopeId() {
  return `nf-${(scopeCounter++).toString(36)}`;
}
function scopeCSS(raw2, scopeClass) {
  const prefix = `.${scopeClass}`;
  let result = "";
  let i = 0;
  const len = raw2.length;
  while (i < len) {
    while (i < len && /\s/.test(raw2[i])) {
      result += raw2[i];
      i++;
    }
    if (i >= len) break;
    if (raw2[i] === "@") {
      const atStart = i;
      while (i < len && raw2[i] !== "{") i++;
      result += raw2.slice(atStart, i);
      if (i < len) {
        result += raw2[i];
        i++;
      }
      const body = extractBlock(raw2, i - 1);
      const inner = body.slice(1, -1);
      result += scopeCSS(inner, scopeClass);
      result += "}";
      i += body.length - 1;
      continue;
    }
    const selStart = i;
    while (i < len && raw2[i] !== "{") i++;
    const selectors = raw2.slice(selStart, i).trim();
    if (!selectors || i >= len) break;
    const scopedSelectors = selectors.split(",").map((sel) => {
      sel = sel.trim();
      if (!sel) return sel;
      if (sel === ":root" || sel === ":host") return prefix;
      if (sel.startsWith("&")) return prefix + sel.slice(1);
      return `${prefix} ${sel}`;
    }).join(", ");
    result += scopedSelectors;
    const block = extractBlock(raw2, i);
    result += block;
    i += block.length;
  }
  return result;
}
function extractBlock(source, start) {
  if (source[start] !== "{") return "";
  let depth = 0;
  let i = start;
  while (i < source.length) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
    i++;
  }
  return source.slice(start);
}
function injectStyle(cssText, id) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}
function css(strings, ...values) {
  let raw2 = "";
  for (let i = 0; i < strings.length; i++) {
    raw2 += strings[i];
    if (i < values.length) raw2 += String(values[i]);
  }
  const cached = cache.get(raw2);
  if (cached) return cached;
  const scopeClass = generateScopeId();
  const scopedCSS = scopeCSS(raw2, scopeClass);
  injectStyle(scopedCSS, `style-${scopeClass}`);
  const result = { scope: scopeClass, css: scopedCSS };
  cache.set(raw2, result);
  return result;
}

// ../../src/core/virtual-list.ts
function VirtualList(opts) {
  const { items, itemHeight, height, renderRow, overscan = 6 } = opts;
  const scrollTop = createSignal(0);
  const viewport = document.createElement("div");
  viewport.style.height = `${height}px`;
  viewport.style.overflowY = "auto";
  viewport.style.position = "relative";
  viewport.setAttribute("role", "list");
  const spacer = document.createElement("div");
  spacer.style.position = "relative";
  viewport.appendChild(spacer);
  const rowPool = /* @__PURE__ */ new Map();
  viewport.addEventListener(
    "scroll",
    () => scrollTop.set(viewport.scrollTop),
    { passive: true }
  );
  const dispose = createEffect(() => {
    const list = items();
    const total = list.length;
    spacer.style.height = `${total * itemHeight}px`;
    const top = scrollTop();
    const first = Math.max(0, Math.floor(top / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
    const last = Math.min(total, first + visibleCount);
    const wanted = /* @__PURE__ */ new Set();
    for (let i = first; i < last; i++) wanted.add(i);
    for (const [i, node] of rowPool) {
      if (!wanted.has(i)) {
        node.remove();
        rowPool.delete(i);
      }
    }
    for (let i = first; i < last; i++) {
      if (rowPool.has(i)) continue;
      const item = list[i];
      if (item === void 0) continue;
      const row = renderRow(item, i);
      const wrapper = row instanceof HTMLElement ? row : (() => {
        const d = document.createElement("div");
        d.appendChild(row);
        return d;
      })();
      wrapper.style.position = "absolute";
      wrapper.style.top = `${i * itemHeight}px`;
      wrapper.style.left = "0";
      wrapper.style.right = "0";
      wrapper.style.height = `${itemHeight}px`;
      spacer.appendChild(wrapper);
      rowPool.set(i, wrapper);
    }
  });
  disposeOnRemove(viewport, dispose);
  return viewport;
}

// ../../src/core/resource.ts
function createResource(source, fetcher) {
  const data = createSignal(void 0);
  const loading = createSignal(false);
  const error = createSignal(void 0);
  let fetchId = 0;
  const doFetch = (sourceValue) => {
    const id = ++fetchId;
    loading.set(true);
    error.set(void 0);
    fetcher(sourceValue).then((result) => {
      if (id !== fetchId) return;
      data.set(result);
      loading.set(false);
    }).catch((err) => {
      if (id !== fetchId) return;
      error.set(err);
      loading.set(false);
    });
  };
  let currentSource;
  const disposeEffect = createEffect(() => {
    const val = source();
    currentSource = val;
    doFetch(val);
  });
  return {
    data,
    loading,
    error,
    refetch: () => doFetch(currentSource),
    dispose: () => {
      disposeEffect();
      fetchId++;
    }
  };
}

// ../../src/store/store.ts
function createStore(initial) {
  const signal = createSignal(initial);
  signal.update = (patch) => {
    signal.set((prev) => ({
      ...prev,
      ...typeof patch === "function" ? patch(prev) : patch
    }));
  };
  return signal;
}

// ../../src/router/router.ts
var _currentPath = null;
var _useHash = null;
function useHash() {
  if (_useHash === null) {
    _useHash = typeof window !== "undefined" && window.location.protocol === "file:";
  }
  return _useHash;
}
function readPath() {
  if (typeof window === "undefined") return "/";
  if (useHash()) return window.location.hash.slice(1) || "/";
  return window.location.pathname;
}
function getPathSignal() {
  if (_currentPath) return _currentPath;
  _currentPath = createSignal(readPath());
  if (typeof window !== "undefined") {
    const event = useHash() ? "hashchange" : "popstate";
    window.addEventListener(event, () => _currentPath.set(readPath()));
  }
  return _currentPath;
}
function navigate(path) {
  if (typeof window === "undefined") return;
  const signal = getPathSignal();
  if (useHash()) {
    window.location.hash = path;
    signal.set(path);
  } else {
    window.history.pushState({}, "", path);
    signal.set(path);
  }
}
function currentRoute() {
  return getPathSignal()();
}
function matchExact(pattern2, path) {
  const patternParts = pattern2.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pat = patternParts[i];
    const val = pathParts[i];
    if (pat.startsWith(":")) {
      try {
        params[pat.slice(1)] = decodeURIComponent(val);
      } catch {
        params[pat.slice(1)] = val;
      }
    } else if (pat !== val) {
      return null;
    }
  }
  return params;
}
function matchPrefix(pattern2, path) {
  if (pattern2 === "/") {
    return {};
  }
  const patternParts = pattern2.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (pathParts.length < patternParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pat = patternParts[i];
    const val = pathParts[i];
    if (pat.startsWith(":")) {
      try {
        params[pat.slice(1)] = decodeURIComponent(val);
      } catch {
        params[pat.slice(1)] = val;
      }
    } else if (pat !== val) {
      return null;
    }
  }
  return params;
}
function resolveRoutes(routes, path, notFound, parentPath = "") {
  for (const route of routes) {
    const fullPath = joinPaths(parentPath, route.path);
    if (route.children && route.children.length > 0) {
      const params = matchPrefix(fullPath, path);
      if (params !== null) {
        const childView = resolveRoutes(route.children, path, notFound, fullPath);
        const outlet = childView ?? notFound();
        return route.view(params, outlet);
      }
    } else {
      const params = matchExact(fullPath, path);
      if (params !== null) {
        return route.view(params);
      }
    }
  }
  return null;
}
function joinPaths(parent, child) {
  if (!parent || parent === "/") return child;
  if (child === "/") return parent;
  const base = parent.endsWith("/") ? parent.slice(0, -1) : parent;
  const segment = child.startsWith("/") ? child : "/" + child;
  return base + segment;
}
function Router(routes, notFound) {
  const pathSignal = getPathSignal();
  const container = document.createElement("div");
  const dispose = createEffect(() => {
    const path = pathSignal();
    let view = null;
    if (Array.isArray(routes)) {
      view = resolveRoutes(routes, path, notFound, "");
    } else {
      const handler = routes[path];
      if (handler) view = handler();
    }
    container.textContent = "";
    container.appendChild(view ?? notFound());
  });
  disposeOnRemove(container, dispose);
  return container;
}

// ../../src/core/di.ts
function createToken(name) {
  return { id: Symbol(name) };
}
var registry = /* @__PURE__ */ new Map();
var scopeStack = [];
function provide(token, value) {
  if (scopeStack.length > 0) {
    scopeStack[scopeStack.length - 1].set(token.id, value);
  } else {
    registry.set(token.id, value);
  }
}
function inject(token) {
  for (let i = scopeStack.length - 1; i >= 0; i--) {
    const scope = scopeStack[i];
    if (scope.has(token.id)) return scope.get(token.id);
  }
  if (registry.has(token.id)) return registry.get(token.id);
  throw new Error(`[onefold] No provider found for token: ${token.id.toString()}`);
}

// ../../src/core/form.ts
function required(msg = "Required") {
  return (value) => {
    if (value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0) {
      return msg;
    }
    return null;
  };
}
function email(msg = "Invalid email") {
  return (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg;
}
function minLength(n, msg) {
  return (value) => value.length >= n ? null : msg ?? `Minimum ${n} characters`;
}
function maxLength(n, msg) {
  return (value) => value.length <= n ? null : msg ?? `Maximum ${n} characters`;
}
function createForm(config) {
  const fieldEntries = Object.entries(config);
  const fields = {};
  const disposers = [];
  for (const [name, fieldConfig] of fieldEntries) {
    const value = createSignal(fieldConfig.initial);
    const touched = createSignal(false);
    const error = createSignal("");
    const valid = createSignal(true);
    const rules = fieldConfig.rules ?? [];
    disposers.push(createEffect(() => {
      const val = value();
      if (!touched()) {
        error.set("");
        valid.set(runRules(rules, val) === null);
        return;
      }
      const err = runRules(rules, val);
      error.set(err ?? "");
      valid.set(err === null);
    }));
    fields[name] = {
      value,
      error,
      touched,
      valid,
      handle: (e) => {
        const target = e.target;
        const newValue = target.type === "checkbox" ? target.checked : target.type === "number" ? Number(target.value) : target.value;
        batch(() => {
          value.set(newValue);
          touched.set(true);
        });
      },
      set: (v) => {
        batch(() => {
          value.set(v);
          touched.set(true);
        });
      },
      reset: () => {
        batch(() => {
          value.set(fieldConfig.initial);
          touched.set(false);
        });
      }
    };
  }
  const formValid = createSignal(true);
  const formDirty = createSignal(false);
  disposers.push(createEffect(() => {
    let allValid = true;
    let anyTouched = false;
    for (const field of Object.values(fields)) {
      if (!field.valid()) allValid = false;
      if (field.touched()) anyTouched = true;
    }
    formValid.set(allValid);
    formDirty.set(anyTouched);
  }));
  return {
    fields,
    valid: formValid,
    dirty: formDirty,
    values: () => {
      const result = {};
      for (const [name, field] of Object.entries(fields)) {
        result[name] = field.value.peek();
      }
      return result;
    },
    submit: (handler) => {
      batch(() => {
        for (const field of Object.values(fields)) {
          field.touched.set(true);
        }
      });
      if (formValid.peek()) {
        const result = {};
        for (const [name, field] of Object.entries(fields)) {
          result[name] = field.value.peek();
        }
        handler(result);
      }
    },
    reset: () => {
      batch(() => {
        for (const field of Object.values(fields)) {
          field.reset();
        }
      });
    },
    dispose: () => {
      for (const dispose of disposers) dispose();
    }
  };
}
function runRules(rules, value) {
  for (const rule of rules) {
    const err = rule(value);
    if (err) return err;
  }
  return null;
}

// ../../src/core/i18n.ts
function createI18n(config) {
  const locale = createSignal(config.defaultLocale);
  const messages = { ...config.messages };
  const fallback = config.fallbackLocale ?? config.defaultLocale;
  const messagesVersion = createSignal(0);
  function t(key, params) {
    const currentLocale = locale();
    messagesVersion();
    const dict = messages[currentLocale];
    let template = dict?.[key] ?? messages[fallback]?.[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        template = template.split(`{${k}}`).join(String(v));
      }
    }
    return template;
  }
  function setLocale(newLocale) {
    locale.set(newLocale);
  }
  function addMessages(loc, msgs) {
    messages[loc] = { ...messages[loc], ...msgs };
    messagesVersion.set((v) => v + 1);
  }
  function availableLocales() {
    return Object.keys(messages);
  }
  return { locale, setLocale, t, addMessages, availableLocales };
}

// ../../src/core/observe.ts
function createObserver() {
  const listeners2 = /* @__PURE__ */ new Map();
  function on(event, handler) {
    if (!listeners2.has(event)) listeners2.set(event, /* @__PURE__ */ new Set());
    const set = listeners2.get(event);
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }
  function emit2(event, data) {
    const fullEvent = { ...data, timestamp: Date.now() };
    const set = listeners2.get(event);
    if (set) {
      for (const handler of set) handler(fullEvent);
    }
  }
  function trackRender(component2, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    emit2("render", { component: component2, duration });
    return result;
  }
  function trackError(fn, context) {
    try {
      return fn();
    } catch (error) {
      emit2("error", { error, context });
      return void 0;
    }
  }
  function metric(name, value, tags) {
    emit2("metric", { name, value, tags });
  }
  function log(level, message, data) {
    emit2("log", { level, message, data });
  }
  function clear() {
    listeners2.clear();
  }
  return { on, emit: emit2, trackRender, trackError, metric, log, clear };
}

// ../../src/core/plugin.ts
function createPluginHost() {
  const plugins2 = /* @__PURE__ */ new Map();
  const hostListeners = /* @__PURE__ */ new Map();
  const pluginEventBus = /* @__PURE__ */ new Map();
  function hostEmit(event, ...args) {
    const set = hostListeners.get(event);
    if (set) for (const handler of set) handler(...args);
  }
  function register(definition) {
    if (plugins2.has(definition.name)) {
      throw new Error(`[onefold] Plugin "${definition.name}" is already registered.`);
    }
    plugins2.set(definition.name, {
      definition,
      status: "registered",
      disposers: [],
      setupDisposer: null
    });
    hostEmit("plugin:registered", definition.name, definition.version);
  }
  function unregister(name) {
    const instance = plugins2.get(name);
    if (!instance) return;
    if (instance.status === "active") stopPlugin(name);
    plugins2.delete(name);
  }
  function startPlugin(name) {
    const instance = plugins2.get(name);
    if (!instance || instance.status === "active") return;
    const def = instance.definition;
    const sandbox = def.sandbox !== false;
    const permissions = new Set(def.permissions ?? []);
    const ctx = {
      name: def.name,
      permissions,
      hasPermission: (perm) => permissions.has(perm),
      on: (event, handler) => {
        const key = `${name}:${event}`;
        if (!pluginEventBus.has(key)) pluginEventBus.set(key, /* @__PURE__ */ new Set());
        const set = pluginEventBus.get(key);
        set.add(handler);
        const disposer = () => {
          set.delete(handler);
        };
        instance.disposers.push(disposer);
        return disposer;
      },
      emit: (event, ...args) => {
        const key = `${name}:${event}`;
        const set = pluginEventBus.get(key);
        if (set) for (const handler of set) handler(...args);
        hostEmit(`plugin:event:${event}`, name, ...args);
      }
    };
    try {
      const disposer = def.setup(ctx);
      instance.setupDisposer = typeof disposer === "function" ? disposer : null;
      instance.status = "active";
      hostEmit("plugin:started", name);
    } catch (err) {
      instance.status = "error";
      hostEmit("plugin:error", name, err);
      if (!sandbox) throw err;
    }
  }
  function stopPlugin(name) {
    const instance = plugins2.get(name);
    if (!instance || instance.status !== "active") return;
    const sandbox = instance.definition.sandbox !== false;
    try {
      instance.setupDisposer?.();
      instance.definition.teardown?.();
      for (const disposer of instance.disposers) disposer();
      instance.disposers.length = 0;
    } catch (err) {
      hostEmit("plugin:error", name, err);
      if (!sandbox) throw err;
    }
    instance.status = "stopped";
    hostEmit("plugin:stopped", name);
  }
  function start() {
    for (const [name, instance] of plugins2) {
      if (instance.status === "registered" || instance.status === "stopped") {
        startPlugin(name);
      }
    }
  }
  function stop() {
    for (const [name, instance] of plugins2) {
      if (instance.status === "active") stopPlugin(name);
    }
  }
  function getStatus(name) {
    return plugins2.get(name)?.status ?? null;
  }
  function list() {
    return [...plugins2.keys()];
  }
  function on(event, handler) {
    if (!hostListeners.has(event)) hostListeners.set(event, /* @__PURE__ */ new Set());
    const set = hostListeners.get(event);
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }
  return { register, unregister, start, startPlugin, stop, stopPlugin, getStatus, list, on };
}

// ../../src/core/persist.ts
var POISONED_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function sanitizeParsed(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeParsed);
  const clean = {};
  for (const [k, v] of Object.entries(value)) {
    if (!POISONED_KEYS.has(k)) {
      clean[k] = sanitizeParsed(v);
    }
  }
  return clean;
}
var localStorageAdapter = {
  get(key) {
    if (typeof localStorage === "undefined") return void 0;
    const raw2 = localStorage.getItem(key);
    if (raw2 === null) return void 0;
    try {
      return sanitizeParsed(JSON.parse(raw2));
    } catch {
      return void 0;
    }
  },
  set(key, value) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  }
};
function createPersisted(key, initial, options) {
  const storage = options?.storage ?? localStorageAdapter;
  const debounceMs = options?.debounce ?? 0;
  const stored = storage.get(key);
  const signal = createSignal(stored !== void 0 ? stored : initial);
  let timer = null;
  createEffect(() => {
    const value = signal();
    if (debounceMs > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => storage.set(key, value), debounceMs);
    } else {
      storage.set(key, value);
    }
  });
  const persisted = signal;
  persisted.clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    signal.set(initial);
    storage.remove(key);
  };
  return persisted;
}

// ../../src/core/guard.ts
var permissionsSource = null;
function setPermissions(source) {
  permissionsSource = source;
}
function getPermissions() {
  return permissionsSource ? permissionsSource() : /* @__PURE__ */ new Set();
}
function hasPermission(permission) {
  return getPermissions().has(permission);
}
function hasAnyPermission(permissions) {
  const current = getPermissions();
  return permissions.some((p) => current.has(p));
}
function guard(check, view, fallback) {
  return (params) => {
    if (checkPermission(check)) {
      return view(params);
    }
    return fallback ? fallback(params) : document.createComment("unauthorized");
  };
}
function guardedNode(check, render, fallback) {
  if (checkPermission(check)) return render();
  return fallback ? fallback() : null;
}
function checkPermission(check) {
  const perms = getPermissions();
  if (typeof check === "function") return check(perms);
  if (typeof check === "string") return perms.has(check);
  return check.every((p) => perms.has(p));
}

// ../../src/core/theme.ts
function createTheme(themes, defaultTheme) {
  const names = Object.keys(themes);
  const initial = defaultTheme ?? names[0] ?? "";
  const current = createSignal(initial);
  createEffect(() => {
    const name = current();
    const tokens = themes[name];
    if (!tokens || typeof document === "undefined") return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(`--${key}`, value);
    }
  });
  return {
    current,
    set: (name) => {
      if (themes[name]) current.set(name);
    },
    toggle: () => {
      const idx = names.indexOf(current());
      current.set(names[(idx + 1) % names.length]);
    },
    themes: () => names,
    tokens: () => themes[current()] ?? {}
  };
}

// ../../src/core/http.ts
async function runErrorInterceptors(interceptors, error) {
  let currentError = error;
  for (let i = interceptors.length - 1; i >= 0; i--) {
    const interceptor = interceptors[i];
    if (!interceptor.error) continue;
    try {
      const recovered = await interceptor.error(currentError);
      return recovered;
    } catch (err) {
      currentError = err;
    }
  }
  throw currentError;
}
function createHttpClient(options) {
  const baseUrl = options?.baseUrl ?? "";
  const defaultHeaders = options?.headers ?? {};
  const interceptors = [...options?.interceptors ?? []];
  const defaultTimeout = options?.timeout ?? 0;
  async function request(config) {
    const resolvedUrl = config.url.startsWith("http") ? config.url : config.url.startsWith("//") ? (() => {
      throw new Error("[onefold:http] Protocol-relative URLs are blocked to prevent open redirect.");
    })() : `${baseUrl}${config.url}`;
    let fullConfig = {
      url: resolvedUrl,
      method: config.method,
      headers: { ...defaultHeaders, ...config.headers },
      body: config.body,
      params: config.params,
      signal: config.signal
    };
    for (const interceptor of interceptors) {
      if (interceptor.request) {
        fullConfig = await interceptor.request(fullConfig);
      }
    }
    let fetchUrl = fullConfig.url;
    if (fullConfig.params && Object.keys(fullConfig.params).length > 0) {
      const search = new URLSearchParams(fullConfig.params).toString();
      fetchUrl += (fetchUrl.includes("?") ? "&" : "?") + search;
    }
    const fetchOpts = {
      method: fullConfig.method,
      headers: fullConfig.headers,
      signal: fullConfig.signal
    };
    if (fullConfig.body !== void 0 && fullConfig.body !== null) {
      if (typeof fullConfig.body === "string" || fullConfig.body instanceof FormData) {
        fetchOpts.body = fullConfig.body;
      } else {
        fetchOpts.body = JSON.stringify(fullConfig.body);
        if (!fullConfig.headers["Content-Type"] && !fullConfig.headers["content-type"]) {
          fetchOpts.headers["Content-Type"] = "application/json";
        }
      }
    }
    const timeout = defaultTimeout;
    let timeoutId = null;
    let controller = null;
    if (timeout > 0 && !fullConfig.signal) {
      controller = new AbortController();
      fetchOpts.signal = controller.signal;
      timeoutId = setTimeout(() => controller.abort(), timeout);
    }
    try {
      const res = await fetch(fetchUrl, fetchOpts);
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) {
        let data2 = null;
        try {
          data2 = await res.json();
        } catch {
        }
        const httpError = {
          message: `HTTP ${res.status}: ${res.statusText}`,
          status: res.status,
          statusText: res.statusText,
          data: data2,
          config: fullConfig
        };
        return await runErrorInterceptors(interceptors, httpError);
      }
      let data;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      let response = {
        data,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        config: fullConfig
      };
      for (let i = interceptors.length - 1; i >= 0; i--) {
        const interceptor = interceptors[i];
        if (interceptor.response) {
          response = await interceptor.response(response);
        }
      }
      return response;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (typeof err === "object" && err !== null && "config" in err) throw err;
      const httpError = {
        message: err instanceof Error ? err.message : "Network error",
        status: 0,
        statusText: "Network Error",
        data: null,
        config: fullConfig
      };
      return await runErrorInterceptors(interceptors, httpError);
    }
  }
  function buildOptions(opts) {
    return {
      headers: opts?.headers,
      params: opts?.params,
      signal: opts?.signal
    };
  }
  return {
    get: (url, opts) => request({ url, method: "GET", ...buildOptions(opts) }),
    post: (url, body, opts) => request({ url, method: "POST", body, ...buildOptions(opts) }),
    put: (url, body, opts) => request({ url, method: "PUT", body, ...buildOptions(opts) }),
    patch: (url, body, opts) => request({ url, method: "PATCH", body, ...buildOptions(opts) }),
    delete: (url, opts) => request({ url, method: "DELETE", ...buildOptions(opts) }),
    request,
    addInterceptor: (interceptor) => {
      interceptors.push(interceptor);
      return () => {
        const idx = interceptors.indexOf(interceptor);
        if (idx >= 0) interceptors.splice(idx, 1);
      };
    }
  };
}

// ../../src/core/error-boundary.ts
function ErrorBoundary(render, fallback) {
  const container = document.createElement("div");
  container.setAttribute("data-error-boundary", "");
  function attempt() {
    container.textContent = "";
    try {
      const node = render();
      container.appendChild(node);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      container.appendChild(fallback(error, attempt));
    }
  }
  attempt();
  return container;
}

// ../../src/core/suspense.ts
function Suspense(asyncRender, options) {
  const container = document.createElement("div");
  container.setAttribute("data-suspense", "");
  const { fallback, onError, minLoadingMs = 0 } = options ?? {};
  if (fallback) container.appendChild(fallback());
  const startTime = Date.now();
  let wasConnected = false;
  asyncRender().then(async (node) => {
    if (container.isConnected || container.parentNode) wasConnected = true;
    if (wasConnected && !container.isConnected && !container.parentNode) return;
    if (minLoadingMs > 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingMs) {
        await delay(minLoadingMs - elapsed);
      }
    }
    if (wasConnected && !container.isConnected && !container.parentNode) return;
    container.textContent = "";
    container.appendChild(node);
  }).catch((err) => {
    if (wasConnected && !container.isConnected && !container.parentNode) return;
    container.textContent = "";
    const error = err instanceof Error ? err : new Error(String(err));
    if (onError) {
      container.appendChild(onError(error));
    } else {
      container.textContent = `Error: ${error.message}`;
    }
  });
  return container;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ../../src/core/transition.ts
function Transition(source, options) {
  const container = document.createElement("div");
  container.setAttribute("data-transition", "");
  container.style.position = "relative";
  const { name, duration = 300, enterFrom, enterTo, leaveTo, mode = "default" } = options ?? {};
  let currentNode = null;
  const dispose = createEffect(() => {
    const newNode = source();
    if (newNode === currentNode) return;
    const oldNode = currentNode;
    if (mode === "out-in" && oldNode && oldNode instanceof HTMLElement) {
      animateLeave(oldNode, { name, duration, leaveTo }, () => {
        container.textContent = "";
        if (newNode) {
          container.appendChild(newNode);
          if (newNode instanceof HTMLElement) {
            animateEnter(newNode, { name, duration, enterFrom, enterTo });
          }
        }
      });
    } else {
      if (oldNode && oldNode instanceof HTMLElement) {
        animateLeave(oldNode, { name, duration, leaveTo }, () => {
          oldNode.remove();
        });
      }
      if (newNode) {
        container.appendChild(newNode);
        if (newNode instanceof HTMLElement) {
          animateEnter(newNode, { name, duration, enterFrom, enterTo });
        }
      }
    }
    currentNode = newNode ?? null;
  });
  disposeOnRemove(container, dispose);
  return container;
}
function animateEnter(el, options) {
  const { name, duration = 300, enterFrom, enterTo } = options;
  if (name) {
    el.classList.add(`${name}-enter`, `${name}-enter-active`);
    requestAnimationFrame(() => {
      el.classList.remove(`${name}-enter`);
      el.classList.add(`${name}-enter-to`);
    });
    setTimeout(() => {
      el.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
    }, duration);
  } else if (enterFrom) {
    Object.assign(el.style, enterFrom);
    el.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
      Object.assign(el.style, enterTo ?? {});
    });
    setTimeout(() => {
      el.style.transition = "";
    }, duration);
  }
}
function animateLeave(el, options, done) {
  const { name, duration = 300, leaveTo } = options;
  if (name) {
    el.classList.add(`${name}-leave`, `${name}-leave-active`);
    requestAnimationFrame(() => {
      el.classList.remove(`${name}-leave`);
      el.classList.add(`${name}-leave-to`);
    });
    setTimeout(done, duration);
  } else if (leaveTo) {
    el.style.transition = `all ${duration}ms ease`;
    requestAnimationFrame(() => {
      Object.assign(el.style, leaveTo);
    });
    setTimeout(done, duration);
  } else {
    done();
  }
}

// ../../src/core/meta.ts
var registry2 = /* @__PURE__ */ new Map();
function component(meta) {
  const { render, ...metaOnly } = meta;
  registry2.set(meta.name, {
    meta: metaOnly,
    factory: render
  });
  return render;
}

// ../../src/core/a11y.ts
var FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]';
function FocusTrap(container) {
  let previousFocus = null;
  let active = false;
  function getFocusableElements() {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  }
  function handleKeyDown(e) {
    if (e.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  return {
    get active() {
      return active;
    },
    activate() {
      previousFocus = document.activeElement;
      active = true;
      container.addEventListener("keydown", handleKeyDown);
      const focusable = getFocusableElements();
      if (focusable.length > 0) focusable[0].focus();
      else container.focus();
    },
    deactivate() {
      active = false;
      container.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
      previousFocus = null;
    }
  };
}
var liveRegion = null;
function ensureLiveRegion() {
  if (liveRegion && liveRegion.isConnected) return liveRegion;
  liveRegion = document.createElement("div");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.setAttribute("role", "status");
  Object.assign(liveRegion.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0"
  });
  document.body.appendChild(liveRegion);
  return liveRegion;
}
function announce(message, priority = "polite") {
  const region = ensureLiveRegion();
  region.setAttribute("aria-live", priority);
  region.textContent = "";
  setTimeout(() => {
    region.textContent = message;
  }, 50);
}
function useKeyboard(keyMap, target) {
  const map = new Map(Object.entries(keyMap));
  const el = target ?? document;
  function normalizeEvent(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    parts.push(key);
    return parts.join("+");
  }
  function handleKeyDown(e) {
    const combo = normalizeEvent(e);
    const handler = map.get(combo);
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  }
  el.addEventListener("keydown", handleKeyDown);
  return {
    destroy: () => el.removeEventListener("keydown", handleKeyDown),
    add: (combo, handler) => map.set(combo, handler),
    remove: (combo) => map.delete(combo)
  };
}
function SkipLink(targetSelector, text = "Skip to main content") {
  const link = document.createElement("a");
  link.href = targetSelector;
  link.textContent = text;
  link.className = "nf-skip-link";
  Object.assign(link.style, {
    position: "absolute",
    top: "-100%",
    left: "0",
    padding: "8px 16px",
    background: "#1f2937",
    color: "#fff",
    fontSize: "14px",
    zIndex: "99999",
    textDecoration: "none",
    borderRadius: "0 0 4px 0",
    transition: "top 0.2s"
  });
  link.addEventListener("focus", () => {
    link.style.top = "0";
  });
  link.addEventListener("blur", () => {
    link.style.top = "-100%";
  });
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(targetSelector);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus();
    }
  });
  return link;
}

// ../../src/core/devtools.ts
var nextSignalId = 1;
var nextEffectId = 1;
var trackedSignals = /* @__PURE__ */ new Map();
var trackedEffects = /* @__PURE__ */ new Map();
var trackedStores = [];
var routeHistory = [];
var traceLabels = /* @__PURE__ */ new Set();
var devtoolsInstance = null;
var listeners = /* @__PURE__ */ new Map();
function emit(event, ...args) {
  const set = listeners.get(event);
  if (set) for (const handler of set) handler(...args);
}
function enableDevtools() {
  if (devtoolsInstance) return devtoolsInstance;
  const renders = [];
  let errorCount = 0;
  setEffectHook((label, fn) => {
    const start = performance.now();
    try {
      fn();
    } catch (err) {
      errorCount++;
      emit("error", err, label);
      throw err;
    }
    const duration = performance.now() - start;
    let source = "";
    try {
      const stack = new Error().stack ?? "";
      const lines = stack.split("\n");
      const internalPatterns = /devtools|signal|template|extend|lifecycle|runWithHook/i;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]?.trim() ?? "";
        if (line && !internalPatterns.test(line)) {
          const match = line.match(/at\s+(\S+)\s+\((.+)\)/) ?? line.match(/at\s+(.+)/);
          if (match) {
            source = match[1] ?? line;
            const pathMatch = source.match(/([^/\\]+\.\w+:\d+)/);
            if (pathMatch) source = pathMatch[1];
          }
          break;
        }
      }
    } catch {
    }
    const entry = { label, duration, timestamp: Date.now(), source };
    renders.push(entry);
    if (renders.length > 1e3) renders.shift();
    emit("render", entry);
  });
  const api = {
    version: "0.1.1",
    active: true,
    renders,
    signals: () => {
      const result = [];
      for (const [, s] of trackedSignals) {
        result.push({
          id: s.id,
          label: s.label,
          value: s.getValue(),
          subscribers: s.getSubscriberCount(),
          lastUpdated: s.lastUpdated
        });
      }
      return result;
    },
    effects: () => {
      const result = [];
      for (const [, e] of trackedEffects) {
        result.push({
          id: e.id,
          label: e.label,
          dependencies: e.getDependencyCount(),
          runCount: e.runCount,
          lastRun: e.lastRun,
          active: e.active
        });
      }
      return result;
    },
    stores: () => [...trackedStores],
    routes: () => ({
      current: routeHistory[routeHistory.length - 1] ?? "/",
      history: [...routeHistory]
    }),
    inspect: (el) => {
      console.group("%c[onefold] Inspect Element", "color:#4338CA;font-weight:bold");
      console.log("Element:", el);
      console.log("Tag:", el.tagName.toLowerCase());
      console.log("Classes:", el.className || "(none)");
      console.log("Attributes:", Object.fromEntries(
        Array.from(el.attributes).map((a) => [a.name, a.value])
      ));
      console.log("Children:", el.childNodes.length);
      console.log("Text:", el.textContent?.substring(0, 100) ?? "");
      console.log("Parent:", el.parentElement?.tagName.toLowerCase() ?? "(none)");
      console.log("Data attrs:", Object.fromEntries(
        Array.from(el.attributes).filter((a) => a.name.startsWith("data-")).map((a) => [a.name, a.value])
      ));
      console.groupEnd();
    },
    highlight: (el) => {
      const prev = el.style.outline;
      const prevTransition = el.style.transition;
      el.style.transition = "outline 0.1s";
      el.style.outline = "2px solid #4338CA";
      setTimeout(() => {
        el.style.outline = "2px solid transparent";
        setTimeout(() => {
          el.style.outline = prev;
          el.style.transition = prevTransition;
        }, 300);
      }, 600);
    },
    trace: (label) => {
      traceLabels.add(label);
      console.log(`%c[onefold] Tracing "${label}" \u2014 changes will be logged`, "color:#4338CA");
      return () => {
        traceLabels.delete(label);
      };
    },
    stats: () => {
      const total = renders.length;
      const avg = total > 0 ? renders.reduce((s, r) => s + r.duration, 0) / total : 0;
      const sorted = [...renders].sort((a, b) => a.duration - b.duration);
      return {
        totalRenders: total,
        avgDuration: Math.round(avg * 100) / 100,
        slowestRender: sorted.length > 0 ? sorted[sorted.length - 1] : null,
        fastestRender: sorted.length > 0 ? sorted[0] : null,
        totalErrors: errorCount,
        activeSignals: trackedSignals.size,
        activeEffects: [...trackedEffects.values()].filter((e) => e.active).length
      };
    },
    clear: () => {
      renders.length = 0;
      errorCount = 0;
      trackedSignals.clear();
      trackedEffects.clear();
      trackedStores.length = 0;
      routeHistory.length = 0;
      traceLabels.clear();
      nextSignalId = 1;
      nextEffectId = 1;
    },
    on: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, /* @__PURE__ */ new Set());
      listeners.get(event).add(handler);
      return () => {
        listeners.get(event)?.delete(handler);
      };
    },
    dump: () => {
      const s = api.stats();
      console.group("%c[onefold devtools] State Dump", "color:#4338CA;font-weight:bold;font-size:14px");
      console.log("Version:", api.version);
      console.log("");
      console.log("%cSignals (%d)", "font-weight:bold", s.activeSignals);
      console.table(api.signals().map((sig) => ({
        id: sig.id,
        label: sig.label,
        value: typeof sig.value === "object" ? JSON.stringify(sig.value) : sig.value,
        subscribers: sig.subscribers
      })));
      console.log("");
      console.log("%cEffects (%d active)", "font-weight:bold", s.activeEffects);
      console.table(api.effects().filter((e) => e.active).map((eff) => ({
        id: eff.id,
        label: eff.label,
        deps: eff.dependencies,
        runs: eff.runCount
      })));
      console.log("");
      console.log("%cPerformance", "font-weight:bold");
      console.log(`  Renders: ${s.totalRenders}`);
      console.log(`  Avg duration: ${s.avgDuration}ms`);
      console.log(`  Slowest: ${s.slowestRender ? `${s.slowestRender.label} (${s.slowestRender.duration.toFixed(2)}ms) @ ${s.slowestRender.source}` : "N/A"}`);
      console.log(`  Errors: ${s.totalErrors}`);
      if (renders.length > 0) {
        console.log("");
        console.log("%cRecent Renders (last 10)", "font-weight:bold");
        console.table(renders.slice(-10).map((r2) => ({
          label: r2.label,
          duration: r2.duration.toFixed(3) + "ms",
          source: r2.source || "(internal)",
          time: new Date(r2.timestamp).toLocaleTimeString()
        })));
      }
      console.log("");
      if (trackedStores.length > 0) {
        console.log("%cStores", "font-weight:bold");
        for (const store of trackedStores) {
          console.log(`  ${store.label}:`, store.state);
        }
        console.log("");
      }
      const r = api.routes();
      console.log("%cRouting", "font-weight:bold");
      console.log(`  Current: ${r.current}`);
      console.log(`  History: ${r.history.join(" \u2192 ")}`);
      console.groupEnd();
    }
  };
  devtoolsInstance = api;
  if (typeof window !== "undefined") {
    window.__ONEFOLD_DEVTOOLS__ = api;
    console.log(
      "%c\u{1F537} onefold devtools enabled %cv" + api.version + "%c \u2014 type __ONEFOLD_DEVTOOLS__.dump() for full state",
      "background:#4338CA;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold",
      "background:#818CF8;color:#fff;padding:2px 6px;border-radius:3px;margin-left:4px",
      "color:#64748b;margin-left:8px"
    );
  }
  return api;
}

// config/theme.ts
var theme = createTheme({
  light: {
    "app-bg": "#f0f4f8",
    "card-bg": "#ffffff",
    "text-primary": "#1f2937",
    "text-secondary": "#6b7280",
    "accent": "#4f46e5",
    "accent-hover": "#4338ca",
    "border": "#e5e7eb",
    "success": "#10b981",
    "warning": "#f59e0b",
    "danger": "#ef4444",
    "sidebar-bg": "#1e293b",
    "sidebar-text": "#f1f5f9"
  },
  dark: {
    "app-bg": "#0f172a",
    "card-bg": "#1e293b",
    "text-primary": "#f1f5f9",
    "text-secondary": "#94a3b8",
    "accent": "#818cf8",
    "accent-hover": "#6366f1",
    "border": "#334155",
    "success": "#34d399",
    "warning": "#fbbf24",
    "danger": "#f87171",
    "sidebar-bg": "#020617",
    "sidebar-text": "#e2e8f0"
  }
}, "light");

// config/i18n.ts
var i18n = createI18n({
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      "app.title": "Task Dashboard",
      "app.subtitle": "onefold Comprehensive Demo",
      "nav.home": "Home",
      "nav.tasks": "Tasks",
      "nav.users": "Users",
      "nav.settings": "Settings",
      "nav.analytics": "Analytics",
      "tasks.title": "Task Management",
      "tasks.add": "Add Task",
      "tasks.empty": "No tasks yet. Create your first task!",
      "tasks.total": "{count} task(s)",
      "users.title": "User Directory",
      "settings.title": "Settings",
      "settings.theme": "Theme",
      "settings.language": "Language",
      "settings.notifications": "Notifications",
      "analytics.title": "Analytics Dashboard",
      "form.name": "Name",
      "form.email": "Email",
      "form.submit": "Submit",
      "form.reset": "Reset",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.loading": "Loading...",
      "common.error": "Something went wrong"
    },
    es: {
      "app.title": "Panel de Tareas",
      "app.subtitle": "Demo Completa de onefold",
      "nav.home": "Inicio",
      "nav.tasks": "Tareas",
      "nav.users": "Usuarios",
      "nav.settings": "Configuracion",
      "nav.analytics": "Analiticas",
      "tasks.title": "Gestion de Tareas",
      "tasks.add": "Agregar Tarea",
      "tasks.empty": "Sin tareas aun. Crea tu primera tarea!",
      "tasks.total": "{count} tarea(s)",
      "users.title": "Directorio de Usuarios",
      "settings.title": "Configuracion",
      "settings.theme": "Tema",
      "settings.language": "Idioma",
      "settings.notifications": "Notificaciones",
      "analytics.title": "Panel de Analiticas",
      "form.name": "Nombre",
      "form.email": "Correo",
      "form.submit": "Enviar",
      "form.reset": "Reiniciar",
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.loading": "Cargando...",
      "common.error": "Algo salio mal"
    }
  }
});

// config/permissions.ts
var userPermissions = createSignal(
  /* @__PURE__ */ new Set(["admin", "tasks:read", "tasks:write", "users:read", "analytics:read"])
);
setPermissions(userPermissions);

// services/auth.ts
var AuthToken = createToken("AuthService");
var authUser = createSignal({ name: "Admin User", role: "admin" });
var authService = {
  user: authUser,
  login: (name, role) => authUser.set({ name, role }),
  logout: () => authUser.set(null)
};
provide(AuthToken, authService);

// services/notifications.ts
var NotifyToken = createToken("NotificationService");
var notifList = createSignal([]);
var notifService = {
  notifications: notifList,
  add: (msg) => {
    notifList.set((prev) => [...prev.slice(-4), msg]);
    announce(msg);
  },
  clear: () => notifList.set([])
};
provide(NotifyToken, notifService);

// services/observer.ts
var observer2 = createObserver();
observer2.on("navigate", (e) => {
  console.log(`[nav] ${e.from} \u2192 ${e.to}`);
});
observer2.on("error", (e) => {
  console.error("[error]", e.error, e.context);
});
observer2.on("metric", (e) => {
  console.log(`[metric] ${e.name}: ${e.value}`, e.tags);
});

// services/plugins.ts
var plugins = createPluginHost();
plugins.register({
  name: "analytics",
  version: "1.0.0",
  permissions: ["observe", "navigate"],
  setup: (ctx) => {
    ctx.on("pageview", (path) => {
      observer2.metric("pageview", 1, { path });
    });
    console.log(`[plugin] ${ctx.name} v1.0.0 loaded`);
    return () => console.log(`[plugin] ${ctx.name} unloaded`);
  }
});
plugins.register({
  name: "perf-monitor",
  version: "1.0.0",
  permissions: ["observe"],
  setup: (ctx) => {
    const start = performance.now();
    ctx.on("check", () => {
      observer2.metric("uptime", performance.now() - start);
    });
    console.log(`[plugin] ${ctx.name} v1.0.0 loaded`);
  }
});
plugins.start();

// services/devtools.ts
var devtools = enableDevtools();
devtools.on("render", (entry) => {
  const e = entry;
  if (e.duration > 5) {
    console.warn(`[perf] Slow effect: ${e.label} (${e.duration.toFixed(2)}ms)`);
  }
});

// services/store.ts
var appStore = createStore({
  tasks: [
    { id: 1, title: "Implement authentication", description: "Add JWT-based auth flow", status: "done", priority: "high", assignee: "Alice", createdAt: "2024-01-15" },
    { id: 2, title: "Design dashboard UI", description: "Create responsive layout", status: "in-progress", priority: "medium", assignee: "Bob", createdAt: "2024-01-16" },
    { id: 3, title: "Write unit tests", description: "Cover critical paths", status: "todo", priority: "high", assignee: "Charlie", createdAt: "2024-01-17" },
    { id: 4, title: "Setup CI/CD pipeline", description: "GitHub Actions workflow", status: "todo", priority: "medium", assignee: "Alice", createdAt: "2024-01-18" },
    { id: 5, title: "API documentation", description: "OpenAPI spec for all endpoints", status: "in-progress", priority: "low", assignee: "Diana", createdAt: "2024-01-19" },
    { id: 6, title: "Performance audit", description: "Lighthouse and bundle analysis", status: "todo", priority: "medium", assignee: "Bob", createdAt: "2024-01-20" }
  ],
  filter: "all",
  searchQuery: ""
});
var filteredTasks = createComputed(() => {
  const state = appStore();
  const { tasks, filter, searchQuery } = state;
  let result = tasks;
  if (filter !== "all") {
    result = result.filter((t) => t.status === filter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
    );
  }
  return result;
});
var taskStats = createComputed(() => {
  const { tasks } = appStore();
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    highPriority: tasks.filter((t) => t.priority === "high").length
  };
});
var sidebarCollapsed = createPersisted("sidebar-collapsed", false);
var preferredLocale = createPersisted("preferred-locale", "en");
var notificationsEnabled = createPersisted("notifications-enabled", true);
createEffect(() => {
  i18n.setLocale(preferredLocale());
});

// components/Sidebar.ts
function Sidebar() {
  const navItems = [
    { path: "/", icon: "\u25C9", label: () => i18n.t("nav.home") },
    { path: "/tasks", icon: "\u2630", label: () => i18n.t("nav.tasks") },
    { path: "/users", icon: "\u25CE", label: () => i18n.t("nav.users") },
    { path: "/analytics", icon: "\u25C7", label: () => i18n.t("nav.analytics") },
    { path: "/settings", icon: "\u2699", label: () => i18n.t("nav.settings") }
  ];
  return html`
    <aside class=${() => `sidebar ${sidebarCollapsed() ? "collapsed" : ""}`} role="navigation" aria-label="Main navigation">
      <div class="sidebar-header">
        <span class="sidebar-logo">◈</span>
        ${() => sidebarCollapsed() ? null : html`<h1>${() => i18n.t("app.title")}</h1>`}
      </div>
      <nav>
        ${navItems.map((item) => html`
          <button
            class=${() => `nav-item ${currentRoute() === item.path ? "active" : ""}`}
            onclick=${() => {
    navigate(item.path);
    observer2.emit("navigate", { from: currentRoute(), to: item.path });
  }}
            aria-current=${() => currentRoute() === item.path ? "page" : "false"}
          >
            <span class="icon">${item.icon}</span>
            ${() => sidebarCollapsed() ? null : html`<span>${item.label()}</span>`}
          </button>
        `)}
      </nav>
      <div class="sidebar-footer">
        ${() => sidebarCollapsed() ? null : html`
          <div class="sidebar-version">onefold v0.1.0</div>
        `}
      </div>
    </aside>
  `;
}

// components/TopBar.ts
function TopBar() {
  const auth = inject(AuthToken);
  return html`
    <header class="topbar" role="banner">
      <div class="topbar-left">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => sidebarCollapsed.set(!sidebarCollapsed())}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <span class="topbar-subtitle">${() => i18n.t("app.subtitle")}</span>
      </div>
      <div class="topbar-right">
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => theme.toggle()}
          aria-label="Toggle theme"
        >
          ${() => theme.current() === "dark" ? "\u2600" : "\u263E"}
        </button>
        <select
          class="locale-select"
          onchange=${(e) => preferredLocale.set(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        ${() => {
    const user = auth.user();
    if (!user) {
      return html`<button class="btn btn-primary btn-sm" onclick=${() => auth.login("Admin", "admin")}>Login</button>`;
    }
    return html`
            <div class="user-info">
              <div class="user-avatar-sm">${user.name.charAt(0)}</div>
              <span class="user-name">${user.name}</span>
              <button class="btn btn-ghost btn-sm" onclick=${() => auth.logout()}>Logout</button>
            </div>
          `;
  }}
      </div>
    </header>
  `;
}

// components/Notifications.ts
function NotificationToasts() {
  const notif = inject(NotifyToken);
  return html`
    <div class="notification-toast">
      ${() => notif.notifications().map((msg) => html`
        <div class="toast-item">${msg}</div>
      `)}
    </div>
  `;
}

// components/StatCard.ts
var StatCard = component({
  name: "StatCard",
  description: "Displays a single statistic with label",
  props: {
    value: { type: "string | number", required: true },
    label: { type: "string", required: true },
    color: { type: "string", required: false }
  },
  tags: ["stat", "dashboard"],
  render: ({ value, label, color }) => html`
    <div class="stat-card">
      <div class="stat-value" style=${color ? { color } : {}}>${value}</div>
      <div class="stat-label">${label}</div>
    </div>
  `
});

// pages/Home.ts
function HomePage() {
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t("app.title")}<span class="feature-badge">Signals + Store + i18n</span></h2>
      </div>

      <div class="stats-grid">
        ${() => {
    const stats = taskStats();
    return [
      StatCard({ value: stats.total, label: "Total Tasks" }),
      StatCard({ value: stats.todo, label: "To Do", color: "var(--warning)" }),
      StatCard({ value: stats.inProgress, label: "In Progress", color: "var(--accent)" }),
      StatCard({ value: stats.done, label: "Completed", color: "var(--success)" })
    ];
  }}
      </div>

      <div class="card">
        <h3>Welcome to the onefold Comprehensive Demo</h3>
        <p class="card-description">
          This application demonstrates every feature of the onefold framework
          in a realistic task management dashboard. Navigate using the sidebar to
          explore different features.
        </p>
        <div class="feature-grid">
          ${FeatureList()}
        </div>
      </div>
    </div>
  `;
}
function FeatureList() {
  const features = [
    "Signals & Reactivity",
    "HTML Templates",
    "Scoped CSS",
    "Router & Navigation",
    "Store (State)",
    "Dependency Injection",
    "HTTP Client",
    "Forms & Validation",
    "i18n",
    "Persisted State",
    "RBAC Guards",
    "Theming",
    "Observability",
    "Plugins",
    "Error Boundaries",
    "Suspense",
    "Transitions",
    "Virtual List",
    "Streaming (WS/SSE)",
    "Accessibility",
    "DevTools",
    "Component Meta"
  ];
  return html`
    ${features.map((f) => html`<div class="feature-item">${f}</div>`)}
  `;
}

// components/TaskCard.ts
var TaskCard = component({
  name: "TaskCard",
  description: "Displays a single task with status management",
  props: {
    task: { type: "Task", required: true, description: "The task object to display" },
    onStatusChange: { type: "function", required: true, description: "Status change callback" }
  },
  tags: ["task", "card"],
  render: ({ task, onStatusChange }) => {
    const nextStatus = (current) => {
      const flow = {
        "todo": "in-progress",
        "in-progress": "done",
        "done": "todo"
      };
      return flow[current];
    };
    return html`
      <div class="task-card">
        <div class="task-info">
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-meta">
            <span class=${`badge badge-${task.status}`}>${task.status}</span>
            <span class=${`badge badge-${task.priority}`}>${task.priority}</span>
            <span class="task-assignee">${task.assignee}</span>
          </div>
        </div>
        <button
          class="btn btn-ghost btn-sm"
          onclick=${() => onStatusChange(task.id, nextStatus(task.status))}
          aria-label=${`Move task "${task.title}" to ${nextStatus(task.status)}`}
        >
          Next
        </button>
      </div>
    `;
  }
});

// pages/Tasks.ts
function TasksPage() {
  const showModal = createSignal(false);
  const taskForm = createForm({
    title: { initial: "", rules: [required("Title is required"), minLength(3, "At least 3 characters")] },
    description: { initial: "", rules: [required("Description is required"), maxLength(200, "Max 200 chars")] },
    priority: { initial: "medium", rules: [required()] },
    assignee: { initial: "", rules: [required("Assignee is required")] }
  });
  const handleStatusChange = (id, newStatus) => {
    appStore.update((prev) => ({
      tasks: prev.tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t)
    }));
    const notif = inject(NotifyToken);
    notif.add(`Task status updated to "${newStatus}"`);
    observer2.emit("custom", { type: "task-status-change", payload: { id, newStatus } });
  };
  const handleAddTask = () => {
    taskForm.submit((values) => {
      const newTask = {
        id: Date.now(),
        title: values.title,
        description: values.description,
        status: "todo",
        priority: values.priority,
        assignee: values.assignee,
        createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      appStore.update((prev) => ({ tasks: [...prev.tasks, newTask] }));
      inject(NotifyToken).add(`Task "${values.title}" created`);
      taskForm.reset();
      showModal.set(false);
    });
  };
  const handleFilterChange = (filter) => {
    appStore.update({ filter });
  };
  const handleSearch = (e) => {
    appStore.update({ searchQuery: e.target.value });
  };
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t("tasks.title")}<span class="feature-badge">Forms + Store + Guards</span></h2>
        ${() => guardedNode(["tasks:write"], () => html`
          <button class="btn btn-primary" onclick=${() => showModal.set(true)}>
            + ${() => i18n.t("tasks.add")}
          </button>
        `)}
      </div>

      <div class="filter-bar">
        <input
          class="search-input"
          type="text"
          placeholder="Search tasks..."
          value=${() => appStore().searchQuery}
          oninput=${handleSearch}
          aria-label="Search tasks"
        />
        ${["all", "todo", "in-progress", "done"].map((f) => html`
          <button
            class=${() => `filter-btn ${appStore().filter === f ? "active" : ""}`}
            onclick=${() => handleFilterChange(f)}
          >
            ${f === "all" ? "All" : f}
          </button>
        `)}
        <span class="filter-count">
          ${() => i18n.t("tasks.total", { count: filteredTasks().length })}
        </span>
      </div>

      <div class="task-grid">
        ${() => {
    const tasks = filteredTasks();
    if (tasks.length === 0) {
      return html`<div class="card empty-state">
              <p>${() => i18n.t("tasks.empty")}</p>
            </div>`;
    }
    return tasks.map((task) => TaskCard({ task, onStatusChange: handleStatusChange }));
  }}
      </div>

      ${() => showModal() ? TaskFormModal(taskForm, handleAddTask, () => {
    showModal.set(false);
    taskForm.reset();
  }) : null}
    </div>
  `;
}
function TaskFormModal(form, onSubmit, onClose) {
  setTimeout(() => {
    const modal = document.querySelector(".modal");
    if (modal) {
      const trap = FocusTrap(modal);
      trap.activate();
    }
  }, 0);
  return html`
    <div class="modal-overlay" onclick=${(e) => {
    if (e.target.classList.contains("modal-overlay")) onClose();
  }}>
      <div class="modal">
        <h2>${() => i18n.t("tasks.add")}</h2>

        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" type="text" value=${() => form.fields.title.value()} oninput=${form.fields.title.handle} placeholder="Task title..." />
          <div class="form-error">${() => form.fields.title.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input" rows="3" value=${() => form.fields.description.value()} oninput=${form.fields.description.handle} placeholder="Task description..."></textarea>
          <div class="form-error">${() => form.fields.description.error()}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="form-select" onchange=${form.fields.priority.handle}>
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Assignee</label>
          <input class="form-input" type="text" value=${() => form.fields.assignee.value()} oninput=${form.fields.assignee.handle} placeholder="Assignee name..." />
          <div class="form-error">${() => form.fields.assignee.error()}</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick=${onClose}>${() => i18n.t("common.cancel")}</button>
          <button class="btn btn-primary" onclick=${onSubmit}>${() => i18n.t("form.submit")}</button>
        </div>
      </div>
    </div>
  `;
}

// services/http.ts
var http = createHttpClient({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: { "Accept": "application/json" },
  interceptors: [
    {
      request: (config) => {
        const user = authService.user.peek();
        if (user) {
          config.headers["X-User"] = user.name;
        }
        observer2.log("info", `HTTP ${config.method} ${config.url}`);
        return config;
      },
      response: (res) => {
        observer2.metric("http.response", res.status, { url: res.config.url });
        return res;
      }
    }
  ]
});

// pages/Users.ts
function UsersPage() {
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t("users.title")}<span class="feature-badge">Resource + ErrorBoundary + VirtualList</span></h2>
      </div>

      ${ErrorBoundary(
    () => UsersContent(),
    (error, retry) => html`
          <div class="card empty-state">
            <p class="error-text">${() => i18n.t("common.error")}: ${error.message}</p>
            <button class="btn btn-primary" onclick=${retry}>Retry</button>
          </div>
        `
  )}
    </div>
  `;
}
function UsersContent() {
  const users = createResource(
    () => "users",
    async () => {
      const response = await http.get("/users");
      return response.data;
    }
  );
  return html`
    <div>
      ${() => {
    if (users.loading()) {
      return html`<div class="card empty-state"><p>${() => i18n.t("common.loading")}</p></div>`;
    }
    if (users.error()) {
      return html`<div class="card empty-state">
            <p class="error-text">Failed to load users</p>
            <button class="btn btn-primary" onclick=${() => users.refetch()}>Retry</button>
          </div>`;
    }
    const data = users.data();
    if (!data) return html`<p>No data</p>`;
    return html`
          <div class="user-grid">
            ${data.map((user) => html`
              <div class="user-card">
                <div class="user-avatar">${user.name.charAt(0)}</div>
                <div class="user-details">
                  <div class="user-name">${user.name}</div>
                  <div class="user-email">${user.email}</div>
                  <div class="user-company">${user.company.name}</div>
                </div>
              </div>
            `)}
          </div>

          <div class="virtual-list-section">
            <h3>Virtual List Demo (1000 items, windowed)
              <span class="feature-badge">VirtualList</span>
            </h3>
            ${VirtualListDemo()}
          </div>
        `;
  }}
    </div>
  `;
}
function VirtualListDemo() {
  const items = createSignal(
    Array.from({ length: 1e3 }, (_, i) => ({
      id: i + 1,
      name: `Item #${i + 1} \u2014 ${["Alpha", "Beta", "Gamma", "Delta", "Epsilon"][i % 5]}`,
      value: Math.round(Math.random() * 1e4) / 100
    }))
  );
  return VirtualList({
    items,
    itemHeight: 40,
    height: 300,
    overscan: 4,
    renderRow: (item) => html`
      <div class="virtual-row">
        <span class="virtual-row-id">#${item.id}</span>
        <span class="virtual-row-name">${item.name}</span>
        <span class="virtual-row-value">$${item.value.toFixed(2)}</span>
      </div>
    `
  });
}

// pages/Analytics.ts
function AnalyticsPage() {
  const activeTab = createSignal("overview");
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t("analytics.title")}<span class="feature-badge">Suspense + Transition + DevTools</span></h2>
      </div>

      <div class="filter-bar">
        ${["overview", "performance", "plugins"].map((tab) => html`
          <button
            class=${() => `filter-btn ${activeTab() === tab ? "active" : ""}`}
            onclick=${() => activeTab.set(tab)}
          >
            ${tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        `)}
      </div>

      ${Transition(
    () => {
      const tab = activeTab();
      if (tab === "overview") return AnalyticsOverview();
      if (tab === "performance") return PerformanceTab();
      return PluginsTab();
    },
    {
      enterFrom: { opacity: "0", transform: "translateY(8px)" },
      enterTo: { opacity: "1", transform: "translateY(0)" },
      leaveTo: { opacity: "0", transform: "translateY(-8px)" },
      duration: 200,
      mode: "out-in"
    }
  )}
    </div>
  `;
}
function AnalyticsOverview() {
  return Suspense(
    async () => {
      const response = await http.get("/todos?_limit=20");
      const todos = response.data;
      const completed = todos.filter((t) => t.completed).length;
      const pending = todos.length - completed;
      return html`
        <div>
          <div class="stats-grid">
            ${StatCard({ value: todos.length, label: "Total Items Fetched" })}
            ${StatCard({ value: completed, label: "Completed", color: "var(--success)" })}
            ${StatCard({ value: pending, label: "Pending", color: "var(--warning)" })}
            ${StatCard({ value: `${Math.round(completed / todos.length * 100)}%`, label: "Completion Rate", color: "var(--accent)" })}
          </div>
          <div class="card">
            <h3>Remote Data (JSONPlaceholder API) <span class="feature-badge">HTTP Client</span></h3>
            <div class="todo-list">
              ${todos.map((todo) => html`
                <div class="todo-item">
                  <span class=${todo.completed ? "todo-check done" : "todo-check"}>
                    ${todo.completed ? "\u2713" : "\u25CB"}
                  </span>
                  <span class=${todo.completed ? "todo-text completed" : "todo-text"}>${todo.title}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      `;
    },
    {
      fallback: () => html`
        <div class="card empty-state">
          <p>Loading analytics data...</p>
          <div class="spinner"></div>
        </div>
      `,
      onError: (err) => html`
        <div class="card empty-state">
          <p class="error-text">Failed to load analytics: ${err.message}</p>
        </div>
      `
    }
  );
}
function PerformanceTab() {
  const stats = devtools.stats();
  console.log("stats", stats);
  return html`
    <div>
      <div class="stats-grid">
        ${StatCard({ value: stats.totalRenders, label: "Total Renders" })}
        ${StatCard({ value: stats.avgDuration.toFixed(2) + "ms", label: "Avg Duration" })}
        ${StatCard({ value: stats.slowestRender ? stats.slowestRender.duration.toFixed(2) + "ms" : "N/A", label: "Slowest Render" })}
        ${StatCard({ value: stats.totalErrors, label: "Total Errors" })}
      </div>

      <div class="card">
        <h3>DevTools Performance Data <span class="feature-badge">DevTools</span></h3>
        <p class="card-description">
          The devtools hook monitors every effect execution. Connect to APM via the observer.
        </p>
        <button class="btn btn-ghost" onclick=${() => {
    devtools.clear();
    inject(NotifyToken).add("DevTools data cleared");
  }}>Clear Stats</button>
      </div>

      <div class="card section-gap">
        <h3>Observability Events <span class="feature-badge">Observer</span></h3>
        <p class="card-description">
          Check the browser console to see structured events being emitted.
        </p>
        <div class="btn-row">
          <button class="btn btn-ghost btn-sm" onclick=${() => observer2.emit("navigate", { from: "/analytics", to: "/test" })}>Emit Navigate</button>
          <button class="btn btn-ghost btn-sm" onclick=${() => observer2.metric("test-metric", Math.random() * 100)}>Emit Metric</button>
          <button class="btn btn-ghost btn-sm" onclick=${() => observer2.log("info", "Test log message", { source: "analytics" })}>Emit Log</button>
        </div>
      </div>
    </div>
  `;
}
function PluginsTab() {
  return html`
    <div>
      <div class="card">
        <h3>Plugin System <span class="feature-badge">Plugins</span></h3>
        <p class="card-description">
          Plugins extend onefold with isolated lifecycle management and permissions.
        </p>
        <div class="plugin-list">
          ${plugins.list().map((name) => html`
            <div class="plugin-item">
              <div class="plugin-info">
                <span class="plugin-name">${name}</span>
                <span class="badge badge-done">${plugins.getStatus(name)}</span>
              </div>
              <div class="btn-row">
                <button class="btn btn-ghost btn-sm" onclick=${() => {
    plugins.stopPlugin(name);
    inject(NotifyToken).add(`Plugin "${name}" stopped`);
  }}>Stop</button>
                <button class="btn btn-ghost btn-sm" onclick=${() => {
    plugins.startPlugin(name);
    inject(NotifyToken).add(`Plugin "${name}" started`);
  }}>Start</button>
              </div>
            </div>
          `)}
        </div>
      </div>

      <div class="card section-gap">
        <h3>Security Features <span class="feature-badge">Security</span></h3>
        <p class="card-description">
          onefold uses textContent by default. The raw() function provides sanitized HTML.
        </p>
        <div class="code-block">
          ${raw("<strong>This is sanitized HTML via raw()</strong> \u2014 safe to use")}
        </div>
        <div class="code-block">
          XSS attempt (auto-escaped): ${'<script>alert("xss")<\/script>'}
        </div>
      </div>

      <div class="card section-gap">
        <h3>RBAC Guards <span class="feature-badge">Guards</span></h3>
        <p class="card-description">
          Permission-based access control. Current: admin, tasks:read/write, users:read, analytics:read
        </p>
        <div class="badge-row">
          ${() => guardedNode(["admin"], () => html`<span class="badge badge-done">Admin Access</span>`)}
          ${() => guardedNode(["tasks:write"], () => html`<span class="badge badge-done">Tasks Write</span>`)}
          ${() => guardedNode(
    ["billing:manage"],
    () => html`<span class="badge badge-high">Billing</span>`,
    () => html`<span class="badge badge-todo">Billing (no access)</span>`
  )}
        </div>
        <p class="card-description">
          hasPermission('admin'): ${() => hasPermission("admin") ? "true" : "false"} |
          hasAnyPermission(['billing:manage','admin']): ${() => hasAnyPermission(["billing:manage", "admin"]) ? "true" : "false"}
        </p>
      </div>
    </div>
  `;
}

// pages/Settings.ts
function SettingsPage() {
  const contactForm = createForm({
    name: { initial: "", rules: [required("Name is required"), minLength(2)] },
    contactEmail: { initial: "", rules: [required("Email is required"), email("Invalid email format")] },
    bio: { initial: "", rules: [maxLength(500, "Bio must be under 500 characters")] }
  });
  return html`
    <div>
      <div class="page-header">
        <h2>${() => i18n.t("settings.title")}<span class="feature-badge">Persist + Theme + i18n + Forms</span></h2>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="settings-section">
            <h3>${() => i18n.t("settings.theme")}</h3>
            <div class="setting-row">
              <span>Dark Mode</span>
              <button
                class=${() => `toggle ${theme.current() === "dark" ? "on" : ""}`}
                onclick=${() => theme.toggle()}
                aria-label="Toggle dark mode"
                role="switch"
                aria-checked=${() => theme.current() === "dark" ? "true" : "false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Current Theme</span>
              <span class="setting-value">${() => theme.current()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${() => i18n.t("settings.language")}</h3>
            <div class="setting-row">
              <span>Locale</span>
              <select class="form-select inline-select"
                onchange=${(e) => preferredLocale.set(e.target.value)}
              >
                <option value="en" selected>English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div class="setting-row">
              <span>Active Locale</span>
              <span class="setting-value">${() => i18n.locale()}</span>
            </div>
          </div>

          <div class="settings-section">
            <h3>${() => i18n.t("settings.notifications")}</h3>
            <div class="setting-row">
              <span>Enable Notifications</span>
              <button
                class=${() => `toggle ${notificationsEnabled() ? "on" : ""}`}
                onclick=${() => notificationsEnabled.set(!notificationsEnabled())}
                aria-label="Toggle notifications"
                role="switch"
                aria-checked=${() => notificationsEnabled() ? "true" : "false"}
              ></button>
            </div>
            <div class="setting-row">
              <span>Sidebar Collapsed</span>
              <button
                class=${() => `toggle ${sidebarCollapsed() ? "on" : ""}`}
                onclick=${() => sidebarCollapsed.set(!sidebarCollapsed())}
                aria-label="Toggle sidebar"
                role="switch"
                aria-checked=${() => sidebarCollapsed() ? "true" : "false"}
              ></button>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Profile Form <span class="feature-badge">Form Validation</span></h3>
          <div class="form-body">
            <div class="form-group">
              <label class="form-label">${() => i18n.t("form.name")}</label>
              <input class="form-input" type="text" value=${() => contactForm.fields.name.value()} oninput=${contactForm.fields.name.handle} placeholder="Your name" />
              <div class="form-error">${() => contactForm.fields.name.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">${() => i18n.t("form.email")}</label>
              <input class="form-input" type="email" value=${() => contactForm.fields.contactEmail.value()} oninput=${contactForm.fields.contactEmail.handle} placeholder="your@email.com" />
              <div class="form-error">${() => contactForm.fields.contactEmail.error()}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-input" rows="4" value=${() => contactForm.fields.bio.value()} oninput=${contactForm.fields.bio.handle} placeholder="Tell us about yourself..."></textarea>
              <div class="form-error">${() => contactForm.fields.bio.error()}</div>
            </div>
            <div class="btn-row">
              <button class="btn btn-primary" onclick=${() => contactForm.submit((vals) => {
    inject(NotifyToken).add(`Profile saved for ${vals.name}`);
    announce("Profile saved successfully");
  })}>${() => i18n.t("common.save")}</button>
              <button class="btn btn-ghost" onclick=${() => contactForm.reset()}>${() => i18n.t("form.reset")}</button>
            </div>
            <p class="form-status">
              Form valid: ${() => contactForm.valid() ? "Yes" : "No"} |
              Dirty: ${() => contactForm.dirty() ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// pages/NotFound.ts
function NotFoundPage() {
  return html`
    <div class="card empty-state">
      <h2 class="error-code">404</h2>
      <p class="error-text">Page not found</p>
      <button class="btn btn-primary" onclick=${() => navigate("/")}>Go Home</button>
    </div>
  `;
}
function AccessDeniedPage() {
  return html`
    <div class="card empty-state">
      <h2 class="access-denied-title">Access Denied</h2>
      <p class="error-text">You don't have permission to view this page.</p>
      <button class="btn btn-primary" onclick=${() => navigate("/")}>Go Home</button>
    </div>
  `;
}

// main.ts
var appStyles = css`
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--app-bg);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
  }

  .sidebar {
    width: 260px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    transition: width 0.3s;
    overflow: hidden;
  }
  .sidebar.collapsed { width: 60px; }
  .sidebar-header {
    padding: 0 20px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sidebar-header h1 { font-size: 18px; white-space: nowrap; }
  .sidebar-logo { font-size: 24px; }
  .sidebar-footer { margin-top: auto; padding: 12px 20px; }
  .sidebar-version { font-size: 11px; color: rgba(255,255,255,0.5); }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--sidebar-text);
    text-decoration: none;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-size: 14px;
  }
  .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.1); }
  .nav-item .icon { width: 20px; text-align: center; flex-shrink: 0; }

  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .topbar {
    height: 60px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .topbar-subtitle { font-size: 14px; color: var(--text-secondary); }
  .locale-select {
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 12px;
  }
  .user-info { display: flex; align-items: center; gap: 8px; }
  .user-avatar-sm {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px;
  }
  .user-name { font-size: 13px; }

  .content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost { background: transparent; color: var(--text-primary); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--border); }
  .btn-danger { background: var(--danger); color: white; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-row { display: flex; gap: 12px; }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
  }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .card-description { margin-top: 12px; color: var(--text-secondary); font-size: 13px; }
  .section-gap { margin-top: 16px; }

  .badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-todo { background: #dbeafe; color: #1e40af; }
  .badge-in-progress { background: #fef3c7; color: #92400e; }
  .badge-done { background: #d1fae5; color: #065f46; }
  .badge-high { background: #fee2e2; color: #991b1b; }
  .badge-medium { background: #fef3c7; color: #92400e; }
  .badge-low { background: #d1fae5; color: #065f46; }
  .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

  .notification-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .toast-item {
    background: var(--card-bg);
    border: 1px solid var(--border);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
    font-size: 14px;
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .stat-value { font-size: 32px; font-weight: 700; color: var(--accent); }
  .stat-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

  .task-grid { display: grid; gap: 12px; }
  .task-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  .task-card:hover { border-color: var(--accent); transform: translateY(-1px); }
  .task-info { flex: 1; }
  .task-title { font-weight: 600; margin-bottom: 4px; }
  .task-desc { font-size: 13px; color: var(--text-secondary); }
  .task-meta { display: flex; gap: 8px; margin-top: 8px; }
  .task-assignee { font-size: 12px; color: var(--text-secondary); }

  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .filter-btn {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .filter-count { margin-left: auto; font-size: 13px; color: var(--text-secondary); }
  .search-input {
    padding: 8px 14px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    width: 240px;
    transition: all 0.2s;
  }
  .search-input:focus { outline: none; border-color: var(--accent); width: 300px; }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .modal h2 { margin-bottom: 20px; font-size: 20px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }

  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); }
  .form-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .form-error { color: var(--danger); font-size: 12px; margin-top: 4px; min-height: 16px; }
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-primary);
    font-size: 14px;
  }
  .inline-select { width: auto; }
  .form-body { margin-top: 16px; }
  .form-status { margin-top: 12px; font-size: 12px; color: var(--text-secondary); }

  .user-grid { display: grid; gap: 12px; }
  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .user-avatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 18px;
  }
  .user-details { flex: 1; }
  .user-name { font-weight: 600; }
  .user-email { font-size: 13px; color: var(--text-secondary); }
  .user-company { font-size: 12px; color: var(--text-secondary); }

  .virtual-list-section { margin-top: 24px; }
  .virtual-list-section h3 { margin-bottom: 12px; }
  .virtual-row {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .virtual-row-id { width: 60px; color: var(--text-secondary); }
  .virtual-row-name { flex: 1; font-weight: 500; }
  .virtual-row-value { width: 100px; text-align: right; color: var(--accent); }

  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .settings-section { margin-bottom: 24px; }
  .settings-section h3 { margin-bottom: 12px; font-size: 16px; }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .setting-value { color: var(--accent); font-weight: 600; }
  .toggle {
    width: 44px; height: 24px;
    border-radius: 12px;
    background: var(--border);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    border: none;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: '';
    width: 20px; height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px; left: 2px;
    transition: transform 0.2s;
  }
  .toggle.on::after { transform: translateX(20px); }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .page-header h2 { font-size: 24px; font-weight: 700; }
  .feature-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    background: var(--accent);
    color: white;
    margin-left: 8px;
    vertical-align: middle;
  }
  .feature-grid { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; }
  .feature-item { padding: 8px 12px; background: var(--app-bg); border-radius: 6px; font-size: 13px; border: 1px solid var(--border); }

  .empty-state { text-align: center; padding: 40px; }
  .error-text { color: var(--danger); }
  .error-code { font-size: 48px; color: var(--text-secondary); }
  .access-denied-title { font-size: 32px; color: var(--danger); }

  .todo-list { margin-top: 12px; max-height: 300px; overflow-y: auto; }
  .todo-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .todo-check { font-size: 16px; color: var(--text-secondary); }
  .todo-check.done { color: var(--success); }
  .todo-text.completed { text-decoration: line-through; color: var(--text-secondary); }

  .code-block { margin-top: 8px; padding: 12px; background: var(--app-bg); border-radius: 8px; font-family: monospace; font-size: 13px; }

  .plugin-list { margin-top: 16px; }
  .plugin-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .plugin-info { display: flex; align-items: center; gap: 8px; }
  .plugin-name { font-weight: 600; }

  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 12px auto 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
function App() {
  useKeyboard({
    "Escape": () => announce("Modal closed"),
    "Ctrl+K": () => {
      const search = document.querySelector(".search-input");
      if (search) search.focus();
      announce("Search focused");
    }
  });
  const router = Router(
    [
      { path: "/", view: () => HomePage() },
      { path: "/tasks", view: guard(["tasks:read"], () => TasksPage(), () => AccessDeniedPage()) },
      { path: "/users", view: guard(["users:read"], () => UsersPage(), () => AccessDeniedPage()) },
      { path: "/analytics", view: guard(["analytics:read"], () => AnalyticsPage(), () => AccessDeniedPage()) },
      { path: "/settings", view: () => SettingsPage() }
    ],
    () => NotFoundPage()
  );
  return html`
    <div class=${appStyles.scope}>
      ${SkipLink("#main-content")}
      ${NotificationToasts()}
      <div class="app-shell">
        ${Sidebar()}
        <div class="main-area">
          ${TopBar()}
          <main class="content" id="main-content" role="main">
            ${router}
          </main>
        </div>
      </div>
    </div>
  `;
}
mount(App(), document.getElementById("app"));
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
console.log(" onefold Comprehensive Demo");
console.log(" Features: 22+");
console.log(" DevTools:", devtools.active ? "enabled" : "disabled");
console.log(" Plugins:", plugins.list().join(", "));
console.log(" Theme:", theme.current());
console.log(" Locale:", i18n.locale());
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
