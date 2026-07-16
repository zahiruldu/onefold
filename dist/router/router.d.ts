export type RouteParams = Record<string, string>;
export type RouteHandler = (params: RouteParams) => Node;
export interface RouteDefinition {
    path: string;
    view: RouteHandler;
}
export type Routes = Record<string, () => Node> | RouteDefinition[];
/** Navigate without a full page reload. Updates history and every subscribed route. */
export declare function navigate(path: string): void;
/** Read the current route path reactively. */
export declare function currentRoute(): string;
/**
 * Mounts the view matching the current path, swapping it reactively on navigate().
 *
 * Supports two route formats:
 * - Simple record: `{ '/': HomeView, '/about': AboutView }`
 * - Route definitions with params: `[{ path: '/posts/:id', view: (params) => ... }]`
 */
export declare function Router(routes: Routes, notFound: () => Node): Node;
/**
 * A reactive link component that uses client-side navigation.
 * Intercepts clicks and calls navigate() instead of a full page reload.
 */
export declare function Link(href: string, child: Node | string, className?: string | (() => string)): Node;
