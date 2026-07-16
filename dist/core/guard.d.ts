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
export type PermissionCheck = string | string[] | ((permissions: Set<string>) => boolean);
/**
 * Set the reactive permissions source. Call once at app init with a signal
 * holding the current user's permissions/roles.
 */
export declare function setPermissions(source: Signal<Set<string>>): void;
/**
 * Get the current permissions set. Returns empty set if not configured.
 */
export declare function getPermissions(): Set<string>;
/**
 * Check if the current user has a specific permission/role.
 * Reactive — reads the permissions signal.
 */
export declare function hasPermission(permission: string): boolean;
/**
 * Check if the current user has ALL of the specified permissions.
 */
export declare function hasAllPermissions(permissions: string[]): boolean;
/**
 * Check if the current user has ANY of the specified permissions.
 */
export declare function hasAnyPermission(permissions: string[]): boolean;
/**
 * Guard a route view behind permission checks.
 * Returns a route handler that renders the view only if permissions pass,
 * otherwise renders the fallback (defaults to empty comment node).
 *
 * @param check - A permission string, array of required permissions, or custom predicate.
 * @param view - The view to render if authorized.
 * @param fallback - What to show if unauthorized (optional).
 */
export declare function guard(check: PermissionCheck, view: (params: RouteParams) => Node, fallback?: (params: RouteParams) => Node): (params: RouteParams) => Node;
/**
 * Reactive guard for inline use in templates.
 * Returns a function you can call inside `${() => ...}` that checks permissions.
 *
 * ```ts
 * html`${() => guardedNode(['admin'], () => AdminPanel())}`
 * ```
 */
export declare function guardedNode(check: PermissionCheck, render: () => Node, fallback?: () => Node): Node | null;
