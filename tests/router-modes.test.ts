import './setup.ts';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  Router,
  navigate,
  currentRoute,
  Link,
  configureRouter,
  _resetRouter,
} from '../src/router/router.ts';

/* ─────────────────────────────────────────────────────────
 * PATH-BASED ROUTING (history.pushState)
 * ───────────────────────────────────────────────────────── */

describe('Router — path mode (pushState)', () => {
  beforeEach(() => {
    _resetRouter();
    configureRouter({ hash: false });
    window.location.hash = '';
    window.history.pushState({}, '', '/');
    navigate('/');
  });

  it('uses pathname for route resolution', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/about', view: () => document.createTextNode('about') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
  });

  it('navigate() uses history.pushState', () => {
    navigate('/dashboard');
    assert.equal(window.location.pathname, '/dashboard');
    assert.equal(currentRoute(), '/dashboard');
  });

  it('renders correct view after navigate', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/page', view: () => document.createTextNode('page') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/page');
    assert.equal(node.textContent, 'page');
  });

  it('Link renders href without hash prefix', () => {
    const link = Link('/about', 'About') as HTMLAnchorElement;
    assert.equal(link.getAttribute('href'), '/about');
  });

  it('Link click navigates via pushState', () => {
    const link = Link('/contact', 'Contact') as HTMLAnchorElement;
    document.body.appendChild(link);
    link.click();
    assert.equal(currentRoute(), '/contact');
    document.body.removeChild(link);
  });

  it('dynamic params work in path mode', () => {
    navigate('/users/123');
    let captured: Record<string, string> = {};
    Router([
      { path: '/users/:id', view: (params) => { captured = params; return document.createTextNode(params.id ?? ''); } },
    ], () => document.createTextNode('404'));

    assert.equal(captured.id, '123');
  });

  it('nested routes work in path mode', () => {
    navigate('/settings/profile');
    const node = Router([
      { path: '/settings', view: (_p, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('layout:'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/profile', view: () => document.createTextNode('profile') },
        { path: '/billing', view: () => document.createTextNode('billing') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'layout:profile');
  });

  it('record-style routes work in path mode', () => {
    const node = Router({
      '/': () => document.createTextNode('home'),
      '/help': () => document.createTextNode('help'),
    }, () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/help');
    assert.equal(node.textContent, 'help');
  });

  it('matches deep flat routes (multi-segment paths like /core/signals)', () => {
    navigate('/core/signals');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
      { path: '/core/templates', view: () => document.createTextNode('templates') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'signals');
  });

  it('navigates between deep flat routes', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
      { path: '/core/templates', view: () => document.createTextNode('templates') },
      { path: '/routing/router', view: () => document.createTextNode('router') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/core/signals');
    assert.equal(node.textContent, 'signals');
    navigate('/routing/router');
    assert.equal(node.textContent, 'router');
    navigate('/core/templates');
    assert.equal(node.textContent, 'templates');
  });

  it('renders correct route on initial page load at deep path', () => {
    // Simulate browser landing directly on /core/signals
    _resetRouter();
    configureRouter({ hash: false });
    window.history.pushState({}, '', '/core/signals');

    // Router should read the current pathname on init
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(currentRoute(), '/core/signals');
    assert.equal(node.textContent, 'signals');
  });

  it('renders notFound for unmatched deep path', () => {
    navigate('/core/nonexistent');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, '404');
  });
});

/* ─────────────────────────────────────────────────────────
 * HASH-BASED ROUTING (#/path)
 * ───────────────────────────────────────────────────────── */

describe('Router — hash mode (configureRouter({ hash: true }))', () => {
  beforeEach(() => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '';
    navigate('/');
  });

  it('uses hash fragment for route resolution', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/about', view: () => document.createTextNode('about') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
  });

  it('navigate() sets window.location.hash', () => {
    navigate('/dashboard');
    assert.equal(window.location.hash, '#/dashboard');
    assert.equal(currentRoute(), '/dashboard');
  });

  it('renders correct view after navigate in hash mode', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/page', view: () => document.createTextNode('page') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/page');
    assert.equal(node.textContent, 'page');
  });

  it('Link renders href with # prefix in hash mode', () => {
    const link = Link('/about', 'About') as HTMLAnchorElement;
    assert.equal(link.getAttribute('href'), '#/about');
  });

  it('dynamic params work in hash mode', () => {
    navigate('/posts/42');
    let captured: Record<string, string> = {};
    Router([
      { path: '/posts/:id', view: (params) => { captured = params; return document.createTextNode(params.id ?? ''); } },
    ], () => document.createTextNode('404'));

    assert.equal(captured.id, '42');
  });

  it('nested routes work in hash mode', () => {
    navigate('/settings/billing');
    const node = Router([
      { path: '/settings', view: (_p, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('layout:'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/profile', view: () => document.createTextNode('profile') },
        { path: '/billing', view: () => document.createTextNode('billing') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'layout:billing');
  });

  it('deeply nested routes work in hash mode', () => {
    navigate('/admin/users/7');
    const node = Router([
      { path: '/admin', view: (_p, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('admin>'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/users', view: (_p, outlet) => {
          const div = document.createElement('div');
          div.appendChild(document.createTextNode('users>'));
          if (outlet) div.appendChild(outlet);
          return div;
        }, children: [
          { path: '/:id', view: (params) => document.createTextNode(`detail-${params.id}`) },
        ]},
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'admin>users>detail-7');
  });

  it('notFound renders when no hash route matches', () => {
    navigate('/nonexistent');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
    ], () => document.createTextNode('not-found')) as HTMLElement;

    assert.equal(node.textContent, 'not-found');
  });

  it('record-style routes work in hash mode', () => {
    const node = Router({
      '/': () => document.createTextNode('home'),
      '/docs': () => document.createTextNode('docs'),
    }, () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/docs');
    assert.equal(node.textContent, 'docs');
  });

  it('multiple navigations in hash mode update reactively', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/a', view: () => document.createTextNode('A') },
      { path: '/b', view: () => document.createTextNode('B') },
      { path: '/c', view: () => document.createTextNode('C') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/a');
    assert.equal(node.textContent, 'A');
    navigate('/b');
    assert.equal(node.textContent, 'B');
    navigate('/c');
    assert.equal(node.textContent, 'C');
  });

  it('matches deep flat routes (multi-segment paths like /core/signals)', () => {
    navigate('/core/signals');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
      { path: '/core/templates', view: () => document.createTextNode('templates') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'signals');
  });

  it('navigates between deep flat routes in hash mode', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
      { path: '/routing/router', view: () => document.createTextNode('router') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/core/signals');
    assert.equal(node.textContent, 'signals');
    assert.equal(window.location.hash, '#/core/signals');
    navigate('/routing/router');
    assert.equal(node.textContent, 'router');
    assert.equal(window.location.hash, '#/routing/router');
  });

  it('renders correct route on initial load with hash at deep path', () => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '#/core/signals';

    // Need to call getPathSignal fresh (via currentRoute or Router)
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core/signals', view: () => document.createTextNode('signals') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(currentRoute(), '/core/signals');
    assert.equal(node.textContent, 'signals');
  });
});

/* ─────────────────────────────────────────────────────────
 * configureRouter API
 * ───────────────────────────────────────────────────────── */

describe('configureRouter', () => {
  beforeEach(() => {
    _resetRouter();
    window.location.hash = '';
    window.history.pushState({}, '', '/');
  });

  it('defaults to path mode (pushState)', () => {
    // No configureRouter call — uses path mode (http: protocol in tests)
    navigate('/test');
    assert.equal(window.location.pathname, '/test');
  });

  it('configureRouter({ hash: true }) switches to hash routing', () => {
    configureRouter({ hash: true });
    navigate('/test');
    assert.equal(window.location.hash, '#/test');
  });

  it('configureRouter({ hash: false }) explicitly uses path routing', () => {
    configureRouter({ hash: false });
    navigate('/test');
    assert.equal(window.location.pathname, '/test');
    assert.equal(window.location.hash, '');
  });

  it('calling configureRouter multiple times uses the last value', () => {
    configureRouter({ hash: true });
    configureRouter({ hash: false });
    navigate('/final');
    assert.equal(window.location.pathname, '/final');
    assert.equal(window.location.hash, '');
  });

  it('configureRouter must be called before navigate/Router to take effect', () => {
    // First configure hash mode, then use navigate
    configureRouter({ hash: true });
    navigate('/early');
    assert.equal(window.location.hash, '#/early');
    assert.equal(currentRoute(), '/early');
  });
});

/* ─────────────────────────────────────────────────────────
 * Link behavior differences between modes
 * ───────────────────────────────────────────────────────── */

describe('Link — mode-specific behavior', () => {
  it('in path mode, href has no hash prefix', () => {
    _resetRouter();
    configureRouter({ hash: false });
    window.history.pushState({}, '', '/');
    navigate('/');

    const link = Link('/test', 'Test') as HTMLAnchorElement;
    assert.equal(link.getAttribute('href'), '/test');
  });

  it('in hash mode, href has # prefix', () => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '';
    navigate('/');

    const link = Link('/test', 'Test') as HTMLAnchorElement;
    assert.equal(link.getAttribute('href'), '#/test');
  });

  it('in path mode, Link click uses preventDefault + navigate', () => {
    _resetRouter();
    configureRouter({ hash: false });
    window.history.pushState({}, '', '/');
    navigate('/');

    const link = Link('/clicked', 'Click me') as HTMLAnchorElement;
    document.body.appendChild(link);
    link.click();
    assert.equal(currentRoute(), '/clicked');
    assert.equal(window.location.pathname, '/clicked');
    document.body.removeChild(link);
  });

  it('in hash mode, Link navigates via hash', () => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '';
    navigate('/');

    const link = Link('/clicked', 'Click me') as HTMLAnchorElement;
    document.body.appendChild(link);
    // In hash mode, clicking the link sets window.location.hash directly
    link.click();
    assert.equal(window.location.hash, '#/clicked');
    document.body.removeChild(link);
  });

  it('Link with reactive className works in both modes', () => {
    _resetRouter();
    configureRouter({ hash: true });
    navigate('/');

    const link = Link('/x', 'X', () => currentRoute() === '/x' ? 'active' : '') as HTMLAnchorElement;
    assert.equal(link.className, '');
    navigate('/x');
    assert.equal(link.className, 'active');
  });
});


/* ─────────────────────────────────────────────────────────
 * Nested routes with pass-through parent (docs-style)
 * ───────────────────────────────────────────────────────── */

describe('Router — nested pass-through routes (path mode)', () => {
  beforeEach(() => {
    _resetRouter();
    configureRouter({ hash: false });
    window.location.hash = '';
    window.history.pushState({}, '', '/');
    navigate('/');
  });

  const section = (_params: Record<string, string>, outlet?: Node) =>
    outlet ?? document.createTextNode('section-404');

  it('matches child route under parent prefix', () => {
    navigate('/core/signals');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core', view: section, children: [
        { path: '/signals', view: () => document.createTextNode('signals') },
        { path: '/templates', view: () => document.createTextNode('templates') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'signals');
  });

  it('navigates between children of the same parent', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/routing', view: section, children: [
        { path: '/router', view: () => document.createTextNode('router-page') },
        { path: '/configure', view: () => document.createTextNode('configure-page') },
        { path: '/nested', view: () => document.createTextNode('nested-page') },
        { path: '/navigate', view: () => document.createTextNode('navigate-page') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/routing/router');
    assert.equal(node.textContent, 'router-page');
    navigate('/routing/configure');
    assert.equal(node.textContent, 'configure-page');
    navigate('/routing/nested');
    assert.equal(node.textContent, 'nested-page');
  });

  it('navigates between children of different parents', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core', view: section, children: [
        { path: '/signals', view: () => document.createTextNode('signals') },
      ]},
      { path: '/routing', view: section, children: [
        { path: '/router', view: () => document.createTextNode('router') },
      ]},
      { path: '/data', view: section, children: [
        { path: '/http-client', view: () => document.createTextNode('http') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    navigate('/core/signals');
    assert.equal(node.textContent, 'signals');
    navigate('/routing/router');
    assert.equal(node.textContent, 'router');
    navigate('/data/http-client');
    assert.equal(node.textContent, 'http');
  });

  it('shows notFound when parent matches but no child matches', () => {
    navigate('/core/nonexistent');
    const node = Router([
      { path: '/core', view: section, children: [
        { path: '/signals', view: () => document.createTextNode('signals') },
      ]},
    ], () => document.createTextNode('global-404')) as HTMLElement;

    // The router passes the global notFound to the parent view as outlet
    // The section pass-through renders whatever outlet it receives
    assert.equal(node.textContent, 'global-404');
  });

  it('flat routes still work alongside nested routes', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core', view: section, children: [
        { path: '/signals', view: () => document.createTextNode('signals') },
      ]},
      { path: '/i18n', view: () => document.createTextNode('i18n') },
      { path: '/playground', view: () => document.createTextNode('playground') },
    ], () => document.createTextNode('404')) as HTMLElement;

    navigate('/i18n');
    assert.equal(node.textContent, 'i18n');
    navigate('/playground');
    assert.equal(node.textContent, 'playground');
    navigate('/core/signals');
    assert.equal(node.textContent, 'signals');
  });

  it('renders correct page on initial load at nested path', () => {
    _resetRouter();
    configureRouter({ hash: false });
    window.history.pushState({}, '', '/getting-started/install');

    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/getting-started', view: section, children: [
        { path: '/install', view: () => document.createTextNode('install') },
        { path: '/quickstart', view: () => document.createTextNode('quickstart') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(currentRoute(), '/getting-started/install');
    assert.equal(node.textContent, 'install');
  });
});

describe('Router — nested pass-through routes (hash mode)', () => {
  beforeEach(() => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '';
    navigate('/');
  });

  const section = (_params: Record<string, string>, outlet?: Node) =>
    outlet ?? document.createTextNode('section-404');

  it('matches child route under parent prefix in hash mode', () => {
    navigate('/core/signals');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/core', view: section, children: [
        { path: '/signals', view: () => document.createTextNode('signals') },
        { path: '/templates', view: () => document.createTextNode('templates') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(window.location.hash, '#/core/signals');
    assert.equal(node.textContent, 'signals');
  });

  it('navigates between nested children in hash mode', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/microfrontends', view: section, children: [
        { path: '/security', view: () => document.createTextNode('mfe-security') },
        { path: '/load-remote', view: () => document.createTextNode('mfe-load') },
        { path: '/isolation', view: () => document.createTextNode('mfe-isolation') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    navigate('/microfrontends/security');
    assert.equal(node.textContent, 'mfe-security');
    assert.equal(window.location.hash, '#/microfrontends/security');
    navigate('/microfrontends/load-remote');
    assert.equal(node.textContent, 'mfe-load');
    navigate('/microfrontends/isolation');
    assert.equal(node.textContent, 'mfe-isolation');
  });

  it('navigates between parents in hash mode', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/async', view: section, children: [
        { path: '/suspense', view: () => document.createTextNode('suspense') },
      ]},
      { path: '/streaming', view: section, children: [
        { path: '/websocket', view: () => document.createTextNode('ws') },
      ]},
      { path: '/theming', view: () => document.createTextNode('theme') },
    ], () => document.createTextNode('404')) as HTMLElement;

    navigate('/async/suspense');
    assert.equal(node.textContent, 'suspense');
    navigate('/streaming/websocket');
    assert.equal(node.textContent, 'ws');
    navigate('/theming');
    assert.equal(node.textContent, 'theme');
    navigate('/');
    assert.equal(node.textContent, 'home');
  });

  it('renders correct page on initial hash load at nested path', () => {
    _resetRouter();
    configureRouter({ hash: true });
    window.location.hash = '#/routing/configure';

    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/routing', view: section, children: [
        { path: '/router', view: () => document.createTextNode('router') },
        { path: '/configure', view: () => document.createTextNode('configure') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(currentRoute(), '/routing/configure');
    assert.equal(node.textContent, 'configure');
  });
});
