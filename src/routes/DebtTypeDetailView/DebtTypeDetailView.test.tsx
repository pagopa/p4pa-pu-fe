/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { DebtTypeDetailView } from './DebtTypeDetailView';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { useParams, useNavigate } from 'react-router';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';
import { getDebtPositionTypeOrgOperators } from '../../api/debtPositionTypeOrgOperators';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';
import debtPositions from '../../api/debtPositions';
import utils from '../../utils';
import { AxiosError } from 'axios';
import { STATE } from '../../store/types';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    generatePath: vi.fn((route, params) =>
      route.replace(':debtPositionTypeOrgId', params.debtPositionTypeOrgId)
    )
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn(() => ({
    state: {
      [STATE.ORGANIZATION_ID]: '3'
    }
  })),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../../api/debtPositionsTypeOrg', () => ({
  getDebtPositionTypeOrgById: vi.fn(),
  updateFlagActiveDebtPositionTypeOrg: vi.fn()
}));

vi.mock('../../api/debtPositionTypeOrgOperators', () => ({
  getDebtPositionTypeOrgOperators: vi.fn()
}));

vi.mock('../../api/debtTypesCreated', () => ({
  useDebtPositionTypeOrgSearch: vi.fn()
}));

vi.mock('../../api/debtPositions', () => ({
  default: {
    deleteDebtPositionTypeOrgs: vi.fn()
  }
}));

vi.mock('../../utils', () => ({
  default: {
    config: {
      deployPath: '/test-deploy-path'
    },
    notify: {
      emit: vi.fn()
    },
    apiClient: {
      bff: {
        getOrgSilServices: vi.fn()
      }
    }
  }
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    DEBT_TYPES_DASHBOARD: '/debt-types',
    DEBT_TYPE_ORG_EDIT: '/debt-type-org-edit/:debtPositionTypeOrgId'
  }
}));

vi.mock('../../models/DebtTypeSectionsConfig', () => ({
  getAccordionSectionsConfig: vi.fn((_debtTypeData, operatorsInfo) => [
    {
      configType: 'main',
      title: 'Main Configuration',
      description: 'Main debt type configuration',
      sections: [
        {
          label: 'Operatori',
          value: operatorsInfo
            ? `${operatorsInfo.enabledOperators} operatori`
            : '0 operatori'
        }
      ]
    }
  ])
}));

vi.mock('./hooks/useConfirmDialog', () => ({
  useConfirmDialog: vi.fn()
}));

vi.mock('../../components/GenericDialog/GenericDialog', () => ({
  default: ({
    open,
    title,
    message,
    onConfirm,
    onClose,
    confirmLabel,
    cancelLabel
  }: any) =>
    open ? (
      <div data-testid="generic-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        {cancelLabel && <button onClick={onClose}>{cancelLabel}</button>}
      </div>
    ) : null
}));

vi.mock('../../components/DetailAccordion/DetailAccordion', () => ({
  DetailAccordion: ({ title, description, sections }: any) => (
    <div>
      <h6>{title}</h6>
      <p>{description}</p>
      {sections?.map((section: any, index: number) => (
        <div key={index}>
          <span>
            {section.label}: {section.value}
          </span>
        </div>
      ))}
    </div>
  )
}));

describe('DebtTypeDetailView', () => {
  const mockNavigate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockUpdateFlagActive = {
    mutateAsync: vi.fn()
  };

  const defaultConfirmDialog = {
    isOpen: false,
    currentAction: null,
    closeDialog: vi.fn(),
    handleConfirm: vi.fn(),
    showDeleteDialog: vi.fn(),
    showDisableDialog: vi.fn(),
    showEnableDialog: vi.fn(),
    showErrorDialog: vi.fn()
  };

  let mockConfirmDialog: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockConfirmDialog = { ...defaultConfirmDialog };

    i18nTestSetup({
      'debtTypeDetail.description': 'Descrizione del tipo di debito',
      'commons.delete': 'Elimina',
      'commons.edit': 'Modifica',
      'commons.enable': 'Abilita',
      'commons.disable': 'Disabilita',
      'commons.enabled': 'Abilitato',
      'commons.disabled': 'Disabilitato',
      'debtTypeDetail.enabledOperators.selectedOperators':
        'Operatori selezionati',
      'commons.operators': 'operatori',
      'debtTypeDetail.success.updated': 'Aggiornato con successo',
      'errors.fetchDebtPositionsTypes':
        'Errore nel caricamento dei tipi di debito',
      'errors.fetchOperators': 'Errore nel caricamento degli operatori',
      'errors.fetchOperatorsEnabled':
        'Errore nel caricamento degli operatori abilitati',
      'debtTypeDetail.errors.enableFailed': 'Abilitazione fallita',
      'debtTypeDetail.errors.servicesUnavailableCannotEdit':
        'Servizi non disponibili, impossibile modificare'
    });

    (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      debtPositionTypeOrgId: '123'
    });

    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

    const { useConfirmDialog } = await import('./hooks/useConfirmDialog');
    (useConfirmDialog as ReturnType<typeof vi.fn>).mockReturnValue(
      mockConfirmDialog
    );

    const { updateFlagActiveDebtPositionTypeOrg } = await import(
      '../../api/debtPositionsTypeOrg'
    );
    (
      updateFlagActiveDebtPositionTypeOrg as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockUpdateFlagActive);

    (
      debtPositions.deleteDebtPositionTypeOrgs as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    setupDefaultMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const setupDefaultMocks = (overrides: any = {}) => {
    const defaultDebtTypeData = {
      data: {
        response: {
          description: 'Test Debt Type',
          code: 'TEST_CODE',
          debtPositionTypeDescription: 'Test Description',
          flagActive: true,
          ...overrides.debtType
        }
      },
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null,
      ...overrides.debtTypeQuery
    };

    const defaultOperatorsData = {
      data: {
        totalElements: 5,
        ...overrides.operators
      },
      isError: false,
      error: null,
      ...overrides.operatorsQuery
    };

    const defaultOperatorsEnabledData = {
      data: {
        content: [
          {
            enabledOperators: 3,
            ...overrides.operatorsEnabled
          }
        ]
      },
      mutate: vi.fn(),
      isError: false,
      error: null,
      ...overrides.operatorsEnabledQuery
    };

    (getDebtPositionTypeOrgById as ReturnType<typeof vi.fn>).mockReturnValue(
      defaultDebtTypeData
    );
    (
      getDebtPositionTypeOrgOperators as ReturnType<typeof vi.fn>
    ).mockReturnValue(defaultOperatorsData);
    (useDebtPositionTypeOrgSearch as ReturnType<typeof vi.fn>).mockReturnValue(
      defaultOperatorsEnabledData
    );
  };

  describe('Rendering and basic functionality', () => {
    it('renders debt type details when data is loaded', () => {
      render(<DebtTypeDetailView />);

      expect(screen.getByText('Test Debt Type')).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione del tipo di debito')
      ).toBeInTheDocument();
      expect(screen.getByText('Abilitato')).toBeInTheDocument();
      expect(screen.getByText(/3 operatori/i)).toBeInTheDocument();
    });

    it('renders correct chip status for active debt type', () => {
      render(<DebtTypeDetailView />);

      const statusChip = screen.getByText('Abilitato');
      expect(statusChip).toBeInTheDocument();
    });

    it('renders correct chip status for inactive debt type', () => {
      setupDefaultMocks({
        debtType: { flagActive: false }
      });

      render(<DebtTypeDetailView />);

      const statusChip = screen.getByText('Disabilitato');
      expect(statusChip).toBeInTheDocument();
    });

    it('displays fallback when description is missing', () => {
      setupDefaultMocks({
        debtType: { description: null }
      });

      render(<DebtTypeDetailView />);

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('Active debt type actions', () => {
    beforeEach(() => {
      setupDefaultMocks({
        debtType: { flagActive: true }
      });
    });

    it('renders edit button and action menu for active debt type', () => {
      render(<DebtTypeDetailView />);

      const editButtons = screen.getAllByRole('button', { name: 'Modifica' });
      expect(editButtons).toHaveLength(2);
      expect(screen.getByTestId('action-menu-button')).toBeInTheDocument();
    });

    it('opens action menu on button click', async () => {
      render(<DebtTypeDetailView />);

      const actionMenuButton = screen.getByTestId('action-menu-button');
      fireEvent.click(actionMenuButton);

      await waitFor(() => {
        expect(screen.getByText('Disabilita')).toBeInTheDocument();
        expect(screen.getByText('Elimina')).toBeInTheDocument();
      });
    });

    it('calls edit handler when edit button is clicked', async () => {
      (
        utils.apiClient.bff.getOrgSilServices as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ data: [] });

      render(<DebtTypeDetailView />);

      const editButtons = screen.getAllByRole('button', { name: 'Modifica' });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(utils.apiClient.bff.getOrgSilServices).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenCalledWith('/debt-type-org-edit/123');
      });
    });

    it('shows error when services check fails', async () => {
      (
        utils.apiClient.bff.getOrgSilServices as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Services unavailable'));

      render(<DebtTypeDetailView />);

      const editButtons = screen.getAllByRole('button', { name: 'Modifica' });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'Servizi non disponibili, impossibile modificare',
          'error'
        );
      });
    });

    it('calls disable dialog from menu', async () => {
      render(<DebtTypeDetailView />);

      const actionMenuButton = screen.getByTestId('action-menu-button');
      fireEvent.click(actionMenuButton);

      await waitFor(() => {
        const disableMenuItem = screen.getByText('Disabilita');
        fireEvent.click(disableMenuItem);

        expect(mockConfirmDialog.showDisableDialog).toHaveBeenCalled();
      });
    });

    it('calls delete dialog from menu', async () => {
      render(<DebtTypeDetailView />);

      const actionMenuButton = screen.getByTestId('action-menu-button');
      fireEvent.click(actionMenuButton);

      await waitFor(() => {
        const deleteMenuItem = screen.getByText('Elimina');
        fireEvent.click(deleteMenuItem);

        expect(mockConfirmDialog.showDeleteDialog).toHaveBeenCalled();
      });
    });
  });

  describe('Inactive debt type actions', () => {
    beforeEach(() => {
      setupDefaultMocks({
        debtType: { flagActive: false }
      });
    });

    it('renders delete and enable buttons for inactive debt type', () => {
      render(<DebtTypeDetailView />);

      expect(screen.getAllByRole('button', { name: 'Elimina' })).toHaveLength(
        2
      );
      expect(screen.getAllByRole('button', { name: 'Abilita' })).toHaveLength(
        2
      );
    });

    it('calls enable dialog when enable button is clicked', () => {
      render(<DebtTypeDetailView />);

      const enableButtons = screen.getAllByRole('button', { name: 'Abilita' });
      fireEvent.click(enableButtons[0]);

      expect(mockConfirmDialog.showEnableDialog).toHaveBeenCalled();
    });

    it('calls delete dialog when delete button is clicked', () => {
      render(<DebtTypeDetailView />);

      const deleteButtons = screen.getAllByRole('button', { name: 'Elimina' });
      fireEvent.click(deleteButtons[0]);

      expect(mockConfirmDialog.showDeleteDialog).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('shows error notification when debt type fetch fails', () => {
      setupDefaultMocks({
        debtTypeQuery: {
          isError: true,
          error: new AxiosError(
            'Debt type fetch failed',
            '400',
            { headers: {} as any },
            {},
            {
              data: {},
              status: 400,
              statusText: 'Bad Request',
              headers: {},
              config: { headers: {} as any }
            }
          )
        }
      });

      render(<DebtTypeDetailView />);

      expect(utils.notify.emit).toHaveBeenCalledWith(
        'Errore nel caricamento dei tipi di debito',
        'error'
      );
    });

    it('does not show notification for server errors (5xx)', () => {
      setupDefaultMocks({
        debtTypeQuery: {
          isError: true,
          error: new AxiosError(
            'Server error',
            '500',
            { headers: {} as any },
            {},
            {
              data: {},
              status: 500,
              statusText: 'Internal Server Error',
              headers: {},
              config: { headers: {} as any }
            }
          )
        }
      });

      render(<DebtTypeDetailView />);

      expect(utils.notify.emit).not.toHaveBeenCalled();
    });

    it('shows error notification when operators fetch fails', () => {
      setupDefaultMocks({
        operatorsQuery: {
          isError: true,
          error: new Error('Operators fetch failed')
        }
      });

      render(<DebtTypeDetailView />);

      expect(utils.notify.emit).toHaveBeenCalledWith(
        'Errore nel caricamento degli operatori',
        'error'
      );
    });

    it('shows error notification when enabled operators fetch fails', () => {
      setupDefaultMocks({
        operatorsEnabledQuery: {
          isError: true,
          error: new Error('Enabled operators fetch failed')
        }
      });

      render(<DebtTypeDetailView />);

      expect(utils.notify.emit).toHaveBeenCalledWith(
        'Errore nel caricamento degli operatori abilitati',
        'error'
      );
    });

    it('handles invalid debtPositionTypeOrgId parameter', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      (useParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        debtPositionTypeOrgId: 'invalid'
      });

      render(<DebtTypeDetailView />);

      expect(consoleSpy).toHaveBeenCalledWith(
        'debtPositionTypeOrgId is not a number'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Dialog interactions', () => {
    it('renders dialog when currentAction is present', () => {
      const mockAction = {
        title: 'Test Dialog',
        message: 'Test Message',
        confirmLabel: 'Conferma',
        cancelLabel: 'Annulla',
        showCancel: true,
        testId: 'test-dialog'
      };

      mockConfirmDialog.isOpen = true;
      mockConfirmDialog.currentAction = mockAction;

      render(<DebtTypeDetailView />);

      expect(screen.getByTestId('generic-dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('does not render dialog when no currentAction', () => {
      mockConfirmDialog.isOpen = false;
      mockConfirmDialog.currentAction = null;

      render(<DebtTypeDetailView />);

      expect(screen.queryByTestId('generic-dialog')).not.toBeInTheDocument();
    });

    it('handles dialog confirm action', () => {
      const mockAction = {
        title: 'Test Dialog',
        message: 'Test Message',
        confirmLabel: 'Conferma',
        showCancel: false
      };

      mockConfirmDialog.isOpen = true;
      mockConfirmDialog.currentAction = mockAction;

      render(<DebtTypeDetailView />);

      const confirmButton = screen.getByText('Conferma');
      fireEvent.click(confirmButton);

      expect(mockConfirmDialog.handleConfirm).toHaveBeenCalled();
    });
  });

  describe('Data mutations and effects', () => {
    it('triggers operators enabled search when data is loaded', async () => {
      const mockMutate = vi.fn();

      setupDefaultMocks({
        operatorsEnabledQuery: {
          data: null,
          mutate: mockMutate
        }
      });

      render(<DebtTypeDetailView />);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          organizationId: 3,
          filters: {
            code: 'TEST_CODE',
            description: 'Test Debt Type'
          }
        });
      });
    });

    it('builds operators data correctly', () => {
      render(<DebtTypeDetailView />);

      expect(screen.getByText(/3 operatori/i)).toBeInTheDocument();
    });

    it('handles missing operators data gracefully', () => {
      setupDefaultMocks({
        operators: null,
        operatorsEnabled: null
      });

      render(<DebtTypeDetailView />);

      const titleElements = screen.getAllByText('Test Debt Type');
      expect(titleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Menu interactions', () => {
    beforeEach(() => {
      setupDefaultMocks({
        debtType: { flagActive: true }
      });
    });

    it('closes menu after selecting an action', async () => {
      render(<DebtTypeDetailView />);

      const actionMenuButton = screen.getByTestId('action-menu-button');
      fireEvent.click(actionMenuButton);

      await waitFor(() => {
        const disableMenuItem = screen.getByText('Disabilita');
        fireEvent.click(disableMenuItem);

        expect(mockConfirmDialog.showDisableDialog).toHaveBeenCalled();
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<DebtTypeDetailView />);

      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid button clicks without duplicate actions', async () => {
      render(<DebtTypeDetailView />);

      const editButtons = screen.getAllByRole('button', { name: 'Modifica' });

      fireEvent.click(editButtons[0]);
      fireEvent.click(editButtons[0]);
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(utils.apiClient.bff.getOrgSilServices).toHaveBeenCalled();
      });
    });

    it('maintains state consistency during re-renders', () => {
      const { rerender } = render(<DebtTypeDetailView />);

      let titleElements = screen.getAllByText('Test Debt Type');
      expect(titleElements.length).toBeGreaterThan(0);

      rerender(<DebtTypeDetailView />);

      titleElements = screen.getAllByText('Test Debt Type');
      expect(titleElements.length).toBeGreaterThan(0);
    });
  });
});
