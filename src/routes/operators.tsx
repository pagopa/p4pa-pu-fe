import type { RouteHandleObject } from '../models/Routes';
import OperatorsList from './OperatorsList/OperatorsList';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router';
import { AdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import OperatorDetail from './OperatorsDetail';
import MyOrganization from './OperatorsList/MyOrganization/MyOrganization';
import { OperatorAffiliate } from './OperatorAffiliate';
import { OperatorSubunitAssign } from './OperatorSubunitAssign';

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
        path: 'brokers/:organizationId',
        element: <MyOrganization />,
        handle: {
          backButton: true,
          hideBreadcrumbs: false,
          custom: true
        } as RouteHandleObject
      },
      {
        id: 'OPERATORS_DETAIL_PARENT',
        path: 'detail/:organizationId/:orgName?/:mappedExternalUserId/',
        children: [
          {
            index: true,
            id: 'OPERATORS_DETAIL',
            element: <OperatorDetail />,
            handle: {
              backButton: true,
              hideBreadcrumbs: true,
              custom: true
            } as RouteHandleObject
          },
          {
            id: 'OPERATOR_SUBUNIT_ASSIGN',
            path: 'subunit-assign/:operatorName?',
            element: <OperatorSubunitAssign />,
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
      },
      {
        id: 'OPERATORS_AFFILIATE',
        path: 'affiliate/:organizationId/:mappedExternalUserId/:operatorName',
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
