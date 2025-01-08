import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { PageRoutes } from './routes/routes';
import { Theme } from './utils/theme';
import { Navigate, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';
import { ApiClient } from './components/ApiClient';

import './translations/i18n';
import TelematicReceiptExport from './routes/TelematicReceiptExport';
import utils from './utils';

const router = createBrowserRouter([
  {
    element: <ApiClient client={utils.apiClient} />,
    children: [
      {
        path: '*',
        element: <Navigate replace to={PageRoutes.HOME} />,
        ErrorBoundary: () => {
          throw useRouteError();
        }
      },
      {
        path: PageRoutes.HOME,
        element: <Layout />,
        handle: {
          backButton: false,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.HOME,
            element: <Home />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_EXPORT,
        element: <Layout />,
        handle: {
          backButton: false,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT,
            element: <TelematicReceiptExport />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
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
