import { DebtTypes } from '../components/DebtTypes';
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';

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
          backButton: true
        } as RouteHandleObject,
      }
    ]
  }
];