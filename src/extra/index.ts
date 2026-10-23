/**
 * expose all module routes using Vite glob imports
 *
 * import routes and sidebar items from src/extra/
 * modules
 *
 */
import type { ISidebarMenuItem } from '@core/models/SidebarMenuItem';
import type { RouteObject } from 'react-router';

/**
 * Pattern: src/extra/[moduleName]/routes.tsx
 */
const routeModules = import.meta.glob<{ default: Array<RouteObject> }>(
  './*/routes.tsx',
  { eager: true } // import at compile time
);

const routes: Array<RouteObject> = Object.values(routeModules).flatMap(
  (module) => module.default || []
);

/**
 * Pattern: src/extra/[moduleName]/sidebar.ts
 */
const sidebarModules = import.meta.glob<{ default: Array<ISidebarMenuItem> }>(
  './*/sidebar.ts',
  { eager: true }
);

const sidebar: Array<ISidebarMenuItem> = Object.values(sidebarModules).flatMap(
  (module) => module.default || []
);

export const extensions = { sidebar, routes };
