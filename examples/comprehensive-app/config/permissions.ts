/**
 * RBAC permissions setup.
 * Demonstrates: setPermissions, guard, hasPermission
 */
import { createSignal } from '../../../src/index';
import { setPermissions } from '../../../src/core/guard';

export const userPermissions = createSignal(
  new Set(['admin', 'tasks:read', 'tasks:write', 'users:read', 'analytics:read'])
);

setPermissions(userPermissions);
