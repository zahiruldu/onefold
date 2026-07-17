export type RouteParams = Record<string, string>;
export type RouteHandler = (params: RouteParams, outlet?: Node) => Node;
export interface RouteDefinition {
    path: string;
    view: RouteHandler;
    /** Nested child routes. The parent's view receives an `outlet` Node for rendering children. */
    children?: RouteDefinition[];
}
export type Routes = Record<string, () => Node> | RouteDefinition[];
/** Navigate without a full page reload. */
export declare function navigate(path: string): void;
/** Read the current route path reactively. */
export declare function currentRoute(): string;
/**
 * Mounts the view matching the current path, swapping reactively on navigate().
 *
 * Supports:
 * - Simple record: `{ '/': HomeView, '/about': AboutView }`
 * - Route definitions with params: `[{ path: '/posts/:id', view: (params) => ... }]`
 * - Nested routes with children:
 *   ```ts
 *   Router([
 *     { path: '/', view: () => HomePage() },
 *     { path: '/settings', view: (params, outlet) => SettingsLayout(outlet), children: [
 *       { path: '/settings/profile', view: () => ProfilePage() },
 *       { path: '/settings/billing', view: () => BillingPage() },
 *     ]},
 *   ], NotFound);
 *   ```
 */
export declare function Router(routes: Routes, notFound: () => Node): Node;
/**
 * A reactive link component that uses client-side navigation.
 */
export declare function Link(href: string, child: Node | string, className?: string | (() => string)): Node;
