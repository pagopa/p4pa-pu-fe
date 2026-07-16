import { createBrowserRouter, Navigate, RouteObject } from 'react-router';
import utils from '../utils';
import { setupFallback, appSetup } from '../utils/setup';
import { assessmentRoutes } from '../routes/assessment';
import AuthCallback from './AuthCallback';
import { backofficeRoutes } from '../routes/backoffice';
import CallbackPage from './CallbackPage/CallbackPage';
import { classificationsRoutes } from '../routes/classifications';
import { CourtesyPage } from '../routes/CourtesyPage';
import { debtPositionsRoutes } from '../routes/debtPositions';
import { debtTypeOrgsRoutes } from '../routes/debtTypeOrgs';
import { debtTypesRoutes } from '../routes/debtTypes';
import { detailRoutes } from '../routes/detail';
import ErrorPage from './UtilityPages/error';
import { exportRoutes } from '../routes/export';
import { flowsRoutes } from '../routes/flows';
import Home from './Home';
import { importRoutes } from '../routes/import';
import { Layout } from '../components/layout/Layout';
import LoggedOut from './UtilityPages/loggedout';
import { operatorsRoutes } from '../routes/operators';
import { organizationsRoutes } from './organizations';
import { postTokenOrError } from '../api/token';
import { responsesRoutes } from '../routes/responses';
import { RouteHandleObject } from '../models/Routes';
import IoMessageGuidePage from './IoMessageGuidePage/IoMessageGuidePage';
import ResourcePage from './ResourcePage/ResourcePage';
import { extensions } from '@extra/index';

const deployPath = utils.config.deployPath;

const routesDef: Array<RouteObject> = [
  {
    path: '*',
    element: <Navigate replace to={`${deployPath}/home`} />
  },
  {
    path: `${deployPath}/`,
    element: <Layout />,
    loader: appSetup,
    HydrateFallback: setupFallback,
    shouldRevalidate: () => false,
    children: [
      ...extensions.routes,
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
      {
        id: 'DRAFT_COURTESY_PAGE',
        path: 'organization/:organizationId/draft',
        element: <CourtesyPage />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'IO_MESSAGE_GUIDE',
        path: 'io-message-guide',
        element: <IoMessageGuidePage />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      ...organizationsRoutes,
      ...assessmentRoutes,
      ...backofficeRoutes,
      ...classificationsRoutes,
      ...debtPositionsRoutes,
      ...debtTypeOrgsRoutes,
      ...debtTypesRoutes,
      ...detailRoutes,
      ...exportRoutes,
      ...flowsRoutes,
      ...importRoutes,
      ...operatorsRoutes,
      ...responsesRoutes,
      {
        id: 'PRIVACYPOLICY',
        path: 'informativa-privacy',
        element: <ResourcePage resource="pp" />
      },
      {
        id: 'TOS',
        path: 'termini-di-servizio',
        element: <ResourcePage resource="tos" />
      }
    ]
  },
  {
    path: `${deployPath}/auth-callback`,
    element: <AuthCallback />,
    loader: postTokenOrError
  },
  {
    path: `${deployPath}/checkout-callback/:outcome`,
    element: <CallbackPage />
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
