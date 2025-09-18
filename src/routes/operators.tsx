import { RouteHandleObject } from '../models/Routes';
import OperatorsList from './OperatorsList/OperatorsList';
import { Outlet, RouteObject } from 'react-router';
import { AdminRouteGuard } from '../components/RouteGuard/RouteGuard';

export const operatorsRoutes: Array<RouteObject> = [
  {
    id: 'OPERATORS_LIST',
    path: `operators/`,
    element: (
      <AdminRouteGuard>
        <Outlet />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <OperatorsList />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'OPERATORS_LIST_BYORG',
        element: <OperatorsList />,
        path: `:organizationId?`,
        handle: {
          backButton: true,
          hideBreadcrumbs: false
        } as RouteHandleObject
      }
    ]
  }
];
