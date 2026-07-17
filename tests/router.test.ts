import './setup.ts';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Router, navigate, currentRoute, Link } from '../src/router/router.ts';

// Reset path to '/' before each test
beforeEach(() => {
  window.history.pushState({}, '', '/');
  navigate('/');
});

describe('Router — flat routes', () => {
  it('renders the matching view for the current path', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/about', view: () => document.createTextNode('about') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
  });

  it('renders notFound when no route matches', () => {
    navigate('/unknown');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, '404');
  });

  it('updates reactively when navigate() is called', () => {
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/about', view: () => document.createTextNode('about') },
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/about');
    assert.equal(node.textContent, 'about');
  });

  it('extracts dynamic params from the path', () => {
    navigate('/posts/42');
    let captured: Record<string, string> = {};
    Router([
      { path: '/posts/:id', view: (params) => { captured = params; return document.createTextNode(params.id ?? ''); } },
    ], () => document.createTextNode('404'));

    assert.equal(captured.id, '42');
  });

  it('supports simple record syntax', () => {
    const node = Router({
      '/': () => document.createTextNode('home'),
      '/about': () => document.createTextNode('about'),
    }, () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'home');
    navigate('/about');
    assert.equal(node.textContent, 'about');
  });
});

describe('Router — nested routes (children)', () => {
  it('renders parent with child outlet using relative paths', () => {
    navigate('/settings/profile');
    const node = Router([
      { path: '/settings', view: (_params, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('layout:'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/profile', view: () => document.createTextNode('profile-page') },
        { path: '/billing', view: () => document.createTextNode('billing-page') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'layout:profile-page');
  });

  it('switches child view when navigating between siblings', () => {
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
    navigate('/settings/billing');
    assert.equal(node.textContent, 'layout:billing');
  });

  it('shows notFound inside parent when no child matches', () => {
    navigate('/settings/unknown');
    const node = Router([
      { path: '/settings', view: (_p, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('layout:'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/profile', view: () => document.createTextNode('profile') },
      ]},
    ], () => document.createTextNode('not-found')) as HTMLElement;

    assert.equal(node.textContent, 'layout:not-found');
  });

  it('supports dynamic params in child routes', () => {
    navigate('/users/99');
    let captured: Record<string, string> = {};
    Router([
      { path: '/users', view: (_p, outlet) => outlet ?? document.createTextNode(''), children: [
        { path: '/:id', view: (params) => { captured = params; return document.createTextNode(`user-${params.id}`); } },
      ]},
    ], () => document.createTextNode('404'));

    assert.equal(captured.id, '99');
  });

  it('supports deeply nested routes (3 levels)', () => {
    navigate('/admin/users/5');
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

    assert.equal(node.textContent, 'admin>users>detail-5');
  });

  it('falls back to flat route when path does not match nested prefix', () => {
    navigate('/about');
    const node = Router([
      { path: '/', view: () => document.createTextNode('home') },
      { path: '/about', view: () => document.createTextNode('about') },
      { path: '/settings', view: (_p, outlet) => outlet ?? document.createTextNode(''), children: [
        { path: '/profile', view: () => document.createTextNode('profile') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'about');
  });

  it('child with path "/" matches the parent path exactly (index route)', () => {
    navigate('/settings');
    const node = Router([
      { path: '/settings', view: (_p, outlet) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode('layout:'));
        if (outlet) div.appendChild(outlet);
        return div;
      }, children: [
        { path: '/', view: () => document.createTextNode('settings-index') },
        { path: '/profile', view: () => document.createTextNode('profile') },
      ]},
    ], () => document.createTextNode('404')) as HTMLElement;

    assert.equal(node.textContent, 'layout:settings-index');
  });
});

describe('navigate + currentRoute', () => {
  it('currentRoute reflects the latest navigation', () => {
    navigate('/');
    assert.equal(currentRoute(), '/');
    navigate('/test');
    assert.equal(currentRoute(), '/test');
  });
});

describe('Link', () => {
  it('creates an anchor element with href', () => {
    const link = Link('/about', 'About') as HTMLElement;
    assert.equal(link.tagName.toLowerCase(), 'a');
    assert.equal(link.getAttribute('href'), '/about');
    assert.equal(link.textContent, 'About');
  });

  it('navigates on click without page reload', () => {
    const link = Link('/test-link', 'Test') as HTMLElement;
    document.body.appendChild(link);
    link.click();
    assert.equal(currentRoute(), '/test-link');
    document.body.removeChild(link);
  });

  it('applies static className', () => {
    const link = Link('/x', 'X', 'nav-link') as HTMLElement;
    assert.equal(link.className, 'nav-link');
  });

  it('applies reactive className', () => {
    navigate('/');
    const link = Link('/about', 'About', () => currentRoute() === '/about' ? 'active' : 'idle') as HTMLElement;
    assert.equal(link.className, 'idle');
    navigate('/about');
    assert.equal(link.className, 'active');
  });
});
