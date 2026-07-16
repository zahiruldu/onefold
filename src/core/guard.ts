/**
 * RBAC / Permission guards for routes and components.
 *
 * Integrates with the DI system — provide a permissions set, then guard
 * routes or UI sections declaratively.
 *
 * Usage:
 * ```ts
 * // Provide permissions (e.g., from auth token)
 * const PERMISSIONS = createToken<Signal<Set<string>>>('permissions');
 * provide(PERMISSIONS, createSignal(new Set(['admin', 'billing:read'])));
 *
 * // Guard a route
 * Router([
 *   { path: '/admin', view: guard(['admin'], AdminPage, AccessDenied) },
 *   { path: '/billing', view: guard(['billing:read'], BillingPage) },
 * ], NotFound);
 *
 * // Guard a component section
 * html`${() => hasRole('billing:write') ? EditButton() : null}`
 * ```
 */

import type { Signal } from './signal';
import type { RouteParams } from '../router/router';

/* ────────────────── Types ────────────────── */

export type PermissionCheck = string | string[] | ((permissions: Set<string>) => boolean);

/* ────────────────── Permission source ────────────────── */

let permissionsSource: Signal<Set<string>> | null = null;

/**
 * Set the reactive permissions source. Call once at app init with a signal
 * holding the current user's permissions/roles.
 */
export function setPermissions(source: Signal<Set<string>>): void {
  permissionsSource = source;
}

/**
 * Get the current permissions set. Returns empty set if not configured.
 */
export function getPermissions(): Set<string> {
  return permissionsSource ? permissionsSource() : new Set();
}

/**
 * Check if the current user has a specific permission/role.
 * Reactive — reads the permissions signal.
 */
export function hasPermission(permission: string): boolean {
  return getPermissions().has(permission);
}

/**
 * Check if the current user has ALL of the specified permissions.
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const current = getPermissions();
  return permissions.every((p) => current.has(p));
}

/**
 * Check if the current user has ANY of the specified permissions.
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const current = getPermissions();
  return permissions.some((p) => current.has(p));
}

/* ────────────────── Route guard ────────────────── */

/**
 * Guard a route view behind permission checks.
 * Returns a route handler that renders the view only if permissions pass,
 * otherwise renders the fallback (defaults to empty comment node).
 *
 * @param check - A permission string, array of required permissions, or custom predicate.
 * @param view - The view to render if authorized.
 * @param fallback - What to show if unauthorized (optional).
 */
export function guard(
  check: PermissionCheck,
  view: (params: RouteParams) => Node,
  fallback?: (params: RouteParams) => Node
): (params: RouteParams) => Node {
  return (params: RouteParams): Node => {
    if (checkPermission(check)) {
      return view(params);
    }
    return fallback ? fallback(params) : document.createComment('unauthorized');
  };
}

/**
 * Reactive guard for inline use in templates.
 * Returns a function you can call inside `${() => ...}` that checks permissions.
 *
 * ```ts
 * html`${() => guardedNode(['admin'], () => AdminPanel())}`
 * ```
 */
export function guardedNode(
  check: PermissionCheck,
  render: () => Node,
  fallback?: () => Node
): Node | null {
  if (checkPermission(check)) return render();
  return fallback ? fallback() : null;
}

/* ────────────────── Internal ────────────────── */

function checkPermission(check: PermissionCheck): boolean {
  const perms = getPermissions();
  if (typeof check === 'function') return check(perms);
  if (typeof check === 'string') return perms.has(check);
  // Array: require ALL
  return check.every((p) => perms.has(p));
}
