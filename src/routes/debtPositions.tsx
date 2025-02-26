import { DebtPositionsPage } from '../components/DebtPositionsPage';
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';

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
        } as RouteHandleObject,
      }
    ]
  }
];