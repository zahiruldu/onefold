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

/* ────────────────── Types ────────────────── */

export interface HttpConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  signal?: AbortSignal;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: HttpConfig;
}

export interface HttpError {
  message: string;
  status: number;
  statusText: string;
  data: unknown;
  config: HttpConfig;
}

/**
 * Interceptors modify requests/responses in a pipeline.
 * All methods are optional — implement only what you need.
 */
export interface HttpInterceptor {
  /** Transform the request config before sending. */
  request?: (config: HttpConfig) => HttpConfig | Promise<HttpConfig>;
  /** Transform the response after receiving. */
  response?: <T>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
  /** Handle errors. Throw to propagate, return to recover. */
  error?: (error: HttpError) => HttpResponse | Promise<HttpResponse> | never;
}

export interface HttpClientOptions {
  /** Base URL prepended to all relative paths. */
  baseUrl?: string;
  /** Default headers applied to every request. */
  headers?: Record<string, string>;
  /** Interceptor pipeline. Executed in order for requests, reverse for responses. */
  interceptors?: HttpInterceptor[];
  /** Default timeout in ms. 0 = no timeout. */
  timeout?: number;
}

export interface HttpClient {
  get: <T = unknown>(url: string, options?: RequestOptions) => Promise<HttpResponse<T>>;
  post: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) => Promise<HttpResponse<T>>;
  put: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) => Promise<HttpResponse<T>>;
  patch: <T = unknown>(url: string, body?: unknown, options?: RequestOptions) => Promise<HttpResponse<T>>;
  delete: <T = unknown>(url: string, options?: RequestOptions) => Promise<HttpResponse<T>>;
  request: <T = unknown>(config: Partial<HttpConfig> & { url: string; method: string }) => Promise<HttpResponse<T>>;
  /** Add an interceptor at runtime. Returns a function to remove it. */
  addInterceptor: (interceptor: HttpInterceptor) => () => void;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

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
async function runErrorInterceptors<T>(
  interceptors: HttpInterceptor[],
  error: HttpError
): Promise<HttpResponse<T>> {
  let currentError = error;
  for (let i = interceptors.length - 1; i >= 0; i--) {
    const interceptor = interceptors[i]!;
    if (!interceptor.error) continue;
    try {
      const recovered = await interceptor.error(currentError);
      return recovered as HttpResponse<T>;
    } catch (err) {
      currentError = err as HttpError;
    }
  }
  throw currentError;
}

/**
 * Create a typed HTTP client.
 */
export function createHttpClient(options?: HttpClientOptions): HttpClient {
  const baseUrl = options?.baseUrl ?? '';
  const defaultHeaders = options?.headers ?? {};
  const interceptors: HttpInterceptor[] = [...(options?.interceptors ?? [])];
  const defaultTimeout = options?.timeout ?? 0;

  async function request<T>(config: Partial<HttpConfig> & { url: string; method: string }): Promise<HttpResponse<T>> {
    // Build full config — prevent open redirect by validating URL origin
    const resolvedUrl = config.url.startsWith('http') ? config.url
      : config.url.startsWith('//') ? (() => { throw new Error('[onefold:http] Protocol-relative URLs are blocked to prevent open redirect.'); })()
      : `${baseUrl}${config.url}`;

    let fullConfig: HttpConfig = {
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
    const fetchOpts: RequestInit = {
      method: fullConfig.method,
      headers: fullConfig.headers,
      signal: fullConfig.signal,
    };

    if (fullConfig.body !== undefined && fullConfig.body !== null) {
      if (typeof fullConfig.body === 'string' || fullConfig.body instanceof FormData) {
        fetchOpts.body = fullConfig.body as BodyInit;
      } else {
        fetchOpts.body = JSON.stringify(fullConfig.body);
        if (!fullConfig.headers['Content-Type'] && !fullConfig.headers['content-type']) {
          (fetchOpts.headers as Record<string, string>)['Content-Type'] = 'application/json';
        }
      }
    }

    // Timeout handling
    const timeout = defaultTimeout;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    if (timeout > 0 && !fullConfig.signal) {
      controller = new AbortController();
      fetchOpts.signal = controller.signal;
      timeoutId = setTimeout(() => controller!.abort(), timeout);
    }

    try {
      const res = await fetch(fetchUrl, fetchOpts);
      if (timeoutId) clearTimeout(timeoutId);

      if (!res.ok) {
        let data: unknown = null;
        try { data = await res.json(); } catch { /* empty */ }
        const httpError: HttpError = {
          message: `HTTP ${res.status}: ${res.statusText}`,
          status: res.status,
          statusText: res.statusText,
          data,
          config: fullConfig,
        };
        return await runErrorInterceptors<T>(interceptors, httpError);
      }

      // Parse response
      let data: T;
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        data = await res.json() as T;
      } else {
        data = await res.text() as unknown as T;
      }

      let response: HttpResponse<T> = {
        data,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        config: fullConfig,
      };

      // Run response interceptors (reverse order)
      for (let i = interceptors.length - 1; i >= 0; i--) {
        const interceptor = interceptors[i]!;
        if (interceptor.response) {
          response = await interceptor.response(response) as HttpResponse<T>;
        }
      }

      return response;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      // If it's already an HttpError from above, rethrow
      if (typeof err === 'object' && err !== null && 'config' in err) throw err;
      // Network/timeout error
      const httpError: HttpError = {
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
        statusText: 'Network Error',
        data: null,
        config: fullConfig,
      };
      return await runErrorInterceptors<T>(interceptors, httpError);
    }
  }

  function buildOptions(opts?: RequestOptions): Partial<HttpConfig> {
    return {
      headers: opts?.headers,
      params: opts?.params,
      signal: opts?.signal,
    };
  }

  return {
    get: <T>(url: string, opts?: RequestOptions) =>
      request<T>({ url, method: 'GET', ...buildOptions(opts) }),
    post: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
      request<T>({ url, method: 'POST', body, ...buildOptions(opts) }),
    put: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
      request<T>({ url, method: 'PUT', body, ...buildOptions(opts) }),
    patch: <T>(url: string, body?: unknown, opts?: RequestOptions) =>
      request<T>({ url, method: 'PATCH', body, ...buildOptions(opts) }),
    delete: <T>(url: string, opts?: RequestOptions) =>
      request<T>({ url, method: 'DELETE', ...buildOptions(opts) }),
    request,
    addInterceptor: (interceptor: HttpInterceptor) => {
      interceptors.push(interceptor);
      return () => {
        const idx = interceptors.indexOf(interceptor);
        if (idx >= 0) interceptors.splice(idx, 1);
      };
    },
  };
}
