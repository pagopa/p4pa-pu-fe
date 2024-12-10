import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { PageRoutes } from './routes/routes';
import { Theme } from './utils/theme';
import { Navigate, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';

import './translations/i18n';

const router = createBrowserRouter([
  {
    element: <Layout />,
    ErrorBoundary: () => {
      throw useRouteError();
    }, 
    children: [
      {
        path:PageRoutes.HOME,
        element: <Home />,
        handle: {
          backButton: false,
        } as RouteHandleObject
      },
      {
        path: '*',
        element: <Navigate replace to={PageRoutes.HOME} />,
      }
    ]
    
  }
]);

export const App = () => (
  <ErrorBoundary fallback={<ErrorFallback onReset={() => window.location.replace('/')} />}>
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  </ErrorBoundary>
);

export default App;
