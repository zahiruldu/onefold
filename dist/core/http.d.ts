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
    request: <T = unknown>(config: Partial<HttpConfig> & {
        url: string;
        method: string;
    }) => Promise<HttpResponse<T>>;
    /** Add an interceptor at runtime. Returns a function to remove it. */
    addInterceptor: (interceptor: HttpInterceptor) => () => void;
}
export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    signal?: AbortSignal;
    timeout?: number;
}
/**
 * Create a typed HTTP client.
 */
export declare function createHttpClient(options?: HttpClientOptions): HttpClient;
