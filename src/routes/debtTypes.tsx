import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import config from '../utils/config';
import DebtTypes from './DebtTypes/DebtTypes';
import DebtTypeDetailView from './DebtTypeCatalogDetailView/DebtTypeCatalogDetailView';
import DebtPositionCreateWizard from './DebtPositionCreateWizard/DebtPositionCreateWizard';
import DebtPositionCreateWizardCompleted from './DebtPositionCreateWizard/DebtPositionCreateWizardCompleted';

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
        id: 'DEBT_POSITION_CREATE_WIZARD',
        path: 'create-wizard',
        element: <DebtPositionCreateWizard />,
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
        id: 'DEBT_POSITION_CREATE_WIZARD_COMPLETED',
        path: 'create-wizard/completed',
        element: <DebtPositionCreateWizardCompleted />,
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
