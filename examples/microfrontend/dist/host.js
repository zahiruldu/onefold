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

// ../../dist/core/dom.js
function mount(node, container) {
  container.replaceChildren(node);
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

// ../../dist/core/remote.js
var securityConfig = {};
function validateOrigin(url) {
  const trusted = securityConfig.trustedOrigins;
  if (!trusted || trusted.length === 0)
    return;
  let origin;
  try {
    origin = new URL(url).origin;
  } catch {
    throw new Error(`[onefold:security] Invalid remote URL: ${url}`);
  }
  if (!trusted.includes(origin)) {
    throw new Error(`[onefold:security] Blocked untrusted origin "${origin}". Trusted origins: ${trusted.join(", ")}. Add it to configureSecurity({ trustedOrigins: [...] }) if this is intentional.`);
  }
}
async function fetchWithIntegrity(url, integrity, timeoutMs) {
  const controller = new AbortController();
  const timeout = timeoutMs ?? securityConfig.timeout ?? 1e4;
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: "omit",
      // Never send cookies to remote origins
      mode: "cors"
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const source = await response.text();
    if (integrity) {
      const valid = await verifySRI(source, integrity);
      if (!valid) {
        throw new Error(`[onefold:security] Integrity check FAILED for "${url}". The remote code has been tampered with or the hash is outdated.`);
      }
    }
    return source;
  } finally {
    clearTimeout(timer);
  }
}
async function verifySRI(source, integrity) {
  const match = /^(sha256|sha384|sha512)-(.+)$/.exec(integrity);
  if (!match)
    return false;
  const algorithm = match[1];
  const expectedHash = match[2];
  const encoder = new TextEncoder();
  const data = encoder.encode(source);
  const hashAlgo = algorithm === "sha256" ? "SHA-256" : algorithm === "sha384" ? "SHA-384" : "SHA-512";
  const hashBuffer = await crypto.subtle.digest(hashAlgo, data);
  const hashArray = new Uint8Array(hashBuffer);
  const actualHash = btoa(String.fromCharCode(...hashArray));
  return actualHash === expectedHash;
}
var moduleCache = /* @__PURE__ */ new Map();
async function loadModuleSecure(url, integrity, timeoutMs) {
  const cacheKey = `${url}#${integrity ?? "no-sri"}`;
  if (moduleCache.has(cacheKey))
    return moduleCache.get(cacheKey);
  const promise = (async () => {
    if (integrity || securityConfig.requireIntegrity) {
      if (securityConfig.requireIntegrity && !integrity) {
        throw new Error(`[onefold:security] Integrity hash required for "${url}". Provide an integrity option or disable requireIntegrity.`);
      }
      const source = await fetchWithIntegrity(url, integrity, timeoutMs);
      const blob = new Blob([source], { type: "text/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      try {
        const mod = await import(
          /* webpackIgnore: true */
          blobUrl
        );
        return mod;
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } else {
      return await import(
        /* webpackIgnore: true */
        url
      );
    }
  })();
  moduleCache.set(cacheKey, promise);
  return promise;
}
function mountInIframe(url, container, permissions, props) {
  const iframe = document.createElement("iframe");
  const sandboxTokens = ["allow-scripts"];
  if (permissions.includes("navigation"))
    sandboxTokens.push("allow-top-navigation-by-user-activation");
  iframe.setAttribute("sandbox", sandboxTokens.join(" "));
  iframe.style.border = "none";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.minHeight = "200px";
  const safeUrl = url.replace(/['\\<]/g, (ch) => ch === "'" ? "%27" : ch === "\\" ? "%5C" : "&lt;");
  const propsJson = JSON.stringify(props ?? {}).replace(/</g, "\\u003c");
  const srcDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;box-sizing:border-box;font-family:-apple-system,sans-serif;}</style>
</head><body>
<div id="root"></div>
<script type="module">
  import widget from '${safeUrl}';
  const props = ${propsJson};
  const node = widget(props);
  document.getElementById('root').appendChild(node);

  // Auto-resize iframe to content height
  new ResizeObserver(() => {
    window.parent.postMessage({
      type: 'nf-resize',
      url: '${safeUrl}',
      height: document.body.scrollHeight
    }, '*');
  }).observe(document.body);
<\/script>
</body></html>`;
  iframe.srcdoc = srcDoc;
  container.appendChild(iframe);
  const handleMessage = (e) => {
    if (e.data?.type === "nf-resize" && e.data.url === url) {
      iframe.style.height = `${e.data.height}px`;
    }
  };
  window.addEventListener("message", handleMessage);
  const observer2 = new MutationObserver(() => {
    if (!container.isConnected) {
      window.removeEventListener("message", handleMessage);
      observer2.disconnect();
    }
  });
  if (container.parentNode) {
    observer2.observe(container.parentNode, { childList: true });
  }
}
function loadRemote(options) {
  const { url, exportName = "default", isolate = "none", integrity, permissions = ["dom"], fallback, onError, timeout } = options;
  return (props) => {
    const container = document.createElement("div");
    container.setAttribute("data-remote", url);
    container.setAttribute("data-isolate", isolate);
    try {
      if (securityConfig.blockAll) {
        throw new Error("[onefold:security] Remote loading is disabled (blockAll=true).");
      }
      validateOrigin(url);
    } catch (err) {
      if (onError) {
        container.appendChild(onError(err));
      } else {
        console.error(err);
        container.textContent = "Blocked by security policy";
      }
      return container;
    }
    if (fallback)
      container.appendChild(fallback());
    if (isolate === "iframe") {
      container.textContent = "";
      mountInIframe(url, container, permissions, props);
      return container;
    }
    loadModuleSecure(url, integrity, timeout).then((mod) => {
      const factory = mod[exportName];
      if (typeof factory !== "function") {
        throw new Error(`Remote "${url}" does not export "${exportName}" as a function.`);
      }
      const node = factory(props ?? {});
      container.textContent = "";
      if (isolate === "shadow") {
        const shadow = container.attachShadow({ mode: "closed" });
        shadow.appendChild(node);
      } else {
        container.appendChild(node);
      }
    }).catch((err) => {
      container.textContent = "";
      if (onError) {
        container.appendChild(onError(err));
      } else {
        console.error(`[onefold] Failed to load remote: ${url}`, err);
        container.textContent = "Failed to load remote module";
      }
    });
    return container;
  };
}
function preloadRemote(url, integrity) {
  try {
    validateOrigin(url);
  } catch (err) {
    return Promise.reject(err);
  }
  return loadModuleSecure(url, integrity).then(() => {
  });
}

// host/main.ts
var shell = css`
  .shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
  }
  .shell-header {
    text-align: center;
    margin-bottom: 32px;
  }
  .shell-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
  }
  .shell-header p {
    color: #6b7280;
    font-size: 14px;
  }
  .architecture {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .architecture h2 { font-size: 16px; margin: 0 0 12px; }
  .architecture pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'SF Mono', Menlo, monospace;
    overflow-x: auto;
    margin: 0;
  }
  .widgets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 768px) {
    .widgets { grid-template-columns: 1fr; }
  }
  .widget-frame {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }
  .widget-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .widget-toolbar span {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .team-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background: #eef2ff;
    color: #4f46e5;
  }
  .widget-content {
    padding: 20px;
  }
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    color: #9ca3af;
    font-size: 14px;
  }
  .spinner-ring {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    color: #dc2626;
    font-size: 13px;
    padding: 20px;
    text-align: center;
  }
  .controls {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .controls button {
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
  }
  .controls button:hover { border-color: #6366f1; color: #6366f1; }
  .controls button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .isolation-note {
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
    margin-top: 6px;
    font-style: italic;
  }
`;
var REMOTES = {
  billing: "http://localhost:3033/billing-widget.js",
  analytics: "http://localhost:3033/analytics-widget.js"
};
function LoadingFallback() {
  return html`
    <div class="spinner">
      <div class="spinner-ring"></div>
      <span>Loading remote widget...</span>
    </div>
  `;
}
function ErrorFallback(err) {
  return html`<div class="error-msg">Failed to load: ${err.message}</div>`;
}
function App() {
  const isolationMode = createSignal("none");
  const accountId = createSignal("ACCT-7291");
  const BillingWidget = loadRemote({
    url: REMOTES.billing,
    isolate: "none",
    // We'll toggle this dynamically
    fallback: LoadingFallback,
    onError: ErrorFallback
  });
  const AnalyticsWidget = loadRemote({
    url: REMOTES.analytics,
    isolate: "none",
    fallback: LoadingFallback,
    onError: ErrorFallback
  });
  const prefetchBilling = () => preloadRemote(REMOTES.billing);
  const prefetchAnalytics = () => preloadRemote(REMOTES.analytics);
  return html`
    <div class=${shell.scope}>
      <div class="shell">
        <div class="shell-header">
          <h1>Microfrontend Demo</h1>
          <p>Host shell loading independent remote widgets via <code>loadRemote()</code></p>
        </div>

        <div class="architecture">
          <h2>Architecture (Two Ports)</h2>
          <pre>Host Shell — http://localhost:3032
 │
 ├── loadRemote('http://localhost:3033/billing-widget.js')
 │   └── Team: Payments (deployed independently)
 │
 └── loadRemote('http://localhost:3033/analytics-widget.js')
     └── Team: Data (deployed independently)

Remote Server — http://localhost:3033  (CORS enabled)
 ├── billing-widget.js   (self-contained ES module)
 └── analytics-widget.js (self-contained ES module)</pre>
        </div>

        <div class="controls">
          <button
            class=${() => isolationMode() === "none" ? "active" : ""}
            onclick=${() => isolationMode.set("none")}
          >No Isolation</button>
          <button
            class=${() => isolationMode() === "shadow" ? "active" : ""}
            onclick=${() => isolationMode.set("shadow")}
          >Shadow DOM Isolation</button>
        </div>

        <div class="widgets">
          <div class="widget-frame" onmouseenter=${prefetchBilling}>
            <div class="widget-toolbar">
              <span>Billing Widget</span>
              <span class="team-badge">Team: Payments</span>
            </div>
            <div class="widget-content">
              ${BillingWidget({ accountId: accountId() })}
            </div>
            <p class="isolation-note">${() => `Isolation: ${isolationMode()}`}</p>
          </div>

          <div class="widget-frame" onmouseenter=${prefetchAnalytics}>
            <div class="widget-toolbar">
              <span>Analytics Widget</span>
              <span class="team-badge">Team: Data</span>
            </div>
            <div class="widget-content">
              ${AnalyticsWidget({ dashboardId: "main" })}
            </div>
            <p class="isolation-note">${() => `Isolation: ${isolationMode()}`}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
mount(App(), document.getElementById("app"));
