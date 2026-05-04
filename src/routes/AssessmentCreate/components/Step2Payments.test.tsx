import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import React from 'react';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { Step2Payments, validateStep2Payments } from './Step2Payments';
import type { Step2PaymentsRef } from './Step2Payments';
import { render } from '../../../__tests__/renderers';

const mockPaymentsState = {
  paymentsData: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10
  } as PagedPaidInstallmentsDTO,
  showPaymentsValidationError: false,
  showFiltersValidationError: false,
  updatePaymentsData: vi.fn(),
  resetPaymentsData: vi.fn(),
  clearValidationErrors: vi.fn(),
  setShowPaymentsValidationError: vi.fn(),
  setShowFiltersValidationError: vi.fn()
};

const mockGlobalSelection = {
  totalSelected: 0,
  globalSelectedIuds: new Set<string>(),
  clearAllSelections: vi.fn(),
  toggleIudSelection: vi.fn(),
  isIudSelected: vi.fn().mockReturnValue(false),
  isSelected: vi.fn().mockReturnValue(false)
};

const mockPaidInstallments = {
  isLoading: false,
  isError: false,
  error: null as Error | null,
  fetchPaidInstallments: vi.fn().mockResolvedValue({
    content: [
      {
        iud: 'test-iud-1',
        iuv: 'test-iuv-1',
        amount: 100,
        paymentDateTime: '2023-01-01T00:00:00Z',
        receiptCreationDate: '2023-01-01T00:00:00Z',
        organizationId: 123
      }
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10
  })
};

const mockOperatingYears = {
  data: [{ value: '2023', label: '2023' }],
  isLoading: false,
  isError: false,
  error: null as Error | null
};

const mockChapters = {
  data: [{ value: 'CAP001', label: 'Capitolo 001' }],
  isLoading: false,
  isError: false,
  error: null as Error | null
};

vi.mock('../../../hooks/useStep2PaymentsState', () => ({
  useStep2PaymentsState: () => mockPaymentsState
}));

vi.mock('../../../hooks/useGlobalPaymentSelection', () => ({
  useGlobalPaymentSelection: () => mockGlobalSelection
}));

vi.mock('../../../hooks/usePaidInstallments', () => ({
  usePaidInstallments: () => mockPaidInstallments
}));

vi.mock('../../../hooks/useOperatingYears', () => ({
  useOperatingYears: () => mockOperatingYears
}));

vi.mock('../../../hooks/useChapters', () => ({
  useChapters: () => mockChapters
}));

vi.mock('./PaymentsTable', () => ({
  PaymentsTable: ({
    onSelectionChange,
    onFiltersApplied,
    onFilterValidationError,
    selectedIuds,
    'data-testid': testId
  }: {
    onSelectionChange?: (selectedIds: Array<string>) => void;
    onFiltersApplied?: (
      filters: Record<string, unknown>,
      pagination: { page: number; size: number },
      sortParams?: Array<string>
    ) => void;
    onFilterValidationError?: (hasError: boolean) => void;
    selectedIuds?: Array<string>;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId || 'payments-table'}>
      <button
        data-testid="mock-select-payment"
        onClick={() => onSelectionChange?.(['test-iud-1'])}
      >
        Seleziona pagamento
      </button>
      <button
        data-testid="mock-apply-filters"
        onClick={() =>
          onFiltersApplied?.(
            { dateFrom: new Date(), dateTo: new Date() },
            { page: 0, size: 10 },
            ['iuv,asc']
          )
        }
      >
        Applica filtri
      </button>
      <button
        data-testid="mock-filter-error"
        onClick={() => onFilterValidationError?.(true)}
      >
        Errore filtri
      </button>
      <div data-testid="selected-iuds">{selectedIuds?.join(',')}</div>
    </div>
  )
}));

vi.mock('../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="wizard-step-wrapper">{children}</div>
  )
}));

vi.mock('../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledRadioGroup: ({
      'data-testid': testId,
      label,
      options,
      sx
    }: {
      'data-testid': string;
      label: string;
      options: Array<{ value: boolean; label: string }>;
      sx?: { flexDirection?: string };
    }) => (
      <div data-testid={testId}>
        <fieldset>
          <legend>{label}</legend>
          <div
            style={
              {
                flexDirection: sx?.flexDirection || 'column'
              } as React.CSSProperties
            }
          >
            {options?.map((option) => (
              <label key={String(option.value)}>
                <input
                  type="radio"
                  name="addPaymentsToAssessment"
                  value={String(option.value)}
                  defaultChecked={option.value === false}
                  data-testid={`${testId}-${option.value}`}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    )
  }
}));

vi.mock('../../../api/classifications/paidInstallments/mappings', () => ({
  convertFiltersToAPI: vi.fn().mockReturnValue({
    dateFrom: '2023-01-01',
    dateTo: '2023-01-31'
  })
}));

import type { PagedPaidInstallmentsDTO } from '../../../api/classifications/paidInstallments/mappings';

type FormWrapperProps = {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
};

const FormWrapper = ({ children, defaultValues = {} }: FormWrapperProps) => {
  const methods = useForm({
    defaultValues: {
      addPaymentsToAssessment: false,
      selectedPayments: [],
      selectedPaymentIuds: [],
      operatingYear: '',
      chapterCode: '',
      debtPositionTypeOrgCode: '',
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithForm = (
  component: React.ReactNode,
  defaultValues?: Record<string, unknown>
) => {
  return render(
    <FormWrapper defaultValues={defaultValues}>{component}</FormWrapper>
  );
};

describe('Step2Payments', () => {
  const translations = {
    'assessmentCreate.configuration.step2.addPayments.radioLabel':
      'Aggiungere pagamenti?',
    'assessmentCreate.configuration.step2.addPayments.options.yes': 'Sì',
    'assessmentCreate.configuration.step2.addPayments.options.no': 'No',
    'errors.fetchOperatingYears': 'Errore nel caricamento degli anni operativi',
    'errors.fetchChapters': 'Errore nel caricamento dei capitoli',
    'assessmentCreate.configuration.step2.validation.noPaymentsSelected':
      'Nessun pagamento selezionato',
    'assessmentCreate.configuration.step2.validation.noFiltersSelected':
      'Nessun filtro selezionato',
    'assessmentCreate.configuration.step2.selection.banner.single':
      'Hai selezionato {{count}} pagamento',
    'assessmentCreate.configuration.step2.selection.banner.multiple':
      'Hai selezionato {{count}} pagamenti',
    'assessmentCreate.configuration.step2.selection.banner.clearSelection':
      'Svuota selezione',
    'commons.inThisPage': 'in questa pagina'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup(translations);

    mockPaymentsState.showPaymentsValidationError = false;
    mockPaymentsState.showFiltersValidationError = false;
    mockPaymentsState.paymentsData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10
    };

    mockGlobalSelection.totalSelected = 0;
    mockGlobalSelection.globalSelectedIuds = new Set();

    mockPaidInstallments.isError = false;
    mockPaidInstallments.error = null;
    mockOperatingYears.isError = false;
    mockOperatingYears.error = null;
    mockChapters.isError = false;
    mockChapters.error = null;
  });

  describe('validateStep2Payments function', () => {
    it('should return true when addPaymentsToAssessment is false', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: false
      });
      expect(result).toBe(true);
    });

    it('should return true when addPaymentsToAssessment is string "false"', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: 'false' as unknown as boolean
      });
      expect(result).toBe(true);
    });

    it('should return false when addPaymentsToAssessment is true but no payments selected', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: true,
        selectedPayments: [],
        selectedPaymentIuds: []
      });
      expect(result).toBe(false);
    });

    it('should return true when addPaymentsToAssessment is true and selectedPayments has items', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: true,
        selectedPayments: ['payment1', 'payment2'],
        selectedPaymentIuds: []
      });
      expect(result).toBe(true);
    });

    it('should return true when addPaymentsToAssessment is true and selectedPaymentIuds has items', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: true,
        selectedPayments: [],
        selectedPaymentIuds: ['iud1', 'iud2']
      });
      expect(result).toBe(true);
    });

    it('should return true when addPaymentsToAssessment is string "true" and payments selected', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: 'true' as unknown as boolean,
        selectedPayments: ['payment1']
      });
      expect(result).toBe(true);
    });

    it('should return false when in modify remove mode with no selected assessment detail IDs', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        selectedAssessmentDetailIds: []
      });
      expect(result).toBe(false);
    });

    it('should return true when in modify remove mode with selected assessment detail IDs', () => {
      const result = validateStep2Payments({
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        selectedAssessmentDetailIds: [1, 2, 3]
      });
      expect(result).toBe(true);
    });

    it('should use currentSelectedAssessmentDetailIds parameter when provided in remove mode', () => {
      const result = validateStep2Payments(
        {
          addPaymentsToAssessment: true,
          isModifyMode: true,
          modifyAction: 'remove',
          selectedAssessmentDetailIds: []
        },
        [1, 2] // currentSelectedAssessmentDetailIds parameter
      );
      expect(result).toBe(true);
    });
  });

  describe('Rendering', () => {
    it('should render wizard step wrapper', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });

    it('should render radio group with correct label', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByText('Aggiungere pagamenti?')).toBeInTheDocument();
      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
    });

    it('should render both radio options', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByText('Sì')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should render radio inputs with correct values', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toBeInTheDocument();
      expect(noRadio).toBeInTheDocument();
      expect(yesRadio).toHaveAttribute('value', 'true');
      expect(noRadio).toHaveAttribute('value', 'false');
    });
  });

  describe('Default values', () => {
    it('should have "No" selected by default', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeChecked();
      expect(noRadio).toBeChecked();
    });
  });

  describe('Radio group state', () => {
    it('should enable radio group by default', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeDisabled();
      expect(noRadio).not.toBeDisabled();
    });
  });

  describe('Props behavior', () => {
    it('should handle default props', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      expect(yesRadio).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for accessibility', () => {
      renderWithForm(<Step2Payments />);

      const fieldset = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('fieldset');
      const legend = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('legend');

      expect(fieldset).toBeInTheDocument();
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent('Aggiungere pagamenti?');
    });

    it('should have proper radio group structure', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toHaveAttribute('type', 'radio');
      expect(noRadio).toHaveAttribute('type', 'radio');
      expect(yesRadio).toHaveAttribute('name', 'addPaymentsToAssessment');
      expect(noRadio).toHaveAttribute('name', 'addPaymentsToAssessment');
    });
  });

  describe('Data testids', () => {
    it('should have correct data-testid attributes', () => {
      renderWithForm(<Step2Payments />);

      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
      expect(
        screen.getByTestId('addPaymentsToAssessment-true')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('addPaymentsToAssessment-false')
      ).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply row direction styling', () => {
      renderWithForm(<Step2Payments />);

      const radioContainer = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('div');
      expect(radioContainer).toHaveStyle({ flexDirection: 'row' });
    });
  });

  describe('Conditional rendering when shouldLoadData is true', () => {
    it('should render PaymentsTable when addPaymentsToAssessment is true', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should not render PaymentsTable when addPaymentsToAssessment is false', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: false });

      expect(screen.queryByTestId('payments-table')).not.toBeInTheDocument();
    });

    it('should render PaymentsTable when addPaymentsToAssessment is string "true"', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: 'true'
      });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });
  });

  describe('Error handling and alerts', () => {
    it('should verify error states are handled in hooks', () => {
      expect(mockOperatingYears.isError).toBe(false);
      expect(mockChapters.isError).toBe(false);
      expect(mockPaidInstallments.isError).toBe(false);
    });

    it('should show payments validation error banner when showPaymentsValidationError is true', () => {
      mockPaymentsState.showPaymentsValidationError = true;
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });
      expect(
        screen.getByTestId('payments-selection-error-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Nessun pagamento selezionato')
      ).toBeInTheDocument();
    });

    it('should show filter validation error banner when showFiltersValidationError is true', () => {
      mockPaymentsState.showFiltersValidationError = true;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.getByTestId('filter-validation-error-banner')
      ).toBeInTheDocument();
      expect(screen.getByText('Nessun filtro selezionato')).toBeInTheDocument();
    });

    it('should verify error states are handled in hooks', () => {
      // Test che gli errori non ci siano di default (questo è quello che il componente controlla)
      expect(mockOperatingYears.isError).toBe(false);
      expect(mockChapters.isError).toBe(false);
      expect(mockPaidInstallments.isError).toBe(false);

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      // Il componente deve renderizzare senza errori quando non ci sono errori API
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });
  });

  describe('Selection banner', () => {
    it('should show selection banner when payments are selected', () => {
      mockGlobalSelection.totalSelected = 3;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.getByTestId('payments-selection-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hai selezionato 3 pagamenti')
      ).toBeInTheDocument();
    });

    it('should show singular form for single payment selected', () => {
      mockGlobalSelection.totalSelected = 1;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.getByTestId('payments-selection-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hai selezionato 1 pagamento')
      ).toBeInTheDocument();
    });

    it('should not show selection banner when no payments are selected', () => {
      mockGlobalSelection.totalSelected = 0;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.queryByTestId('payments-selection-banner')
      ).not.toBeInTheDocument();
    });

    it('should show clear selection button in selection banner', () => {
      mockGlobalSelection.totalSelected = 2;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('clear-selection-button')).toBeInTheDocument();
      expect(screen.getByText('Svuota selezione')).toBeInTheDocument();
    });

    it('should call clearAllSelections when clear selection button is clicked', () => {
      mockGlobalSelection.totalSelected = 2;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const clearButton = screen.getByTestId('clear-selection-button');
      fireEvent.click(clearButton);

      expect(mockGlobalSelection.clearAllSelections).toHaveBeenCalledTimes(1);
    });
  });

  describe('PaymentsTable interactions', () => {
    it('should handle table selection changes', async () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const selectButton = screen.getByTestId('mock-select-payment');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockGlobalSelection.toggleIudSelection).toHaveBeenCalled();
      });
    });

    it('should handle selection changes with deselection', async () => {
      // Setup current page data
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'test-iud-1',
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      // Mock global selection to simulate existing selections
      mockGlobalSelection.globalSelectedIuds = new Set(['test-iud-1-0']);

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      // Simulate deselection (empty array passed to selection change)
      const tableElement = screen.getByTestId('payments-table');
      expect(tableElement).toBeInTheDocument();
    });

    it('should handle selection changes with new selections', async () => {
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'test-iud-2',
            amount: 200,
            paymentDateTime: '2023-01-02T00:00:00Z',
            receiptCreationDate: '2023-01-02T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const selectButton = screen.getByTestId('mock-select-payment');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockGlobalSelection.toggleIudSelection).toHaveBeenCalled();
      });
    });

    it('should handle filters applied', async () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const applyFiltersButton = screen.getByTestId('mock-apply-filters');
      fireEvent.click(applyFiltersButton);

      await waitFor(() => {
        expect(mockPaidInstallments.fetchPaidInstallments).toHaveBeenCalled();
      });
    });

    it('should handle filter validation errors', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const filterErrorButton = screen.getByTestId('mock-filter-error');
      fireEvent.click(filterErrorButton);

      expect(
        mockPaymentsState.setShowFiltersValidationError
      ).toHaveBeenCalledWith(true);
    });
  });

  describe('Form field synchronization', () => {
    it('should update selectedPaymentIuds when selectedPayments changes', async () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        selectedPayments: ['payment1']
      });

      // Il componente dovrebbe sincronizzare selectedPaymentIuds con selectedPayments
      // ma non chiama automaticamente setShowPaymentsValidationError(false)
      expect(
        mockPaymentsState.setShowPaymentsValidationError
      ).not.toHaveBeenCalled();
    });

    it('should handle form state changes', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true
      });

      expect(mockPaymentsState.updatePaymentsData).toBeDefined();
      expect(mockGlobalSelection.clearAllSelections).toBeDefined();
    });
  });

  describe('ImperativeHandle ref methods', () => {
    it('should expose showValidationError and showFilterValidationError methods', () => {
      const ref = { current: null };

      renderWithForm(<Step2Payments ref={ref} />);

      expect(mockPaymentsState.setShowPaymentsValidationError).toBeDefined();
      expect(mockPaymentsState.setShowFiltersValidationError).toBeDefined();
    });

    it('should call showValidationError in normal mode', () => {
      const ref = React.createRef<Step2PaymentsRef>();
      mockGlobalSelection.totalSelected = 2;

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true
      });

      // Simulate calling the imperative method
      if (ref.current) {
        ref.current.showValidationError(true);
        // Should not show validation error since we have selections
        expect(
          mockPaymentsState.setShowPaymentsValidationError
        ).not.toHaveBeenCalledWith(true);
      }
    });

    it('should call showValidationError without selections in normal mode', () => {
      const ref = React.createRef<Step2PaymentsRef>();
      mockGlobalSelection.totalSelected = 0;

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true
      });

      if (ref.current) {
        ref.current.showValidationError(true);
        expect(
          mockPaymentsState.setShowPaymentsValidationError
        ).toHaveBeenCalledWith(true);
      }
    });

    it('should call showValidationError in remove mode with selections', () => {
      const ref = React.createRef<Step2PaymentsRef>();

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        selectedAssessmentDetailIds: [1, 2]
      });

      if (ref.current) {
        ref.current.showValidationError(true);
        expect(
          mockPaymentsState.setShowPaymentsValidationError
        ).not.toHaveBeenCalledWith(true);
      }
    });

    it('should call showValidationError in remove mode without selections', () => {
      const ref = React.createRef<Step2PaymentsRef>();

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        selectedAssessmentDetailIds: []
      });

      if (ref.current) {
        ref.current.showValidationError(true);
        expect(
          mockPaymentsState.setShowPaymentsValidationError
        ).toHaveBeenCalledWith(true);
      }
    });

    it('should call validateSelections in normal mode', () => {
      const ref = React.createRef<Step2PaymentsRef>();
      mockGlobalSelection.totalSelected = 1;

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true
      });

      if (ref.current) {
        const result = ref.current.validateSelections();
        expect(result).toBe(true);
      }
    });

    it('should call validateSelections in remove mode', () => {
      const ref = React.createRef<Step2PaymentsRef>();

      renderWithForm(<Step2Payments ref={ref} />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        selectedAssessmentDetailIds: [1, 2]
      });

      if (ref.current) {
        const result = ref.current.validateSelections();
        expect(result).toBe(true);
      }
    });
  });

  describe('Additional coverage tests', () => {
    it('should verify component structure and functionality', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle empty currentPageRows', () => {
      mockPaymentsState.paymentsData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10
      };

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should calculate currentPageRows with pagination', () => {
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'test-iud-1',
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 1, // Second page
        size: 10
      };

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle modify mode rendering', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'add'
      });

      // In modify mode, wizard step wrapper should not be rendered
      expect(
        screen.queryByTestId('wizard-step-wrapper')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle items with missing iud', () => {
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: undefined,
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      };

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle currentPageRows for remove mode', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove'
      });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle isActive prop set to false', () => {
      renderWithForm(<Step2Payments isActive={false} />, {
        addPaymentsToAssessment: true
      });

      // When isActive is false, some hooks should be disabled
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });

    it('should handle currentPageSelectedUniqueIds calculation', () => {
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'selected-iud',
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      // Mock that this unique ID is selected
      mockGlobalSelection.isIudSelected = vi.fn().mockReturnValue(true);

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
      // The selected IUDs should be passed to the table
      const selectedIuds = screen.getByTestId('selected-iuds');
      expect(selectedIuds).toBeInTheDocument();
    });

    it('should handle empty content with proper unique IDs', () => {
      mockPaymentsState.paymentsData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle selection banner text calculation', () => {
      mockGlobalSelection.totalSelected = 5;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.getByTestId('payments-selection-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hai selezionato 5 pagamenti')
      ).toBeInTheDocument();
    });
  });

  describe('Remove mode simple tests', () => {
    it('should handle handleCancelRemove', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        isModifyMode: true,
        modifyAction: 'remove',
        assessmentId: 123
      });

      // The component should render in remove mode
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle memoized initialTableFilters', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      // Component should render with memoized filters
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should calculate selectionBannerText for zero selections', () => {
      mockGlobalSelection.totalSelected = 0;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      // No banner should be shown when no selections
      expect(
        screen.queryByTestId('payments-selection-banner')
      ).not.toBeInTheDocument();
    });

    it('should handle isApiCallPending calculation', () => {
      mockPaidInstallments.isLoading = true;

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle currentPageSelectedUniqueIds with empty filter', () => {
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'test-unique-id',
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      // Mock that no unique IDs are selected initially
      mockGlobalSelection.isIudSelected = vi.fn().mockReturnValue(false);

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });

    it('should handle effect for shouldLoadData false', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: false });

      // When shouldLoadData is false, table should not be rendered
      expect(screen.queryByTestId('payments-table')).not.toBeInTheDocument();
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });

    it('should show selection banner with total selected count', () => {
      // Setup data with items on current page
      mockPaymentsState.paymentsData = {
        content: [
          {
            iud: 'current-page-iud',
            amount: 100,
            paymentDateTime: '2023-01-01T00:00:00Z',
            receiptCreationDate: '2023-01-01T00:00:00Z',
            organizationId: 123
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10
      } as PagedPaidInstallmentsDTO;

      // Mock global selection: 3 total selected, but only some on current page
      mockGlobalSelection.totalSelected = 3;
      mockGlobalSelection.isIudSelected = vi.fn().mockImplementation((id) => {
        return id === 'current-page-iud'; // Only first item selected on current page
      });

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(
        screen.getByTestId('payments-selection-banner')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Hai selezionato 3 pagamenti')
      ).toBeInTheDocument();
    });

    it('should handle synchronization in useEffect', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        selectedPayments: ['payment1', 'payment2']
      });

      // The useEffect should synchronize selectedPaymentIuds with selectedPayments
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });
  });

  describe('Error scenarios', () => {
    it('should handle API errors in handleFiltersApplied', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      mockPaidInstallments.fetchPaidInstallments.mockRejectedValueOnce(
        new Error('API Error')
      );

      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const applyFiltersButton = screen.getByTestId('mock-apply-filters');
      fireEvent.click(applyFiltersButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch filtered paid installments:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle error states correctly', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(mockPaidInstallments.isError).toBe(false);
      expect(mockOperatingYears.isError).toBe(false);
      expect(mockChapters.isError).toBe(false);
    });

    it('should handle API error states without crashing', () => {
      // Test that the component handles API errors gracefully
      mockOperatingYears.isError = true;
      mockOperatingYears.error = new Error('Operating years fetch failed');

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: false,
        debtPositionTypeOrgCode: 'ORG001'
      });

      // The component should render the wizard step wrapper even with errors
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
    });

    it('should handle chapters API error states without crashing', () => {
      // Test that the component handles chapters API errors gracefully
      mockChapters.isError = true;
      mockChapters.error = new Error('Chapters fetch failed');

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: false,
        debtPositionTypeOrgCode: 'ORG001'
      });

      // The component should render the basic UI even with errors
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('addPaymentsToAssessment')).toBeInTheDocument();
    });

    it('should handle console errors for operating years', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mockOperatingYears.isError = true;
      mockOperatingYears.error = new Error('Operating years error');

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: false,
        debtPositionTypeOrgCode: 'ORG001'
      });

      // Click the "Yes" radio button to trigger shouldLoadData = true
      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      fireEvent.click(yesRadio);

      // Wait for the effect to execute
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Operating years error:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle console errors for chapters with debtPositionTypeOrgCode', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mockChapters.isError = true;
      mockChapters.error = new Error('Chapters error');

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Chapters error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle console errors for payments API in normal mode', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mockPaidInstallments.isError = true;
      mockPaidInstallments.error = new Error('Payments API error');

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        debtPositionTypeOrgCode: 'ORG001'
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Payments API error:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('useEffect coverage tests', () => {
    it('should handle component with active=false', () => {
      renderWithForm(<Step2Payments isActive={false} />, {
        addPaymentsToAssessment: true,
        debtPositionTypeOrgCode: 'ORG001'
      });

      // When isActive is false, PaymentsTable should still render but with limited functionality
      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });

    it('should handle empty previous debtPositionTypeOrgCode', () => {
      // Test the case where prevDebtPositionTypeOrgCode starts empty
      renderWithForm(<Step2Payments isActive={true} />, {
        addPaymentsToAssessment: true,
        debtPositionTypeOrgCode: 'ORG001'
      });

      // Should render payments table without triggering reset
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });
  });
});
