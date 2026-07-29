// dist/core/extend.js
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

// dist/core/signal.js
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

// dist/security/sanitize.js
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

// dist/core/dom.js
function mount(node, container) {
  container.replaceChildren(node);
}

// dist/core/lifecycle.js
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

// dist/core/template.js
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

// dist/core/css.js
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

// dist/router/router.js
var _currentPath = null;
var _useHash = null;
function useHash() {
  if (_useHash === null) {
    _useHash = typeof window !== "undefined" && window.location.protocol === "file:";
  }
  return _useHash;
}
function readPath() {
  if (typeof window === "undefined")
    return "/";
  if (useHash())
    return window.location.hash.slice(1) || "/";
  return window.location.pathname;
}
function getPathSignal() {
  if (_currentPath)
    return _currentPath;
  _currentPath = createSignal(readPath());
  if (typeof window !== "undefined") {
    const event = useHash() ? "hashchange" : "popstate";
    window.addEventListener(event, () => _currentPath.set(readPath()));
  }
  return _currentPath;
}
function navigate(path) {
  if (typeof window === "undefined")
    return;
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
function matchExact(pattern, path) {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  if (patternParts.length !== pathParts.length)
    return null;
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
function matchPrefix(pattern, path) {
  if (pattern === "/") {
    return {};
  }
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (pathParts.length < patternParts.length)
    return null;
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
  if (!parent || parent === "/")
    return child;
  if (child === "/")
    return parent;
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
      if (handler)
        view = handler();
    }
    container.textContent = "";
    container.appendChild(view ?? notFound());
  });
  disposeOnRemove(container, dispose);
  return container;
}
function Link(href, child, className) {
  const el = document.createElement("a");
  if (isUnsafeUrl(href)) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(`[onefold] Blocked unsafe URL in Link: "${href}"`);
    }
  } else {
    el.setAttribute("href", useHash() ? `#${href}` : href);
  }
  if (className) {
    if (typeof className === "function") {
      const dispose = createEffect(() => {
        el.className = className();
      });
      disposeOnRemove(el, dispose);
    } else {
      el.className = className;
    }
  }
  el.addEventListener("click", (e) => {
    e.preventDefault();
    navigate(href);
  });
  if (typeof child === "string") {
    el.textContent = child;
  } else {
    el.appendChild(child);
  }
  return el;
}

// examples/blog-app/pages/Home.ts
var FEATURED_POSTS = [
  { id: 1, title: "Getting Started with Nanoframe", excerpt: "Learn how to build reactive UIs with zero dependencies and fine-grained signals.", date: "2026-07-01" },
  { id: 2, title: "Signals vs Virtual DOM", excerpt: "Why fine-grained reactivity outperforms diffing on update-heavy workloads.", date: "2026-06-28" },
  { id: 3, title: "Building a Router from Scratch", excerpt: "Client-side routing with the History API in under 50 lines of TypeScript.", date: "2026-06-20" },
  { id: 4, title: "The html`` Tagged Template", excerpt: "Write templates that look like HTML with full reactive bindings \u2014 no compiler needed.", date: "2026-06-15" }
];
function HomePage(_params) {
  return html`
    <div class="page">
      <section class="hero-section">
        <h1>Nanoframe Blog</h1>
        <p class="hero-subtitle">Exploring modern web development with fine-grained reactivity</p>
      </section>

      <section class="posts-section">
        <h2>Recent Posts</h2>
        <div class="post-list">
          ${FEATURED_POSTS.map(
    (post) => html`
              <article class="post-card">
                <span class="post-date">${post.date}</span>
                <h3>${Link(`/posts/${post.id}`, post.title, "post-link")}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
              </article>
            `
  )}
        </div>
      </section>
    </div>
  `;
}

// examples/blog-app/pages/About.ts
function AboutPage(_params) {
  return html`
    <div class="page">
      <h1>About</h1>
      <p class="about-intro">
        This is a demo blog app built with <strong>onefold</strong> to showcase client-side routing
        with dynamic parameters, navigation links, and page transitions — all in under 5kb of framework code.
      </p>

      <h2>Features Demonstrated</h2>
      <ul class="feature-list">
        <li><strong>Router</strong> — pattern-based route matching with dynamic <code>:id</code> params</li>
        <li><strong>Link</strong> — SPA navigation without full page reloads</li>
        <li><strong>html template</strong> — declarative markup with reactive bindings</li>
        <li><strong>currentRoute()</strong> — reactive route signal for active nav highlighting</li>
        <li><strong>navigate()</strong> — programmatic navigation from JS</li>
      </ul>

      <h2>How the Routing Works</h2>
      <pre><code>import { Router, Link, navigate } from 'onefold';

// Define routes with patterns
const app = Router([
  { path: '/', view: () => HomePage() },
  { path: '/about', view: () => AboutPage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], () => NotFoundPage());

// Link component for declarative navigation
Link('/about', 'About Us')

// Programmatic navigation
navigate('/posts/3');</code></pre>

      <p>${Link("/", "\u2190 Back to Home", "btn")}</p>
    </div>
  `;
}

// examples/blog-app/pages/Post.ts
var POSTS = {
  "1": {
    id: 1,
    title: "Getting Started with Nanoframe",
    date: "2026-07-01",
    author: "Core Team",
    content: `
      <p>Nanoframe is a tiny, dependency-free TypeScript UI library. It uses fine-grained
      reactive signals bound directly to real DOM nodes \u2014 no virtual DOM, no diffing.</p>
      <h3>Installation</h3>
      <pre><code>npm install onefold</code></pre>
      <h3>Your First Component</h3>
      <p>A component is just a function that returns a DOM Node. Use the html tagged template
      to write markup naturally:</p>
      <pre><code>import { createSignal, html, mount } from 'onefold';

function Counter() {
  const count = createSignal(0);
  return html\`
    &lt;button onclick=\${() => count.set(c => c + 1)}&gt;
      Clicked \${() => count()} times
    &lt;/button&gt;
  \`;
}

mount(Counter(), document.getElementById('app')!);</code></pre>
      <p>That's it. No build step required, no CLI to learn, no configuration files.</p>
    `
  },
  "2": {
    id: 2,
    title: "Signals vs Virtual DOM",
    date: "2026-06-28",
    author: "Core Team",
    content: `
      <p>Virtual DOM frameworks (React, Vue 2) re-render an entire component subtree, diff
      the old and new virtual trees, then patch the real DOM. This is O(tree size) per update.</p>
      <p>Signal-based frameworks (Solid, Svelte 5, onefold) wire each piece of state directly
      to the DOM node that reads it. An update is O(1) \u2014 only the exact node changes.</p>
      <h3>When does it matter?</h3>
      <p>For simple apps, both approaches are fast enough. The difference shows up in:</p>
      <ul>
        <li>Large tables with frequent cell updates</li>
        <li>Real-time dashboards with many independent data streams</li>
        <li>Animations driven by state changes</li>
      </ul>
      <p>In these scenarios, skipping the diff step entirely means consistently smooth 60fps.</p>
    `
  },
  "3": {
    id: 3,
    title: "Building a Router from Scratch",
    date: "2026-06-20",
    author: "Core Team",
    content: `
      <p>A client-side router needs three things:</p>
      <ol>
        <li>A way to intercept navigation (History API)</li>
        <li>A way to match URLs to views (pattern matching)</li>
        <li>A way to reactively swap the current view (signals)</li>
      </ol>
      <p>Nanoframe's router supports both exact paths and dynamic parameters:</p>
      <pre><code>Router([
  { path: '/', view: () => HomePage() },
  { path: '/posts/:id', view: (params) => PostPage(params) },
], NotFoundPage);</code></pre>
      <p>The Link component intercepts clicks and calls navigate() for seamless SPA behavior.</p>
    `
  },
  "4": {
    id: 4,
    title: "The html`` Tagged Template",
    date: "2026-06-15",
    author: "Core Team",
    content: `
      <p>Instead of nested h() calls, use the html tagged template literal for a syntax that
      reads like actual HTML:</p>
      <pre><code>html\`
  &lt;div class="card"&gt;
    &lt;h2&gt;\${() => title()}&lt;/h2&gt;
    &lt;button onclick=\${handleClick}&gt;Click me&lt;/button&gt;
  &lt;/div&gt;
\`</code></pre>
      <p>It supports everything h() does: reactive attributes, event handlers, refs, directives,
      class objects, style objects, nested templates, and arrays of nodes.</p>
      <p>The security model is identical \u2014 text always goes through textContent, never innerHTML.</p>
    `
  }
};
function PostPage(params) {
  const post = POSTS[params.id ?? ""];
  if (!post) {
    return html`
      <div class="page">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        ${Link("/", "Back to Home", "btn")}
      </div>
    `;
  }
  return html`
    <div class="page">
      <article class="post-full">
        <div class="post-header">
          ${Link("/", "\u2190 Back to all posts", "back-link")}
          <h1>${post.title}</h1>
          <div class="post-meta">
            <span>${post.author}</span> · <span>${post.date}</span>
          </div>
        </div>
        <div class="post-body">
          ${() => {
    const el = document.createElement("div");
    el.innerHTML = post.content;
    return el;
  }}
        </div>
      </article>
    </div>
  `;
}

// examples/blog-app/pages/Styling.ts
var page = css`
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
function StylingPage(_params) {
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

      <div style=${{ marginTop: "32px" }}>
        ${Link("/", "\u2190 Back to Home", "btn")}
      </div>
    </div>
  `;
}
var counterStyles = css`
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
function CounterCard() {
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
var themeStyles = css`
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
var THEMES = [
  { name: "Indigo", border: "#6366f1", bg: "rgba(99,102,241,0.08)", color: "#6366f1" },
  { name: "Emerald", border: "#10b981", bg: "rgba(16,185,129,0.08)", color: "#10b981" },
  { name: "Amber", border: "#f59e0b", bg: "rgba(245,158,11,0.08)", color: "#f59e0b" },
  { name: "Rose", border: "#f43f5e", bg: "rgba(244,63,94,0.08)", color: "#f43f5e" }
];
function ThemeSwitcher() {
  const idx = createSignal(0);
  const theme = () => THEMES[idx() % THEMES.length];
  const next = () => idx.set((i) => (i + 1) % THEMES.length);
  return html`
    <div class=${themeStyles.scope}>
      <div class="card">
        <h2>2. Dynamic Styles (Reactive)</h2>
        <p class="desc">Use <code>style=\${() => ({...})}</code> for reactive inline styles driven by signals.</p>
        <div class="preview" style=${() => ({
    borderColor: theme().border,
    backgroundColor: theme().bg
  })}>
          <p class="label" style=${() => ({ color: theme().color })}>${() => theme().name}</p>
          <p>Border and background react to signal changes</p>
        </div>
        <button onclick=${next}>Next Theme</button>
      </div>
    </div>
  `;
}
var textStyles = css`
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
function TextFormatter() {
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
    highlight: highlight()
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
var sliderStyles = css`
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
function StyleObjectDemo() {
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
    transition: "all 0.15s ease"
  })}></div>
        </div>
        <div class="sliders">
          <label>Size: ${() => `${size()}px`}
            <input type="range" min="24" max="120" value="48"
              oninput=${(e) => size.set(Number(e.target.value))} />
          </label>
          <label>Rotation: ${() => `${rotation()}\xB0`}
            <input type="range" min="0" max="360" value="0"
              oninput=${(e) => rotation.set(Number(e.target.value))} />
          </label>
          <label>Hue: ${() => String(hue())}
            <input type="range" min="0" max="360" value="250"
              oninput=${(e) => hue.set(Number(e.target.value))} />
          </label>
        </div>
      </div>
    </div>
  `;
}
var badgeStyles = css`
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
function Badge(label, color) {
  return html`<span class="badge" style=${{ backgroundColor: color }}>${label}</span>`;
}
function BadgeShowcase() {
  return html`
    <div class=${badgeStyles.scope}>
      <div class="card">
        <h2>5. Reusable Styled Components</h2>
        <p class="desc">Define styles once, use the component anywhere. The .badge class is scoped — won't leak.</p>
        <div class="row">
          ${Badge("Success", "#22c55e")}
          ${Badge("Warning", "#eab308")}
          ${Badge("Error", "#ef4444")}
          ${Badge("Info", "#3b82f6")}
          ${Badge("Neutral", "#6b7280")}
        </div>
      </div>
    </div>
  `;
}
var codeStyles = css`
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
function CodeExample() {
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

// examples/blog-app/pages/NotFound.ts
function NotFoundPage() {
  return html`
    <div class="page not-found">
      <h1>404</h1>
      <p>Page not found. The route you visited doesn't match any defined pattern.</p>
      ${Link("/", "Go Home", "btn")}
    </div>
  `;
}

// examples/blog-app/main.ts
function NavBar() {
  return html`
    <nav class="navbar">
      <div class="nav-brand">
        ${Link("/", "onefold blog", "brand-link")}
      </div>
      <div class="nav-links">
        ${Link("/", "Home", () => currentRoute() === "/" ? "nav-link active" : "nav-link")}
        ${Link("/styling", "Styling", () => currentRoute() === "/styling" ? "nav-link active" : "nav-link")}
        ${Link("/about", "About", () => currentRoute() === "/about" ? "nav-link active" : "nav-link")}
      </div>
    </nav>
  `;
}
function App() {
  const router = Router(
    [
      { path: "/", view: (params) => HomePage(params) },
      { path: "/about", view: (params) => AboutPage(params) },
      { path: "/styling", view: (params) => StylingPage(params) },
      { path: "/posts/:id", view: (params) => PostPage(params) }
    ],
    NotFoundPage
  );
  return html`
    <div class="app-shell">
      ${NavBar()}
      <main class="main-content">
        ${router}
      </main>
      <footer class="footer">
        <p>Built with onefold — fine-grained signals · real DOM · zero dependencies</p>
      </footer>
    </div>
  `;
}
mount(App(), document.getElementById("app"));
