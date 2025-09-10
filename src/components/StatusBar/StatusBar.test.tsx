/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll
} from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { StatusBar } from './StatusBar';
import { ClassificationDetailDTO } from '../../../generated/data-contracts';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';

vi.mock('./hooks/useClassificationAlert', () => ({
  useClassificationAlert: vi.fn()
}));

import { useClassificationAlert } from './hooks/useClassificationAlert';

const mockUseClassificationAlert = vi.mocked(useClassificationAlert);

const testTranslations = {
  'classifications.detail.statusBar.status.alerts.default.title':
    'Stato Predefinito',
  'classifications.detail.statusBar.status.alerts.default.description':
    'Descrizione stato predefinito',
  'classifications.detail.statusBar.status.alerts.correctlyReported.title':
    'Correttamente Riportato',
  'classifications.detail.statusBar.status.alerts.correctlyReported.description':
    'Descrizione correttamente riportato',
  'classifications.detail.statusBar.status.alerts.reported.title': 'Riportato',
  'classifications.detail.statusBar.status.alerts.reported.description':
    'Descrizione riportato',
  'classifications.detail.statusBar.status.alerts.notReported.title':
    'Non Riportato',
  'classifications.detail.statusBar.status.alerts.notReported.description':
    'Descrizione non riportato',
  'classifications.detail.statusBar.status.reconciliationState.title':
    'Stato Riconciliazione',
  'classifications.detail.statusBar.status.states.paid.label': 'Pagato',
  'classifications.detail.statusBar.status.states.paid.descriptionActive':
    'Pagamento completato',
  'classifications.detail.statusBar.status.states.paid.descriptionInactive':
    'Pagamento non completato',
  'classifications.detail.statusBar.status.states.reported.label': 'Riportato',
  'classifications.detail.statusBar.status.states.reported.descriptionActive':
    'Riportato correttamente',
  'classifications.detail.statusBar.status.states.reported.descriptionInactive':
    'Non riportato',
  'classifications.detail.statusBar.status.states.collected.label': 'Raccolto',
  'classifications.detail.statusBar.status.states.collected.descriptionActive':
    'Raccolta completata',
  'classifications.detail.statusBar.status.states.collected.descriptionInactive':
    'Raccolta non completata'
};

describe('StatusBar Component', () => {
  beforeAll(() => {
    i18nTestSetup(testTranslations);
  });

  const createMockClassificationData = (
    overrides: Partial<ClassificationDetailDTO> = {}
  ): ClassificationDetailDTO => ({
    payed: false,
    reported: false,
    collected: false,
    flagTreasury: true,
    flagPaymentNotification: true,
    debtPositionTypeOrgCode: undefined,
    remittanceInformation: undefined,
    receiptPaymentAmount: undefined,
    receiptPaymentDateTime: undefined,
    iuv: undefined,
    iud: undefined,
    iur: undefined,
    receiptDebtor: undefined,
    receiptPayer: undefined,
    paymentNotificationDebtPositionTypeOrgCode: undefined,
    paymentNotificationRemittanceInformation: undefined,
    paymentNotificationAmountPaidCents: undefined,
    paymentNotificationDebtor: undefined,
    paymentExecutionDate: undefined,
    paymentNotificationIud: undefined,
    iuf: undefined,
    flowDateTime: undefined,
    regulationUniqueIdentifier: undefined,
    regionValueDate: undefined,
    totalAmountCents: undefined,
    sealCode: undefined,
    pspLastName: undefined,
    documentCode: undefined,
    billDate: undefined,
    billYear: undefined,
    provisionalAe: undefined,
    receptionDate: undefined,
    billCode: undefined,
    provisionalCode: undefined,
    receiptPaymentReceiptId: undefined,
    receiptPaymentRequestId: undefined,
    treasuryId: undefined,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseClassificationAlert.mockReturnValue({
      severity: 'success',
      titleKey: 'classifications.detail.statusBar.status.alerts.default.title',
      descriptionKey:
        'classifications.detail.statusBar.status.alerts.default.description'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders without crashing', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);
    });

    it('displays alert section', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Stato Predefinito')).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione stato predefinito')
      ).toBeInTheDocument();
    });

    it('displays reconciliation state title', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Stato Riconciliazione')).toBeInTheDocument();
    });
  });

  describe('Reconciliation states - flagTreasury behavior', () => {
    it('displays all three reconciliation states when flagTreasury is true', () => {
      const mockData = createMockClassificationData({ flagTreasury: true });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagato')).toBeInTheDocument();
      expect(screen.getByText('Riportato')).toBeInTheDocument();
      expect(screen.getByText('Raccolto')).toBeInTheDocument();
    });

    it('displays only two reconciliation states when flagTreasury is false', () => {
      const mockData = createMockClassificationData({ flagTreasury: false });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagato')).toBeInTheDocument();
      expect(screen.getByText('Riportato')).toBeInTheDocument();
      expect(screen.queryByText('Raccolto')).not.toBeInTheDocument();
    });

    it('shows inactive states when all flags are false and flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: false,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(screen.getByText('Raccolta non completata')).toBeInTheDocument();
    });

    it('shows inactive states when all flags are false and flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: false,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(
        screen.queryByText('Raccolta non completata')
      ).not.toBeInTheDocument();
    });

    it('shows active state for paid when payed is true', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: false,
        collected: false,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(
        screen.queryByText('Raccolta non completata')
      ).not.toBeInTheDocument();
    });

    it('shows active state for reported when reported is true', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: true,
        collected: false,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Riportato correttamente')).toBeInTheDocument();
      expect(
        screen.queryByText('Raccolta non completata')
      ).not.toBeInTheDocument();
    });

    it('shows active state for collected when collected is true and flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: true,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(screen.getByText('Raccolta completata')).toBeInTheDocument();
    });

    it('does not show collected state when collected is true but flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: true,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(screen.queryByText('Raccolta completata')).not.toBeInTheDocument();
    });

    it('shows all active states when all flags are true', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: true,
        collected: true,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento completato')).toBeInTheDocument();
      expect(screen.getByText('Riportato correttamente')).toBeInTheDocument();
      expect(screen.getByText('Raccolta completata')).toBeInTheDocument();
    });
  });

  describe('State icons', () => {
    it('displays correct icons for inactive states when flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: false,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      const disabledIcons = screen.getAllByTestId('DisabledByDefaultIcon');
      expect(disabledIcons).toHaveLength(2);
    });

    it('displays correct icons for inactive states when flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: false,
        reported: false,
        collected: false,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      const disabledIcons = screen.getAllByTestId('DisabledByDefaultIcon');
      expect(disabledIcons).toHaveLength(3);
    });

    it('displays correct icons for active states when flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: true,
        collected: true,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      const checkboxIcons = screen.getAllByTestId('CheckBoxIcon');
      expect(checkboxIcons).toHaveLength(3);
    });

    it('displays correct icons for active states when flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: true,
        collected: true,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      const checkboxIcons = screen.getAllByTestId('CheckBoxIcon');
      expect(checkboxIcons).toHaveLength(2);
    });

    it('displays mixed icons for mixed states when flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: false,
        collected: true,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      const checkboxIcons = screen.getAllByTestId('CheckBoxIcon');
      const disabledIcons = screen.getAllByTestId('DisabledByDefaultIcon');
      expect(checkboxIcons).toHaveLength(2);
      expect(disabledIcons).toHaveLength(1);
    });

    it('displays mixed icons for mixed states when flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: true,
        reported: false,
        collected: true,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      const checkboxIcons = screen.getAllByTestId('CheckBoxIcon');
      const disabledIcons = screen.getAllByTestId('DisabledByDefaultIcon');
      expect(checkboxIcons).toHaveLength(1);
      expect(disabledIcons).toHaveLength(1);
    });
  });

  describe('Integration with useClassificationAlert', () => {
    it('calls useClassificationAlert with correct data', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(mockUseClassificationAlert).toHaveBeenCalledWith(mockData);
    });

    it('displays alert with success severity', () => {
      mockUseClassificationAlert.mockReturnValue({
        severity: 'success',
        titleKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.correctlyReported.description'
      });

      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Correttamente Riportato')).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione correttamente riportato')
      ).toBeInTheDocument();
    });

    it('displays alert with error severity', () => {
      mockUseClassificationAlert.mockReturnValue({
        severity: 'error',
        titleKey:
          'classifications.detail.statusBar.status.alerts.notReported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.notReported.description'
      });

      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Non Riportato')).toBeInTheDocument();
      expect(screen.getByText('Descrizione non riportato')).toBeInTheDocument();
    });

    it('displays alert with warning severity', () => {
      mockUseClassificationAlert.mockReturnValue({
        severity: 'warning',
        titleKey:
          'classifications.detail.statusBar.status.alerts.reported.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.reported.description'
      });

      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      const alertSection = screen.getByRole('alert');
      expect(alertSection).toHaveTextContent('Riportato');
      expect(screen.getByText('Descrizione riportato')).toBeInTheDocument();
    });

    it('displays alert with info severity', () => {
      mockUseClassificationAlert.mockReturnValue({
        severity: 'warning',
        titleKey:
          'classifications.detail.statusBar.status.alerts.default.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.default.description'
      });

      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Stato Predefinito')).toBeInTheDocument();
      expect(
        screen.getByText('Descrizione stato predefinito')
      ).toBeInTheDocument();
    });
  });

  describe('HTML structure and accessibility', () => {
    it('has proper alert role', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('has correct heading structure', () => {
      const mockData = createMockClassificationData();
      render(<StatusBar classificationData={mockData} />);

      const alertTitle = screen.getByText('Stato Predefinito');
      expect(alertTitle).toBeInTheDocument();
      expect(alertTitle.closest('[role="alert"]')).toBeInTheDocument();
    });

    it('has proper semantic structure for reconciliation states when flagTreasury is true', () => {
      const mockData = createMockClassificationData({ flagTreasury: true });
      render(<StatusBar classificationData={mockData} />);

      const reconciliationTitle = screen.getByText('Stato Riconciliazione');
      expect(reconciliationTitle).toBeInTheDocument();

      expect(screen.getByText('Pagato')).toBeInTheDocument();
      expect(screen.getByText('Riportato')).toBeInTheDocument();
      expect(screen.getByText('Raccolto')).toBeInTheDocument();
    });

    it('has proper semantic structure for reconciliation states when flagTreasury is false', () => {
      const mockData = createMockClassificationData({ flagTreasury: false });
      render(<StatusBar classificationData={mockData} />);

      const reconciliationTitle = screen.getByText('Stato Riconciliazione');
      expect(reconciliationTitle).toBeInTheDocument();

      expect(screen.getByText('Pagato')).toBeInTheDocument();
      expect(screen.getByText('Riportato')).toBeInTheDocument();
      expect(screen.queryByText('Raccolto')).not.toBeInTheDocument();
    });
  });

  describe('Edge case scenarios', () => {
    it('handles null/undefined values gracefully when flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: undefined as any,
        reported: undefined as any,
        collected: false,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(
        screen.queryByText('Raccolta non completata')
      ).not.toBeInTheDocument();
    });

    it('handles null/undefined values gracefully when flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: undefined as any,
        reported: undefined as any,
        collected: false,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento non completato')).toBeInTheDocument();
      expect(screen.getByText('Non riportato')).toBeInTheDocument();
      expect(screen.getByText('Raccolta non completata')).toBeInTheDocument();
    });

    it('handles truthy values correctly when flagTreasury is true', () => {
      const mockData = createMockClassificationData({
        payed: 1 as any,
        reported: 'yes' as any,
        collected: {} as any,
        flagTreasury: true
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento completato')).toBeInTheDocument();
      expect(screen.getByText('Riportato correttamente')).toBeInTheDocument();
      expect(screen.getByText('Raccolta completata')).toBeInTheDocument();
    });

    it('handles truthy values correctly when flagTreasury is false', () => {
      const mockData = createMockClassificationData({
        payed: 1 as any,
        reported: 'yes' as any,
        collected: {} as any,
        flagTreasury: false
      });
      render(<StatusBar classificationData={mockData} />);

      expect(screen.getByText('Pagamento completato')).toBeInTheDocument();
      expect(screen.getByText('Riportato correttamente')).toBeInTheDocument();
      expect(screen.queryByText('Raccolta completata')).not.toBeInTheDocument();
    });
  });

  describe('Visual consistency', () => {
    it('maintains consistent layout with different state combinations when flagTreasury is true', () => {
      const scenarios = [
        { payed: true, reported: false, collected: false, flagTreasury: true },
        { payed: false, reported: true, collected: false, flagTreasury: true },
        { payed: false, reported: false, collected: true, flagTreasury: true },
        { payed: true, reported: true, collected: false, flagTreasury: true },
        { payed: true, reported: false, collected: true, flagTreasury: true },
        { payed: false, reported: true, collected: true, flagTreasury: true },
        { payed: true, reported: true, collected: true, flagTreasury: true }
      ];

      scenarios.forEach((scenario, _index) => {
        const mockData = createMockClassificationData(scenario);
        const { unmount } = render(<StatusBar classificationData={mockData} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Stato Riconciliazione')).toBeInTheDocument();
        expect(screen.getByText('Pagato')).toBeInTheDocument();
        expect(screen.getByText('Riportato')).toBeInTheDocument();
        expect(screen.getByText('Raccolto')).toBeInTheDocument();

        unmount();
      });
    });

    it('maintains consistent layout with different state combinations when flagTreasury is false', () => {
      const scenarios = [
        { payed: true, reported: false, collected: false, flagTreasury: false },
        { payed: false, reported: true, collected: false, flagTreasury: false },
        { payed: false, reported: false, collected: true, flagTreasury: false },
        { payed: true, reported: true, collected: false, flagTreasury: false },
        { payed: true, reported: false, collected: true, flagTreasury: false },
        { payed: false, reported: true, collected: true, flagTreasury: false },
        { payed: true, reported: true, collected: true, flagTreasury: false }
      ];

      scenarios.forEach((scenario, _index) => {
        const mockData = createMockClassificationData(scenario);
        const { unmount } = render(<StatusBar classificationData={mockData} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Stato Riconciliazione')).toBeInTheDocument();
        expect(screen.getByText('Pagato')).toBeInTheDocument();
        expect(screen.getByText('Riportato')).toBeInTheDocument();
        expect(screen.queryByText('Raccolto')).not.toBeInTheDocument();

        unmount();
      });
    });
  });
});
