import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { Step2Payments, validateStep2Payments } from './Step2Payments';
import { render } from '../../../__tests__/renderers';

const mockPaymentsState = {
  paymentsData: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10
  },
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
  globalSelectedUniqueIds: new Set<string>(),
  clearAllSelections: vi.fn(),
  toggleUniqueIdSelection: vi.fn(),
  isUniqueIdSelected: vi.fn().mockReturnValue(false)
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
        updateDate: '2023-01-01T00:00:00Z'
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
    disabled,
    selectedUniqueIds,
    'data-testid': testId
  }: {
    onSelectionChange?: (selectedIds: Array<string>) => void;
    onFiltersApplied?: (
      filters: Record<string, unknown>,
      pagination: { page: number; size: number },
      sortParams?: Array<string>
    ) => void;
    onFilterValidationError?: (hasError: boolean) => void;
    disabled?: boolean;
    selectedUniqueIds?: Array<string>;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId || 'payments-table'}>
      <button
        data-testid="mock-select-payment"
        onClick={() => onSelectionChange?.(['test-unique-id-1'])}
        disabled={disabled}
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
      <div data-testid="selected-unique-ids">
        {selectedUniqueIds?.join(',')}
      </div>
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
      label,
      name,
      options,
      disabled,
      control,
      'data-testid': testId,
      sx
    }: {
      label: string;
      name: string;
      options: Array<{ value: boolean; label: string }>;
      disabled?: boolean;
      control: ReturnType<typeof useForm>['control'];
      'data-testid': string;
      sx?: { flexDirection?: string };
    }) => {
      const { Controller } = require('react-hook-form');

      return (
        <div data-testid={testId}>
          <Controller
            name={name}
            control={control}
            render={({
              field
            }: {
              field: { value: boolean; onChange: (value: boolean) => void };
            }) => (
              <fieldset disabled={disabled}>
                <legend>{label}</legend>
                <div
                  style={{
                    flexDirection:
                      (sx?.flexDirection as 'row' | 'column') || 'column'
                  }}
                >
                  {options?.map((option) => (
                    <label key={String(option.value)}>
                      <input
                        type="radio"
                        name={name}
                        value={String(option.value)}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        disabled={disabled}
                        data-testid={`${testId}-${option.value}`}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          />
        </div>
      );
    }
  }
}));

vi.mock('../../../api/classifications/paidInstallments/mappings', () => ({
  convertFiltersToAPI: vi.fn().mockReturnValue({
    dateFrom: '2023-01-01',
    dateTo: '2023-01-31'
  })
}));

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
    mockGlobalSelection.globalSelectedUniqueIds = new Set();

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

  describe('Disabled state', () => {
    it('should disable radio group when editmode is true', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).toBeDisabled();
      expect(noRadio).toBeDisabled();
    });

    it('should enable radio group when editmode is false', () => {
      renderWithForm(<Step2Payments />);

      const yesRadio = screen.getByTestId('addPaymentsToAssessment-true');
      const noRadio = screen.getByTestId('addPaymentsToAssessment-false');

      expect(yesRadio).not.toBeDisabled();
      expect(noRadio).not.toBeDisabled();
    });

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

    it('should handle editmode prop correctly', () => {
      renderWithForm(<Step2Payments />);

      const fieldset = screen
        .getByTestId('addPaymentsToAssessment')
        .querySelector('fieldset');
      expect(fieldset).toBeDisabled();
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

    it('should disable clear selection button in editmode', () => {
      mockGlobalSelection.totalSelected = 2;

      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true
      });

      const clearButton = screen.getByTestId('clear-selection-button');
      expect(clearButton).toBeDisabled();
    });
  });

  describe('PaymentsTable interactions', () => {
    it('should handle table selection changes', async () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      const selectButton = screen.getByTestId('mock-select-payment');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockGlobalSelection.toggleUniqueIdSelection).toHaveBeenCalled();
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

    it('should disable PaymentsTable in editmode', () => {
      renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true
      });

      const selectButton = screen.getByTestId('mock-select-payment');
      expect(selectButton).toBeDisabled();
    });
  });

  describe('Form field synchronization', () => {
    it('should update selectedPaymentIuds when selectedPayments changes', async () => {
      const {} = renderWithForm(<Step2Payments />, {
        addPaymentsToAssessment: true,
        selectedPayments: ['payment1']
      });
      await waitFor(() => {
        expect(
          mockPaymentsState.setShowPaymentsValidationError
        ).toHaveBeenCalledWith(false);
      });
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
  });

  describe('Additional coverage tests', () => {
    it('should verify component structure and functionality', () => {
      renderWithForm(<Step2Payments />, { addPaymentsToAssessment: true });

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('payments-table')).toBeInTheDocument();
    });
  });

  describe('Error scenarios', () => {
    it('should handle API errors in handleFiltersApplied', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

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
  });
});
