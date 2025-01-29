import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { PageRoutes } from './routes/routes';
import { Theme } from './utils/theme';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  useRouteError
} from 'react-router-dom';
import TelematicReceiptFlowExportOverview from './routes/TelematicReceiptFlowExportOverview';
import { ApiClient } from './components/ApiClient';
import { theme } from '@pagopa/mui-italia';

import './translations/i18n';
import utils from './utils';
import TelematicReceiptExportFlowReservation from './routes/TelematicReceiptExportFlowReservation';
import TelematicReceiptSearchResults from './routes/TelematicReceiptSearchResults';
import TelematicReceipt from './routes/TelematicReceipt';
import TelematicReceiptDetail from './routes/TelematicReceiptDetail';
import TelematicReceiptExportFlowThankYouPage from './routes/TelematicReceiptExportFlowThankYouPage';
import TelematicReceiptFlowImport from './routes/TelematicReceiptFlowImport';
import TelematicReceiptFlowImportThankYouPage from './routes/TelematicReceiptFlowImportThankYouPage';
import TelematicReceiptImportFlowOverview from './routes/TelematicReceiptImportFlowOverview';


import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import Reporting from './routes/Reporting';
import ReportingImportFlowOverview from './routes/ReportingImportFlowOverview';


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
          backButton: false
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.HOME,
            element: <Home />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT_EXPORT_OVERVIEW', color: theme.palette.text.disabled }
            ]
          },
          backButton: true
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW,
            element: <TelematicReceiptFlowExportOverview />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.disabled }
            ]
          },
          backButton: false
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT,
            element: <TelematicReceipt />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT_DETAIL', color: theme.palette.text.disabled }
            ]
          },
          backButton: true
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS,
            element: <TelematicReceiptSearchResults />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT_DETAIL,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT_SEARCH_RESULTS', color: theme.palette.text.primary },
              { name: 'TELEMATIC_RECEIPT_DETAIL', color: theme.palette.text.disabled }
            ]
          },
          backButton: true
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_DETAIL,
            element: <TelematicReceiptDetail />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION,
        element: <Layout />,
        handle: {
          backButton: true,
          sidebar: {
            visibile: false
          }
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION,
            element: <TelematicReceiptExportFlowReservation />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE,
        element: <Layout />,
        handle: {
          backButton: false,
          sidebar: {
            visibile: false
          }
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE,
            element: <TelematicReceiptExportFlowThankYouPage />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW,
        element: <Layout />,
        handle: {
          crumbs: {elements: [
            { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
            { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
            { name: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW', color: theme.palette.text.disabled }
          ]},
          backButton: true,
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW,
            element: <TelematicReceiptImportFlowOverview />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW,
        element: <Layout />,
        handle: {
          backButton: true,
          sidebar: {
            visibile: false
          },
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW,
            element: <TelematicReceiptFlowImport />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path:PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE,
        element: <Layout />,
        handle: {
          backButton: false,
          sidebar: {
            visibile: false
          },
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE,
            element: <TelematicReceiptFlowImportThankYouPage />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          },
        ]
      },
      {
        path: PageRoutes.REPORTING,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'REPORTING', color: theme.palette.text.disabled }
            ]
          },
          backButton: false
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.REPORTING,
            element: <Reporting />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      },
      {
        path: PageRoutes.REPORTING_IMPORT_OVERVIEW,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'REPORTING', color: theme.palette.text.primary },
              { name: 'REPORTING_IMPORT_FLOW_OVERVIEW', color: theme.palette.text.disabled}
            ]
          },
          backButton: true
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutes.REPORTING_IMPORT_OVERVIEW,
            element: <ReportingImportFlowOverview />,
            // TEMPORARY ERROR ELEMENT
            errorElement: <ErrorFallback />
          }
        ]
      }
    ]
  }
]);

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
