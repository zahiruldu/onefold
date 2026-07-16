/**
 * Typed HTTP client with interceptors, DI integration, and observability.
 *
 * Zero dependencies — wraps the native `fetch` API. Interceptors enable
 * auth headers, logging, retry logic, error normalization, etc. without
 * coupling the client to those concerns.
 *
 * Usage:
 * ```ts
 * const http = createHttpClient({
 *   baseUrl: '/api',
 *   interceptors: [authInterceptor, loggingInterceptor],
 * });
 *
 * const users = await http.get<User[]>('/users');
 * await http.post('/users', { name: 'Alice' });
 * ```
 *
 * Interceptors:
 * ```ts
 * const authInterceptor: HttpInterceptor = {
 *   request: (config) => {
 *     config.headers['Authorization'] = `Bearer ${getToken()}`;
 *     return config;
 *   },
 *   response: (res) => res,
 *   error: (err) => { if (err.status === 401) logout(); throw err; },
 * };
 * ```
 */
/* ────────────────── Implementation ────────────────── */
/**
 * Run the error-interceptor chain in reverse registration order, matching
 * the response-interceptor convention.
 *
 * BUG FIXED: the previous implementation called `.error` on only the first
 * interceptor (in reverse order) that defined one, and returned its result
 * immediately — every other registered error interceptor was silently never
 * invoked. That contradicts this module's own doc comment describing
 * interceptors as a "pipeline." Each interceptor in the chain now runs in
 * turn:
 * - If it returns a recovered `HttpResponse`, the chain stops there (the
 *   error is considered handled — nothing left for later interceptors to see).
 * - If it throws, that new error is passed to the next interceptor in the
 *   chain (mirroring how a rethrow propagates through nested catch blocks).
 * - If every interceptor without an `.error` hook is skipped and the chain
 *   is exhausted, the final error is thrown.
 */
async function runErrorInterceptors(interceptors, error) {
    let currentError = error;
    for (let i = interceptors.length - 1; i >= 0; i--) {
        const interceptor = interceptors[i];
        if (!interceptor.error)
            continue;
        try {
            const recovered = await interceptor.error(currentError);
            return recovered;
        }
        catch (err) {
            currentError = err;
        }
    }
    throw currentError;
}
/**
 * Create a typed HTTP client.
 */
export function createHttpClient(options) {
    const baseUrl = options?.baseUrl ?? '';
    const defaultHeaders = options?.headers ?? {};
    const interceptors = [...(options?.interceptors ?? [])];
    const defaultTimeout = options?.timeout ?? 0;
    async function request(config) {
        // Build full config — prevent open redirect by validating URL origin
        const resolvedUrl = config.url.startsWith('http') ? config.url
            : config.url.startsWith('//') ? (() => { throw new Error('[onefold:http] Protocol-relative URLs are blocked to prevent open redirect.'); })()
                : `${baseUrl}${config.url}`;
        let fullConfig = {
            url: resolvedUrl,
            method: config.method,
            headers: { ...defaultHeaders, ...config.headers },
            body: config.body,
            params: config.params,
            signal: config.signal,
        };
        // Run request interceptors (in order)
        for (const interceptor of interceptors) {
            if (interceptor.request) {
                fullConfig = await interceptor.request(fullConfig);
            }
        }
        // Build URL with query params
        let fetchUrl = fullConfig.url;
        if (fullConfig.params && Object.keys(fullConfig.params).length > 0) {
            const search = new URLSearchParams(fullConfig.params).toString();
            fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + search;
        }
        // Build fetch options
        const fetchOpts = {
            method: fullConfig.method,
            headers: fullConfig.headers,
            signal: fullConfig.signal,
        };
        if (fullConfig.body !== undefined && fullConfig.body !== null) {
            if (typeof fullConfig.body === 'string' || fullConfig.body instanceof FormData) {
                fetchOpts.body = fullConfig.body;
            }
            else {
                fetchOpts.body = JSON.stringify(fullConfig.body);
                if (!fullConfig.headers['Content-Type'] && !fullConfig.headers['content-type']) {
                    fetchOpts.headers['Content-Type'] = 'application/json';
                }
            }
        }
        // Timeout handling
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
            if (timeoutId)
                clearTimeout(timeoutId);
            if (!res.ok) {
                let data = null;
                try {
                    data = await res.json();
                }
                catch { /* empty */ }
                const httpError = {
                    message: `HTTP ${res.status}: ${res.statusText}`,
                    status: res.status,
                    statusText: res.statusText,
                    data,
                    config: fullConfig,
                };
                return await runErrorInterceptors(interceptors, httpError);
            }
            // Parse response
            let data;
            const contentType = res.headers.get('content-type') ?? '';
            if (contentType.includes('application/json')) {
                data = await res.json();
            }
            else {
                data = await res.text();
            }
            let response = {
                data,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                config: fullConfig,
            };
            // Run response interceptors (reverse order)
            for (let i = interceptors.length - 1; i >= 0; i--) {
                const interceptor = interceptors[i];
                if (interceptor.response) {
                    response = await interceptor.response(response);
                }
            }
            return response;
        }
        catch (err) {
            if (timeoutId)
                clearTimeout(timeoutId);
            // If it's already an HttpError from above, rethrow
            if (typeof err === 'object' && err !== null && 'config' in err)
                throw err;
            // Network/timeout error
            const httpError = {
                message: err instanceof Error ? err.message : 'Network error',
                status: 0,
                statusText: 'Network Error',
                data: null,
                config: fullConfig,
            };
            return await runErrorInterceptors(interceptors, httpError);
        }
    }
    function buildOptions(opts) {
        return {
            headers: opts?.headers,
            params: opts?.params,
            signal: opts?.signal,
        };
    }
    return {
        get: (url, opts) => request({ url, method: 'GET', ...buildOptions(opts) }),
        post: (url, body, opts) => request({ url, method: 'POST', body, ...buildOptions(opts) }),
        put: (url, body, opts) => request({ url, method: 'PUT', body, ...buildOptions(opts) }),
        patch: (url, body, opts) => request({ url, method: 'PATCH', body, ...buildOptions(opts) }),
        delete: (url, opts) => request({ url, method: 'DELETE', ...buildOptions(opts) }),
        request,
        addInterceptor: (interceptor) => {
            interceptors.push(interceptor);
            return () => {
                const idx = interceptors.indexOf(interceptor);
                if (idx >= 0)
                    interceptors.splice(idx, 1);
            };
        },
    };
}
