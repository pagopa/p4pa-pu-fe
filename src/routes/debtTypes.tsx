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
import { RouteGuard } from '../components/RouteGuard';
import utils from '../utils';

const deployPath = config.deployPath;

const superAdminGuard = () => utils.roles.useIsSuperAdmin() || false;
const adminGaurd = () => utils.roles.useWhichRole() == 'ROLE_ADMIN' || false;

export const debtTypesRoutes = [
  {
    id: 'DEBT_TYPES',
    path: `${deployPath}/debt-types/`,
    element: (
      <RouteGuard evaluation={adminGaurd}>
        <Layout />
      </RouteGuard>
    ),
    children: [
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
        id: 'DEBT_TYPES_CATALOG',
        path: 'catalog',
        element: (
          <RouteGuard evaluation={superAdminGuard}>
            <DebtTypes />
          </RouteGuard>
        ),
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_CATALOG_DETAIL',
        path: 'catalog/detail/:debtPositionTypeId',
        element: (
          <RouteGuard evaluation={superAdminGuard}>
            <DebtTypeCatalogDetailView />
          </RouteGuard>
        ),
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'DEBT_TYPE_CREATE',
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
        id: 'DEBT_TYPE_CREATE_SUCCESS',
        path: 'new/ok',
        element: <DebtTypeCreateSuccess />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
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
        id: 'DEBT_TYPE_CATALOG_EDIT',
        path: 'catalog/edit/:debtPositionTypeId',
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
