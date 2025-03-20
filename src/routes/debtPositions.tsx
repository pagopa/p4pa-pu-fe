import DebtPositionResults from './DebtPositions/DebtPositionsResults';
import DebtPositionsImportOverview from './DebtPositionsImportOverview';
import DebtPositionsInstallmentDetail from './DebtPositionsInstallmentDetail';
import DebtPositionsPage from './DebtPositionsPage';
import config from '../utils/config';
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import DebtPositionDetail from './DebtPositionDetail/DebtPositionDetail';

const deployPath = config.deployPath;

export const debtPositionsRoutes = [
  {
    id: 'DEBT_POSITIONS',
    path: `${deployPath}/debt-positions/`,
    element: <Layout />,
    children: [
      {
        index: true,
        id: 'DEBT_POSITIONS_INDEX',
        element: <DebtPositionsPage />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITIONS_RESULTS',
        path: 'results',
        element: <DebtPositionResults />
      },
      {
        id: 'DEBT_POSITION_SEARCH_RESULTS',
        path: 'results-IUV',
        element: <DebtPositionResults />
      },
      {
        id: 'DEBT_POSITIONS_IMPORT_OVERVIEW',
        path: 'import-overview',
        element: <DebtPositionsImportOverview />,
        handle: {
          backButton: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITION_INSTALLMENT_DETAIL',
        path: 'installments/:id',
        element: <DebtPositionsInstallmentDetail />,
        handle: {
          custom: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITION_DETAIL',
        path: ':id',
        element: <DebtPositionDetail />
      }
    ]
  }
];
