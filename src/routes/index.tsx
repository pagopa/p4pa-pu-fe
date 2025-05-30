import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouteObject
} from 'react-router';
import utils from '../utils';
import { setup } from '../setup';
import { Layout } from '../components/layout/Layout';
import Home from './Home';
import { RouteHandleObject } from '../models/Routes';
import AuthCallback from './AuthCallback';
import { postToken } from '../api/token';
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
    path: '/',
    element: <Outlet />,
    loader: setup,
    children: [
      {
        path: '*',
        element: <Navigate replace to={`${deployPath}/`} />
      },
      {
        path: `${deployPath}/`,
        element: <Layout />,
        children: [
          {
            path: `${deployPath}/`,
            element: <Home />,
            id: 'HOME',
            index: true,
            handle: {
              backButton: false,
              hideBreadcrumbs: true
            } as RouteHandleObject
          }
        ]
      },
      {
        path: `${deployPath}/auth-callback`,
        element: <AuthCallback />,
        loader: postToken
      },
      {
        id: 'LOGGED_OUT',
        path: `${deployPath}/loggedout`,
        element: <LoggedOut />
      },
      {
        id: 'ERROR',
        path: `${deployPath}/blockingError`,
        element: <ErrorPage />
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
