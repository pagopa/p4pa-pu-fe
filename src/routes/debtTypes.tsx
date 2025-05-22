import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypes from './DebtTypes/DebtTypes';
import DebtTypeDetailView from './DebtTypeDetailView/DebtTypeDetailView';
import DebtTypeCatalogDetailView from './DebtTypeCatalogDetailView/DebtTypeCatalogDetailView';
import { DebtTypeCreate } from './DebtTypeCreate';
import { DebtTypeCreateSuccess } from './DebtTypeCreate/DebtTypeCreateSuccess';
import { DebtTypeCatalogEdit } from './DebtTypeCatalogEdit';
import { DebtTypeCatalogEditSuccess } from './DebtTypeCatalogEdit/DebtTypeCatalogEditSuccess';
import DebtTypesCreated from './DebtTypesCreated/DebtTypesCreated';
import { DebtTypeOrgCreate } from './DebtTypeOrgCreate';
import { DebtTypeOrgCreateSuccess } from './DebtTypeOrgCreate/DebtTypeOrgCreateSuccess';
import {
  AdminRouteGuard,
  SuperAdminRouteGuard
} from '../components/RouteGuard/RouteGuard';
import { Outlet } from 'react-router-dom';

const deployPath = config.deployPath;

export const debtTypesRoutes = [
  {
    id: 'DEBT_TYPES',
    path: `${deployPath}/debt-types/`,
    element: (
      <AdminRouteGuard>
        <Layout />
      </AdminRouteGuard>
    ),
    children: [
      {
        path: `catalog/`,
        element: (
          <SuperAdminRouteGuard>
            <Outlet />
          </SuperAdminRouteGuard>
        ),
        children: [
          {
            id: 'DEBT_TYPES_CATALOG',
            index: true,
            element: <DebtTypes />,
            handle: {
              backButton: false,
              hideBreadcrumbs: true
            } as RouteHandleObject
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
          },
          {
            id: 'DEBT_TYPE_CATALOG_EDIT_SUCCESS',
            path: 'edit/ok',
            element: <DebtTypeCatalogEditSuccess />,
            handle: {
              backButton: false,
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
            id: 'DEBT_TYPE_CATALOG_CREATE_SUCCESS',
            path: 'new/ok',
            element: <DebtTypeCreateSuccess />,
            handle: {
              backButton: false,
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            } as RouteHandleObject
          }
        ]
      },
      {
        id: 'DEBT_TYPES_CREATED',
        path: 'dashboard',
        element: <DebtTypesCreated />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_DETAIL',
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
        path: 'dashboard/new',
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
        id: 'DEBT_TYPE_ORG_CREATE_SUCCESS',
        path: 'dashboard/new/ok',
        element: <DebtTypeOrgCreateSuccess />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      }
    ]
  }
];
