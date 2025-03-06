import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import DebtPositionsInstallmentDetail from './DebtPositionsInstallmentDetail';
import DebtPositionResults from './DebtPositions/DebtPositionsResults';
import DebtPositionsPage from './DebtPositionsPage';

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
        element: <DebtPositionResults />,
      },
      {
        id: 'DEBT_POSITION_INSTALLMENT_DETAIL',
        path: 'installment-detail',
        element: <DebtPositionsInstallmentDetail />,
      },
    ]
  }
];
