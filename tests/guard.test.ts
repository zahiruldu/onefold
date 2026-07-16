import './setup.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSignal } from '../src/core/signal.ts';
import { setPermissions, hasPermission, hasAllPermissions, hasAnyPermission, guard } from '../src/core/guard.ts';

describe('RBAC guards', () => {
  // Setup permissions
  const perms = createSignal(new Set(['admin', 'billing:read', 'users:write']));
  setPermissions(perms);

  it('hasPermission checks single permission', () => {
    assert.equal(hasPermission('admin'), true);
    assert.equal(hasPermission('superadmin'), false);
  });

  it('hasAllPermissions requires all', () => {
    assert.equal(hasAllPermissions(['admin', 'billing:read']), true);
    assert.equal(hasAllPermissions(['admin', 'superadmin']), false);
  });

  it('hasAnyPermission requires at least one', () => {
    assert.equal(hasAnyPermission(['superadmin', 'admin']), true);
    assert.equal(hasAnyPermission(['superadmin', 'root']), false);
  });

  it('guard renders view when authorized', () => {
    const view = guard(['admin'], () => document.createTextNode('admin panel'));
    const node = view({});
    assert.equal(node.textContent, 'admin panel');
  });

  it('guard renders fallback when unauthorized', () => {
    const view = guard(
      ['superadmin'],
      () => document.createTextNode('secret'),
      () => document.createTextNode('denied')
    );
    const node = view({});
    assert.equal(node.textContent, 'denied');
  });

  it('guard with custom predicate', () => {
    const view = guard(
      (perms) => perms.size > 2,
      () => document.createTextNode('ok')
    );
    assert.equal(view({}).textContent, 'ok');
  });

  it('reacts to permission changes', () => {
    assert.equal(hasPermission('billing:read'), true);
    perms.set(new Set(['admin']));
    assert.equal(hasPermission('billing:read'), false);
    // Restore
    perms.set(new Set(['admin', 'billing:read', 'users:write']));
  });
});
