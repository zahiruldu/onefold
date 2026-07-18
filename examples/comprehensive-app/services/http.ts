/**
 * HTTP client with interceptors.
 * Demonstrates: createHttpClient, HttpInterceptor, observability integration
 */
import { createHttpClient } from '../../../src/index';
import { authService } from './auth';
import { observer } from './observer';

export const http = createHttpClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  headers: { 'Accept': 'application/json' },
  interceptors: [
    {
      request: (config) => {
        const user = authService.user.peek();
        if (user) {
          config.headers['X-User'] = user.name;
        }
        observer.log('info', `HTTP ${config.method} ${config.url}`);
        return config;
      },
      response: (res) => {
        observer.metric('http.response', res.status, { url: res.config.url });
        return res;
      },
    },
  ],
});
