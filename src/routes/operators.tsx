import { RouteHandleObject } from '../models/Routes';
import OperatorsList from './OperatorsList/OperatorsList';
import { Outlet, RouteObject } from 'react-router';
import { AdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import OperatorDetail from './OperatorsDetail';
import MyOrganization from './OperatorsList/MyOrganization/MyOrganization';
import { OperatorAffiliate } from './OperatorAffiliate';

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
        id: 'BROKER_OPERATORS',
        path: 'brokers/:organizationId/:orgName',
        element: <MyOrganization />,
        handle: {
          backButton: true,
          hideBreadcrumbs: false,
          custom: true
        } as RouteHandleObject
      },
      {
        id: 'OPERATORS_DETAIL',
        // orgName is an optional param
        path: 'detail/:organizationId/:orgName?/:mappedExternalUserId',
        element: <OperatorDetail />,
        handle: {
          backButton: true,
          hideBreadcrumbs: false,
          custom: true
        } as RouteHandleObject
      },
      {
        id: 'OPERATORS_AFFILIATE',
        // orgName is an optional param
        path: 'affiliate/:organizationId/:mappedExternalUserId/:operatorName/:orgName?',
        element: <OperatorAffiliate />,
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
