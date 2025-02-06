import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { Layout } from './components/layout/Layout';
import { RouteHandleObject } from './models/Breadcrumbs';
import Home from './routes/Home';
import { PageRoutes, PageRoutesConf } from './routes/routes';
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
import TelematicReceiptFlowImportThankYouPage from './routes/TelematicReceiptFlowImportThankYouPage';
import TelematicReceiptImportFlowOverview from './routes/TelematicReceiptImportFlowOverview';
import ReportingSearchResults from './routes/ReportingSearchResults';
import Reporting from './routes/Reporting';
import ReportingImportFlowOverview from './routes/ReportingImportFlowOverview';
import ReportingFlowImportThankYouPage from './routes/ReportingFlowImportThankYouPage';
import ReportingDetail from './routes/ReportingDetail';
import Treasury from './routes/Treasury';
import TreasuryImportFlowOverview from './routes/TreasuryImportFlowOverview';

import { Overlay } from './components/Overlay';
import { useStore } from './store/GlobalStore';
import ImportFlow from './routes/ImportFlowPage';

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
          }
        ]
      },
      /* -- TELEMATIC RECEIPTS' SECTION -- */
      {
        path: PageRoutesConf.TELEMATIC_RECEIPT.path,
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
        /* -- TELEMATIC RECEIPTS CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <TelematicReceipt />,
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.EXPORT_OVERVIEW.path,
            element: <TelematicReceiptFlowExportOverview />,
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
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.SEARCH_RESULTS.path,
            element: <TelematicReceiptSearchResults />,
            handle: {
              crumbs: {
                elements: [
                  { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
                  { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
                ]
              },
              backButton: true
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.DETAIL.path,
            element: <TelematicReceiptDetail />,
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
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.EXPORT_FLOW_RESERVATION.path,
            element: <TelematicReceiptExportFlowReservation />,
            handle: {
              backButton: true,
              sidebar: {
                visibile: false
              }
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.EXPORT_FLOW_THANK_YOU_PAGE.path,
            element: <TelematicReceiptExportFlowThankYouPage />,
            handle: {
              backButton: false,
              sidebar: {
                visibile: false
              }
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.IMPORT_OVERVIEW.path,
            element: <TelematicReceiptImportFlowOverview />,
            handle: {
              crumbs: {elements: [
                { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
                { name: 'TELEMATIC_RECEIPT', color: theme.palette.text.primary },
                { name: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW', color: theme.palette.text.disabled }
              ]},
              backButton: true,
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.TELEMATIC_RECEIPT.children?.IMPORT_FLOW_THANK_YOU_PAGE.path,
            element: <TelematicReceiptFlowImportThankYouPage />,
            handle: {
              backButton: true,
              sidebar: {
                visibile: false
              },
            } as RouteHandleObject,
          },
        ]
      },
      /* -- END - TELEMATIC RECEIPTS' SECTION -- */
      /* -- REPORTING SECTION -- */
      {
        path: PageRoutesConf.REPORTING.path,
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
        /* -- REPORTING SECTION CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <Reporting />,
          },
          {
            path: PageRoutesConf.REPORTING.children?.SEARCH_RESULTS.path,
            element: <ReportingSearchResults />,
            handle: {
              crumbs: {
                elements: [
                  { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
                  { name: 'REPORTING', color: theme.palette.text.primary },
                  { name: 'REPORTING_SEARCH_RESULTS', color: theme.palette.text.disabled }
                ]
              },
              backButton: true
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.REPORTING.children?.DETAIL.path,
            element: <ReportingDetail />,
            handle: ({params}: {params: Record<string, string>}) => ({
              crumbs: {
                elements: [
                  { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
                  { name: 'REPORTING', color: theme.palette.text.primary },
                  { name: 'REPORTING_SEARCH_RESULTS', color: theme.palette.text.primary },
                  { name: params.id, color: theme.palette.text.disabled}
                ]
              },
              backButton: true
            }) as RouteHandleObject,
          },
          {
            path: PageRoutesConf.REPORTING.children?.IMPORT_FLOW_THANK_YOU_PAGE.path,
            element: <ReportingFlowImportThankYouPage />,
            handle: {
              backButton: true,
              sidebar: {
                visibile: false
              },
            } as RouteHandleObject,
          },
          {
            path: PageRoutesConf.REPORTING.children?.IMPORT_OVERVIEW.path,
            element: <ReportingImportFlowOverview />,
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
          },
        ]
      },
      /* -- END - REPORTING SECTION -- */
      /* -- TREASURY SECTION -- */
      {
        path: PageRoutesConf.TREASURY.path,
        element: <Layout />,
        handle: {
          crumbs: {
            elements: [
              { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
              { name: 'TREASURY', color: theme.palette.text.disabled }
            ]
          },
          backButton: false
        } as RouteHandleObject,
        /* -- TREASURY SECTION CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <Treasury />,
          },
          {
            path: PageRoutesConf.TREASURY.children?.IMPORT_OVERVIEW.path,
            element: <TreasuryImportFlowOverview />,
            handle: {
              crumbs: {
                elements: [
                  { name: 'FLOWS', fontWeight: 600, color: theme.palette.text.primary },
                  { name: 'TREASURY', color: theme.palette.text.primary },
                  { name: 'TREASURY_IMPORT_OVERVIEW', color: theme.palette.text.disabled}
                ]
              },
              backButton: true
            } as RouteHandleObject,
          },
        ]
      },
      /* -- END - TREASURY SECTION -- */
      /* -- IMPORT SECTION -- */
      {
        path: PageRoutesConf.IMPORT.path,
        element: <Layout />,
        handle: {
          backButton: true
        } as RouteHandleObject,
        children: [
          {
            path: PageRoutesConf.IMPORT.children?.FLOWS.path,
            element: <ImportFlow />,
          }
        ]
      }
      /* -- END - IMPORT SECTION -- */
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
