import { RouteHandleObject } from '../models/Routes';
import DebtTypeDetailView from './DebtTypeDetailView/DebtTypeDetailView';
import DebtTypesCreated from './DebtTypesCreated/DebtTypesCreated';
import { DebtTypeOrgCreate } from './DebtTypeOrgCreate';
import { Outlet, RouteObject } from 'react-router';
import { AdminRouteGuard } from '../components/RouteGuard/RouteGuard';

export const debtTypeOrgsRoutes: Array<RouteObject> = [
  {
    id: 'DEBT_TYPES_DASHBOARD',
    path: `debt-types/dashboard/`,
    element: (
      <AdminRouteGuard>
        <Outlet />
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
        id: 'DEBT_TYPES_DASHBOARD_BYORG',
        element: <DebtTypesCreated />,
        path: `:organizationId?`,
        handle: {
          backButton: true,
          hideBreadcrumbs: false
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
