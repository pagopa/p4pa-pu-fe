import { Layout } from '../components/layout/Layout';
import config from '../utils/config';
import { DebtPositionsResults } from './DebtPositions/DebtPositionsResults';

const deployPath = config.deployPath;

export const debtPositionsRoutes = [
  {
    id: 'DEBT_POSITIONS',
    path: `${deployPath}/debt-positions/`,
    element: <Layout />,
    children: [
      {
        id: 'DEBT_POSITIONS_RESULTS',
        path: 'results',
        element: <DebtPositionsResults />,
      }
    ]
  }
];
