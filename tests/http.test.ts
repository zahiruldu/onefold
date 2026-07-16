import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHttpClient, type HttpInterceptor } from '../src/core/http.ts';

// Mock fetch for tests
let lastFetchUrl = '';
let lastFetchOpts: RequestInit = {};
let mockResponse: any = { ok: true, status: 200, statusText: 'OK', headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ success: true }), text: async () => '' };

(globalThis as any).fetch = async (url: string, opts: RequestInit) => {
  lastFetchUrl = url;
  lastFetchOpts = opts;
  return mockResponse;
};

describe('createHttpClient', () => {
  it('makes GET request with baseUrl', async () => {
    const http = createHttpClient({ baseUrl: 'http://api.test' });
    await http.get('/users');
    assert.equal(lastFetchUrl, 'http://api.test/users');
    assert.equal(lastFetchOpts.method, 'GET');
  });

  it('makes POST request with body', async () => {
    const http = createHttpClient({ baseUrl: 'http://api.test' });
    await http.post('/users', { name: 'Alice' });
    assert.equal(lastFetchOpts.method, 'POST');
    assert.equal(lastFetchOpts.body, '{"name":"Alice"}');
  });

  it('adds default headers', async () => {
    const http = createHttpClient({
      baseUrl: 'http://api.test',
      headers: { 'X-Custom': 'val' },
    });
    await http.get('/test');
    assert.equal((lastFetchOpts.headers as Record<string, string>)['X-Custom'], 'val');
  });

  it('appends query params', async () => {
    const http = createHttpClient({ baseUrl: 'http://api.test' });
    await http.get('/search', { params: { q: 'hello', page: '1' } });
    assert.ok(lastFetchUrl.includes('q=hello'));
    assert.ok(lastFetchUrl.includes('page=1'));
  });

  it('runs request interceptor', async () => {
    const interceptor: HttpInterceptor = {
      request: (config) => {
        config.headers['Authorization'] = 'Bearer token123';
        return config;
      },
    };
    const http = createHttpClient({ baseUrl: 'http://api.test', interceptors: [interceptor] });
    await http.get('/protected');
    assert.equal((lastFetchOpts.headers as Record<string, string>)['Authorization'], 'Bearer token123');
  });

  it('runs response interceptor', async () => {
    const interceptor: HttpInterceptor = {
      response: (res) => {
        (res as any).transformed = true;
        return res;
      },
    };
    const http = createHttpClient({ baseUrl: 'http://api.test', interceptors: [interceptor] });
    const res = await http.get('/test');
    assert.equal((res as any).transformed, true);
  });

  it('blocks protocol-relative URLs', async () => {
    const http = createHttpClient({ baseUrl: 'http://api.test' });
    await assert.rejects(
      () => http.get('//evil.com/steal'),
      /Protocol-relative URLs are blocked/
    );
  });

  it('addInterceptor at runtime', async () => {
    const http = createHttpClient({ baseUrl: 'http://api.test' });
    let called = false;
    const remove = http.addInterceptor({
      request: (c) => { called = true; return c; },
    });
    await http.get('/test');
    assert.equal(called, true);
    called = false;
    remove();
    await http.get('/test');
    assert.equal(called, false);
  });

  describe('error interceptor chain (regression)', () => {
    it('gives every registered error interceptor a chance to run, not just the first one', async () => {
      // Regression test: the error-interceptor loop previously called only the
      // first interceptor (in reverse order) that defined `.error` and returned
      // immediately, silently skipping every other one — contradicting the
      // "pipeline" behavior documented for request/response interceptors.
      const errorRes = {
        ok: false,
        status: 500,
        statusText: 'Server Error',
        headers: new Headers(),
        json: async () => ({ message: 'boom' }),
        text: async () => '',
      };
      const originalFetch = (globalThis as any).fetch;
      (globalThis as any).fetch = async () => errorRes;

      // Error interceptors run in reverse registration order — same convention
      // already documented for response interceptors ("Executed in order for
      // requests, reverse for responses"). So `recoveryInterceptor` (registered
      // last) is TRIED FIRST; it passes the error through by rethrowing, which
      // must reach `loggingInterceptor` (registered first, tried second) rather
      // than the whole chain silently stopping after the first interceptor.
      const seen: string[] = [];
      const passthroughInterceptor: HttpInterceptor = {
        error: (err) => {
          seen.push('passthrough');
          throw err; // not recovered — must fall through to the next interceptor
        },
      };
      const recoveryInterceptor: HttpInterceptor = {
        error: (_err) => {
          seen.push('recovery');
          return { data: { recovered: true }, status: 200, statusText: 'OK', headers: new Headers(), config: {} as any };
        },
      };

      const http = createHttpClient({
        baseUrl: 'http://api.test',
        // Registered first → tried SECOND (reverse order): recoveryInterceptor
        interceptors: [recoveryInterceptor, passthroughInterceptor],
      });

      const res = await http.get('/fail');

      assert.deepEqual(seen, ['passthrough', 'recovery'], 'passthroughInterceptor (tried first) must run before falling through to recoveryInterceptor');
      assert.equal((res.data as any).recovered, true);

      (globalThis as any).fetch = originalFetch;
    });

    it('propagates the final error if no interceptor recovers it', async () => {
      const errorRes = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: async () => ({}),
        text: async () => '',
      };
      const originalFetch = (globalThis as any).fetch;
      (globalThis as any).fetch = async () => errorRes;

      let calls = 0;
      const throwingInterceptor: HttpInterceptor = {
        error: (err) => { calls++; throw err; },
      };

      const http = createHttpClient({
        baseUrl: 'http://api.test',
        interceptors: [throwingInterceptor, throwingInterceptor],
      });

      await assert.rejects(() => http.get('/missing'));
      assert.equal(calls, 2, 'every interceptor in the chain must be attempted before propagating');

      (globalThis as any).fetch = originalFetch;
    });
  });
});
