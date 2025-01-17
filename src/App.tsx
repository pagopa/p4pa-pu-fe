import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { PageRoutes } from './routes/routes';
import { Theme } from './utils/theme';
import { Navigate, RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom';
import TelematicReceiptFlowExportOverview from './routes/TelematicReceiptFlowExportOverview';
import { ApiClient } from './components/ApiClient';
import { theme } from '@pagopa/mui-italia';

import './translations/i18n';
import utils from './utils';
import TelematicReceiptExportFlowReservation from './routes/TelematicReceiptExportFlowReservation';
import TelematicReceiptSearchResults from './routes/TelematicReceiptSearchResults';
import TelematicReceipt from './routes/TelematicReceipt';
import TelematicReceiptExportFlowThankYouPage from './routes/TelematicReceiptExportFlowThankYouPage';



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
        path:PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW,
        element: <Layout />,
        handle: {
          crumbs: {elements: [
            { name: 'flows', fontWeight: 600, color: theme.palette.text.primary },
            { name: 'telematicreceipt', color: theme.palette.text.primary },
            { name: 'telematicReceiptFlowExportOverview', color: theme.palette.text.disabled }
          ]},
          backButton: true,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW,
            element: <TelematicReceiptFlowExportOverview />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'flows', fontWeight:600, color: theme.palette.text.primary },
              { name: 'telematicreceipt', color: theme.palette.text.disabled }
            ]
          },
          backButton: false,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT,
            element: <TelematicReceipt />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'flows', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'telematicreceipt', color: theme.palette.text.primary },
              { name: 'telematicreceiptsearchresults', color: theme.palette.text.disabled }
            ]
          },
          backButton: true,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS,
            element: <TelematicReceiptSearchResults />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION,
        element: <Layout />,
        handle: {
          backButton: true,
          sidebar: {
            visibile: false
          },
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION,
            element: <TelematicReceiptExportFlowReservation />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE,
        element: <Layout />,
        handle: {
          backButton: false,
          sidebar: {
            visibile: false
          },
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE,
            element: <TelematicReceiptExportFlowThankYouPage />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
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
