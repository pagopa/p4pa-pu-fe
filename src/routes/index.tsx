import { createBrowserRouter, Navigate, RouteObject } from 'react-router';
import utils from '../utils';
import { setupOrError, setupFallback } from '../utils/setup';
import { Layout } from '../components/layout/Layout';
import Home from './Home';
import { RouteHandleObject } from '../models/Routes';
import AuthCallback from './AuthCallback';
import { postTokenOrError } from '../api/token';
import LoggedOut from './UtilityPages/loggedout';
import ErrorPage from './UtilityPages/error';
import { flowsRoutes } from '../routes/flows';
import { importRoutes } from '../routes/import';
import { classificationsRoutes } from '../routes/classifications';
import { detailRoutes } from '../routes/detail';
import { exportRoutes } from '../routes/export';
import { debtTypesRoutes } from '../routes/debtTypes';
import { responsesRoutes } from '../routes/responses';
import { debtPositionsRoutes } from '../routes/debtPositions';
import { backofficeRoutes } from '../routes/backoffice';
import { debtTypeOrgsRoutes } from '../routes/debtTypeOrgs';

const deployPath = utils.config.deployPath;

const routesDef = [
  {
    path: '*',
    element: <Navigate replace to={`${deployPath}/home`} />
  },
  {
    path: `${deployPath}/`,
    element: <Layout />,
    loader: setupOrError,
    HydrateFallback: setupFallback,
    shouldRevalidate: () => false,
    children: [
      {
        element: <Navigate replace to={`${deployPath}/home`} />,
        index: true
      },
      {
        path: `home`,
        element: <Home />,
        id: 'HOME',
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      ...flowsRoutes,
      ...importRoutes,
      ...detailRoutes,
      ...exportRoutes,
      ...debtTypesRoutes,
      ...debtTypeOrgsRoutes,
      ...responsesRoutes,
      ...debtPositionsRoutes,
      ...classificationsRoutes,
      ...backofficeRoutes
    ]
  },
  {
    path: `${deployPath}/auth-callback`,
    element: <AuthCallback />,
    loader: postTokenOrError
  },
  {
    id: 'LOGGED_OUT',
    path: `${deployPath}/loggedout`,
    element: <LoggedOut />
  },
  {
    id: 'ERROR',
    path: `${deployPath}/errorBlocking`,
    element: <ErrorPage />
  }
];

const router = createBrowserRouter(routesDef);

const extractPathsWithIds = (
  routes: Array<RouteObject>,
  basePath = ''
): Record<string, string> => {
  let paths: Record<string, string> = {};

  routes.forEach((route) => {
    const fullPath = `${basePath}${route.path || ''}`;

    paths[route.id || 'none'] = fullPath;

    if (route.children) {
      const childPaths = extractPathsWithIds(route.children, fullPath);
      paths = { ...paths, ...childPaths };
    }
  });

  return paths;
};

export const PageRoutes = extractPathsWithIds(routesDef);
export default router;
