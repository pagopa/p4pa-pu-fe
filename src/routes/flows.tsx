import { LoaderFunction, LoaderFunctionArgs, Navigate } from 'react-router';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import Conservation from './Conservation';
import TelematicReceipt from './TelematicReceipt';
import TelematicReceiptImportFlowOverview from './TelematicReceiptImportFlowOverview';
import TelematicReceiptSearchResults from './TelematicReceiptSearchResults';
import Treasury from './Treasury';
import TreasuryImportFlowOverview from './TreasuryImportFlowOverview';
import TreasurySearchResults from './TreasurySearchResults';
import { TelematicReceiptDetail } from './TelematicReceiptDetail';
import TreasuryDetail from './TreasuryDetail';
import TelematicReceiptFlowExportOverview from './TelematicReceiptFlowExportOverview';
import { Reporting } from './Reporting/ReportingPage';
import ReportingSearchResults from './Reporting/ReportingSearchResults';
import ReportingDetail from './Reporting/ReportingDetail/ReportingDetail';
import ReportingPaymentDetail from './Reporting/ReportingPaymentDetail';
import ReportingImportFlowOverview from './Reporting/ReportingImportFlowOverview';

const deployPath = config.deployPath;

const loaderWithId: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  return params.id;
};

export const flowsRoutes = [
  {
    path: `flows/`,
    id: 'FLOWS',
    handle: {
      backButton: false
    } as RouteHandleObject,
    /* -- TELEMATIC RECEIPTS CHILDREN ROUTES -- */
    children: [
      {
        element: <Navigate replace to={`${deployPath}/`} />,
        index: true
      },
      /* -- TELEMATIC RECEIPTS' SECTION -- */
      {
        path: 'telematic-receipt/',
        id: 'TELEMATIC_RECEIPT',
        /* -- TELEMATIC RECEIPTS CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <TelematicReceipt />,
            id: 'TELEMATIC_RECEIPT_INDEX',
            handle: {
              backButton: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          },
          {
            element: <TelematicReceiptDetail />,
            id: 'TELEMATIC_RECEIPT_DETAIL',
            path: ':receiptId',
            handle: {
              backButton: true,
              sidebar: {
                visible: false
              }
            } as RouteHandleObject
          },
          {
            id: 'TELEMATIC_RECEIPT_EXPORT_OVERVIEW',
            path: 'export-overview',
            element: <TelematicReceiptFlowExportOverview />,
            handle: {
              backButton: true
            } as RouteHandleObject
          },
          {
            id: 'TELEMATIC_RECEIPT_SEARCH_RESULTS',
            path: 'search-results',
            element: <TelematicReceiptSearchResults />,
            handle: {
              backButton: true
            } as RouteHandleObject
          },
          {
            id: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW',
            path: 'import-overview',
            element: <TelematicReceiptImportFlowOverview />,
            handle: {
              backButton: true
            } as RouteHandleObject
          }
        ]
      },
      /* -- END - TELEMATIC RECEIPTS' SECTION -- */
      /* -- REPORTING SECTION -- */
      {
        id: 'REPORTING',
        path: 'reporting/',
        /* -- REPORTING SECTION CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <Reporting />,
            id: 'REPORTING_INDEX',
            handle: {
              backButton: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          },
          {
            id: 'REPORTING_SEARCH_RESULTS',
            path: 'search-results',
            element: <ReportingSearchResults />,
            handle: {
              backButton: true
            } as RouteHandleObject
          },
          {
            element: <ReportingDetail />,
            id: 'REPORTING_DETAIL',
            path: ':id',
            loader: loaderWithId,
            handle: {
              backButton: true
            } as RouteHandleObject
          },
          {
            element: <ReportingPaymentDetail />,
            id: 'REPORTING_PAYMENT_DETAIL',
            path: ':iuf/:id/',
            handle: {
              backButton: true,
              custom: true
            } as RouteHandleObject
          },
          {
            id: 'REPORTING_IMPORT_OVERVIEW',
            path: 'import-overview',
            element: <ReportingImportFlowOverview />,
            handle: {
              backButton: true
            } as RouteHandleObject
          }
        ]
      },
      /* -- END - REPORTING SECTION -- */
      /* -- TREASURY SECTION -- */
      {
        id: 'TREASURY',
        path: 'treasury/',
        /* -- TREASURY SECTION CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <Treasury />,
            id: 'TREASURY_INDEX',
            handle: {
              backButton: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          },
          {
            id: 'TREASURY_IMPORT_OVERVIEW',
            path: 'import-overview',
            element: <TreasuryImportFlowOverview />,
            handle: {
              backButton: true
            } as RouteHandleObject
          },
          {
            id: 'TREASURY_SEARCH_RESULTS',
            path: 'search-results',
            element: <TreasurySearchResults />,
            handle: {
              backButton: false
            } as RouteHandleObject
          },
          {
            id: 'TREASURY_DETAIL',
            path: ':id',
            element: <TreasuryDetail />,
            loader: loaderWithId,
            handle: {
              backButton: true
            } as RouteHandleObject
          }
        ]
      },
      /* -- END - TREASURY SECTION -- */
      /* -- CONSERVATION SECTION -- */
      {
        id: 'CONSERVATION',
        path: 'conservation/',
        /* -- CONSERVATION SECTION CHILDREN ROUTES -- */
        children: [
          {
            index: true,
            element: <Conservation />,
            id: 'CONSERVATION_INDEX',
            handle: {
              backButton: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          }
        ]
      } /* -- END - CONSERVATION SECTION -- */
    ]
  }
];
