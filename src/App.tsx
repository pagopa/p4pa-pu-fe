import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { Theme } from './utils/theme';
import {
  Navigate,
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useRouteError
} from 'react-router-dom';
import { ApiClient } from './components/ApiClient';

import './translations/i18n';
import utils from './utils';

import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import config from './utils/config';
import { flowsRoutes } from './routes/flows';
import { importRoutes } from './routes/import';
import { detailRoutes } from './routes/detail';
import { exportRoutes } from './routes/export';
import { debtTypesRoutes } from './routes/debtTypes';
import { responsesRoutes } from './routes/responses';
import { debtPositionsRoutes } from './routes/debtPositions';

const deployPath = config.deployPath;

const routesDef = [
  {
    element: <ApiClient client={utils.apiClient} />,
    children: [
      {
        path: '*',
        element: <Navigate replace to={`${deployPath}/`} />,
        ErrorBoundary: () => {
          throw useRouteError();
        }
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
      ...flowsRoutes,
      ...importRoutes,
      ...detailRoutes,
      ...exportRoutes,
      ...debtTypesRoutes,
      ...responsesRoutes,
      ...debtPositionsRoutes
    ]
  }
];

const router = createBrowserRouter(routesDef);

const extractPathsWithIds = (
  routes: RouteObject[],
  basePath: string = ''
): { [key: string]: string } => {
  let paths: { [key: string]: string } = {};

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

export const App = () => {
  const {
    state: { appState }
  } = useStore();
  return (
    <ErrorBoundary fallback={<ErrorFallback onReset={() => window.location.replace('/')} />}>
      <Theme>
        <Overlay visible={appState.loading} />
        <RouterProvider router={router} />
      </Theme>
    </ErrorBoundary>
  );
};

export default App;
