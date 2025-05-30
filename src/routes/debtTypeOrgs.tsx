import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypeDetailView from './DebtTypeDetailView/DebtTypeDetailView';
import DebtTypesCreated from './DebtTypesCreated/DebtTypesCreated';
import { DebtTypeOrgCreate } from './DebtTypeOrgCreate';
import { RouteObject } from 'react-router';
import { AdminRouteGuard } from '../components/RouteGuard/RouteGuard';

const deployPath = config.deployPath;

export const debtTypeOrgsRoutes: Array<RouteObject> = [
  {
    id: 'DEBT_TYPES_DASHBOARD',
    path: `${deployPath}/debt-types/dashboard/`,
    element: (
      <AdminRouteGuard>
        <Layout />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <DebtTypesCreated />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_ORG_DETAIL',
        path: 'detail/:debtPositionTypeOrgId',
        element: <DebtTypeDetailView />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_ORG_CREATE',
        path: 'new',
        element: <DebtTypeOrgCreate />,
        handle: {
          backButton: true,
          backButtonText: 'commons.exit',
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_ORG_EDIT',
        path: 'edit/:debtPositionTypeOrgId',
        element: <DebtTypeOrgCreate edit />,
        handle: {
          backButton: true,
          backButtonText: 'commons.exit',
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      }
    ]
  }
];
