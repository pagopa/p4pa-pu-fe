import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypes from './DebtTypes/DebtTypes';

const deployPath = config.deployPath;

export const debtTypesRoutes = [
  {
    id: 'DEBT_TYPES',
    path: `${deployPath}/debt-types/`,
    element: <Layout />,
    children: [
      {
        id: 'DEBT_TYPES_CATALOG',
        path: 'catalog',
        element: <DebtTypes />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      }
    ]
  }
];
