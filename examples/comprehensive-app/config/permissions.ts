/**
 * RBAC permissions setup.
 * Demonstrates: setPermissions, guard, hasPermission
 */
import { createSignal, setPermissions } from '../../../src/index';

export const userPermissions = createSignal(
  new Set(['admin', 'tasks:read', 'tasks:write', 'users:read', 'analytics:read'])
);

setPermissions(userPermissions);
