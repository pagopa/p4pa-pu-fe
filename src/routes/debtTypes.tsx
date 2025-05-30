import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypes from './DebtTypes/DebtTypes';
import DebtTypeCatalogDetailView from './DebtTypeCatalogDetailView/DebtTypeCatalogDetailView';
import { DebtTypeCreate } from './DebtTypeCreate';
import { DebtTypeCatalogEdit } from './DebtTypeCatalogEdit';
import { RouteObject } from 'react-router';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';

const deployPath = config.deployPath;

export const debtTypesRoutes: Array<RouteObject> = [
  {
    id: 'DEBT_TYPES_CATALOG',
    path: `${deployPath}/debt-types/catalog/`,
    element: (
      <SuperAdminRouteGuard>
        <Layout />
      </SuperAdminRouteGuard>
    ),
    children: [
      {
        index: true,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject,
        element: <DebtTypes />
      },
      {
        id: 'DEBT_TYPE_CATALOG_DETAIL',
        path: 'detail/:debtPositionTypeId',
        element: <DebtTypeCatalogDetailView />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_CATALOG_CREATE',
        path: 'new',
        element: <DebtTypeCreate />,
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
        id: 'DEBT_TYPE_CATALOG_EDIT',
        path: 'edit/:debtPositionTypeId',
        element: <DebtTypeCatalogEdit />,
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
