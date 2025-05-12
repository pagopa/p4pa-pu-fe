import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypes from './DebtTypes/DebtTypes';
import DebtTypeDetailView from './DebtTypeCatalogDetailView/DebtTypeCatalogDetailView';
import { DebtTypeCreate } from './DebtTypeCreate';
import { DebtTypeCreateSuccess } from './DebtTypeCreate/DebtTypeCreateSuccess';
import { DebtTypeCatalogEdit } from './DebtTypeCatalogEdit';
import { DebtTypeCatalogEditSuccess } from './DebtTypeCatalogEdit/DebtTypeCatalogEditSuccess';
import DebtTypesCreated from './DebtTypesCreated/DebtTypesCreated';
import { DebtTypeCreateEC } from './DebtTypeCreateEC';

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
      },
      {
        id: 'DEBT_TYPE_CATALOG_DETAIL',
        path: 'catalog/detail/:debtPositionTypeId',
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
        id: 'DEBT_TYPE_CREATE_EC',
        path: 'dashboard/new',
        element: <DebtTypeCreateEC />,
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
