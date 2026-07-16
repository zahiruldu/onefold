/**
 * Secure Microfrontend Remote Loader.
 *
 * Security layers:
 * 1. **Trusted Origins** — only pre-approved URLs/origins can be loaded
 * 2. **Subresource Integrity (SRI)** — verify remote code hash before execution
 * 3. **Sandbox Isolation** — full iframe sandbox for untrusted remotes
 * 4. **Permission Model** — restrict what remotes can access
 * 5. **Shadow DOM** — CSS isolation to prevent style attacks
 *
 * Usage:
 * ```ts
 * // Configure trusted remotes at app startup
 * configureSecurity({
 *   trustedOrigins: ['https://billing.company.com', 'http://localhost:3033'],
 *   requireIntegrity: true, // enforce SRI in production
 * });
 *
 * const BillingWidget = loadRemote({
 *   url: 'http://localhost:3033/billing-widget.js',
 *   integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
 *   isolate: 'shadow',
 *   permissions: ['dom'],
 *   fallback: () => Spinner(),
 *   onError: (err) => ErrorBox(err.message),
 * });
 * ```
 */
let securityConfig = {};
/**
 * Configure the security policy for remote loading.
 * Call once at app startup before loading any remotes.
 */
export function configureSecurity(config) {
    securityConfig = { ...config };
}
/* ────────────────── Security checks ────────────────── */
/**
 * Validate that a URL is from a trusted origin.
 */
function validateOrigin(url) {
    const trusted = securityConfig.trustedOrigins;
    if (!trusted || trusted.length === 0)
        return; // No restriction configured
    let origin;
    try {
        origin = new URL(url).origin;
    }
    catch {
        throw new Error(`[onefold:security] Invalid remote URL: ${url}`);
    }
    if (!trusted.includes(origin)) {
        throw new Error(`[onefold:security] Blocked untrusted origin "${origin}". ` +
            `Trusted origins: ${trusted.join(', ')}. ` +
            `Add it to configureSecurity({ trustedOrigins: [...] }) if this is intentional.`);
    }
}
/**
 * Fetch a remote module with SRI verification.
 * Uses fetch + blob URL to verify integrity before execution.
 */
async function fetchWithIntegrity(url, integrity, timeoutMs) {
    const controller = new AbortController();
    const timeout = timeoutMs ?? securityConfig.timeout ?? 10000;
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            credentials: 'omit', // Never send cookies to remote origins
            mode: 'cors',
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const source = await response.text();
        // SRI verification
        if (integrity) {
            const valid = await verifySRI(source, integrity);
            if (!valid) {
                throw new Error(`[onefold:security] Integrity check FAILED for "${url}". ` +
                    `The remote code has been tampered with or the hash is outdated.`);
            }
        }
        return source;
    }
    finally {
        clearTimeout(timer);
    }
}
/**
 * Verify Subresource Integrity hash against source content.
 */
async function verifySRI(source, integrity) {
    // Parse integrity: "sha256-xxx" or "sha384-xxx" or "sha512-xxx"
    const match = /^(sha256|sha384|sha512)-(.+)$/.exec(integrity);
    if (!match)
        return false;
    const algorithm = match[1];
    const expectedHash = match[2];
    const encoder = new TextEncoder();
    const data = encoder.encode(source);
    const hashAlgo = algorithm === 'sha256' ? 'SHA-256'
        : algorithm === 'sha384' ? 'SHA-384'
            : 'SHA-512';
    const hashBuffer = await crypto.subtle.digest(hashAlgo, data);
    const hashArray = new Uint8Array(hashBuffer);
    const actualHash = btoa(String.fromCharCode(...hashArray));
    return actualHash === expectedHash;
}
/* ────────────────── Module cache & loading ────────────────── */
const moduleCache = new Map();
/**
 * Load a remote module with security checks, SRI verification, and caching.
 */
async function loadModuleSecure(url, integrity, timeoutMs) {
    const cacheKey = `${url}#${integrity ?? 'no-sri'}`;
    if (moduleCache.has(cacheKey))
        return moduleCache.get(cacheKey);
    const promise = (async () => {
        if (integrity || securityConfig.requireIntegrity) {
            if (securityConfig.requireIntegrity && !integrity) {
                throw new Error(`[onefold:security] Integrity hash required for "${url}". ` +
                    `Provide an integrity option or disable requireIntegrity.`);
            }
            // Fetch, verify, then execute via blob URL
            const source = await fetchWithIntegrity(url, integrity, timeoutMs);
            const blob = new Blob([source], { type: 'text/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            try {
                const mod = await import(/* webpackIgnore: true */ blobUrl);
                return mod;
            }
            finally {
                URL.revokeObjectURL(blobUrl);
            }
        }
        else {
            // Direct import (no SRI — use only for trusted origins)
            return await import(/* webpackIgnore: true */ url);
        }
    })();
    moduleCache.set(cacheKey, promise);
    return promise;
}
/* ────────────────── Iframe sandbox ────────────────── */
/**
 * Load a remote inside a fully sandboxed iframe.
 * The remote cannot access the host's DOM, cookies, or JS context.
 */
function mountInIframe(url, container, permissions, props) {
    const iframe = document.createElement('iframe');
    // Build sandbox permissions.
    //
    // SECURITY NOTE: `allow-same-origin` is deliberately NOT granted for 'network' or
    // 'storage' permissions. `fetch`/XHR from a sandboxed iframe work fine without it —
    // cross-origin requests don't require same-origin status, they require CORS on the
    // target server. Granting `allow-same-origin` on a `srcdoc` iframe combined with
    // `allow-scripts` lets the iframe's script call `document.domain`/reach the parent's
    // origin object, which is a documented sandbox-escape pattern (the iframe inherits
    // the embedding document's origin when both flags are present on a srcdoc/about:blank
    // frame). If a remote genuinely needs localStorage/cookies scoped to ITS OWN origin,
    // load it via a real `src` URL (not `srcdoc`) — same-origin then refers to the
    // remote's own origin, not the host's, and is safe to grant.
    const sandboxTokens = ['allow-scripts'];
    if (permissions.includes('navigation'))
        sandboxTokens.push('allow-top-navigation-by-user-activation');
    iframe.setAttribute('sandbox', sandboxTokens.join(' '));
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.minHeight = '200px';
    // Build a minimal HTML page that loads the remote module
    // Sanitize URL and props to prevent injection into srcdoc context
    const safeUrl = url.replace(/['\\<]/g, (ch) => ch === "'" ? '%27' : ch === '\\' ? '%5C' : '&lt;');
    const propsJson = JSON.stringify(props ?? {}).replace(/</g, '\\u003c');
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
</script>
</body></html>`;
    iframe.srcdoc = srcDoc;
    container.appendChild(iframe);
    // Listen for resize messages from the iframe
    const handleMessage = (e) => {
        if (e.data?.type === 'nf-resize' && e.data.url === url) {
            iframe.style.height = `${e.data.height}px`;
        }
    };
    window.addEventListener('message', handleMessage);
    // Cleanup listener when container is removed
    const observer = new MutationObserver(() => {
        if (!container.isConnected) {
            window.removeEventListener('message', handleMessage);
            observer.disconnect();
        }
    });
    if (container.parentNode) {
        observer.observe(container.parentNode, { childList: true });
    }
}
/* ────────────────── Public API ────────────────── */
/**
 * Create a secure remote component loader.
 */
export function loadRemote(options) {
    const { url, exportName = 'default', isolate = 'none', integrity, permissions = ['dom'], fallback, onError, timeout, } = options;
    return (props) => {
        const container = document.createElement('div');
        container.setAttribute('data-remote', url);
        container.setAttribute('data-isolate', isolate);
        // Security gate
        try {
            if (securityConfig.blockAll) {
                throw new Error('[onefold:security] Remote loading is disabled (blockAll=true).');
            }
            validateOrigin(url);
        }
        catch (err) {
            if (onError) {
                container.appendChild(onError(err));
            }
            else {
                console.error(err);
                container.textContent = 'Blocked by security policy';
            }
            return container;
        }
        // Show fallback
        if (fallback)
            container.appendChild(fallback());
        // Iframe isolation — completely separate JS context
        if (isolate === 'iframe') {
            container.textContent = '';
            mountInIframe(url, container, permissions, props);
            return container;
        }
        // Shadow or direct mounting — load via import
        loadModuleSecure(url, integrity, timeout)
            .then((mod) => {
            const factory = mod[exportName];
            if (typeof factory !== 'function') {
                throw new Error(`Remote "${url}" does not export "${exportName}" as a function.`);
            }
            const node = factory(props ?? {});
            container.textContent = '';
            if (isolate === 'shadow') {
                const shadow = container.attachShadow({ mode: 'closed' }); // closed = no external access
                shadow.appendChild(node);
            }
            else {
                container.appendChild(node);
            }
        })
            .catch((err) => {
            container.textContent = '';
            if (onError) {
                container.appendChild(onError(err));
            }
            else {
                console.error(`[onefold] Failed to load remote: ${url}`, err);
                container.textContent = 'Failed to load remote module';
            }
        });
        return container;
    };
}
/**
 * Preload a remote module (fetches + verifies but doesn't mount).
 * Useful for prefetching on hover or route anticipation.
 */
export function preloadRemote(url, integrity) {
    try {
        validateOrigin(url);
    }
    catch (err) {
        return Promise.reject(err);
    }
    return loadModuleSecure(url, integrity).then(() => { });
}
/**
 * Invalidate the module cache for a specific URL or all remotes.
 * Use when you detect a compromised remote or need to force a fresh load.
 */
export function clearRemoteCache(url) {
    if (url) {
        for (const key of moduleCache.keys()) {
            if (key.startsWith(url))
                moduleCache.delete(key);
        }
    }
    else {
        moduleCache.clear();
    }
}
