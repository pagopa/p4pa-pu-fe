import DebtPositionResults from './DebtPositions/DebtPositionsResults';
import DebtPositionsImportOverview from './DebtPositionsImportOverview';
import DebtPositionsInstallmentDetail from './DebtPositionsInstallmentDetail';
import DebtPositionsPage from './DebtPositionsPage';
import { RouteHandleObject } from '../models/Routes';
import DebtPositionDetail from './DebtPositionDetail/DebtPositionDetail';
import DebtPositionCreateWizard from './DebtPositionCreateWizard/DebtPositionCreateWizard';
import DebtPositionCreateWizardCompleted from './DebtPositionCreateWizard/DebtPositionCreateWizardCompleted';

export const debtPositionsRoutes = [
  {
    id: 'DEBT_POSITIONS',
    path: `debt-positions/`,
    children: [
      {
        index: true,
        id: 'DEBT_POSITIONS_INDEX',
        element: <DebtPositionsPage />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITIONS_RESULTS',
        path: 'results',
        element: <DebtPositionResults />
      },
      {
        id: 'DEBT_POSITION_SEARCH_RESULTS',
        path: 'results-IUV',
        element: <DebtPositionResults />
      },
      {
        id: 'DEBT_POSITIONS_IMPORT_OVERVIEW',
        path: 'import-overview',
        element: <DebtPositionsImportOverview />,
        handle: {
          backButton: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITION_INSTALLMENT_DETAIL',
        path: 'installments/:id',
        element: <DebtPositionsInstallmentDetail />,
        handle: {
          custom: true
        } as RouteHandleObject
      },
      {
        id: 'DEBT_POSITION_DETAIL',
        path: ':id',
        element: <DebtPositionDetail />,
        handle: {
          custom: true
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
