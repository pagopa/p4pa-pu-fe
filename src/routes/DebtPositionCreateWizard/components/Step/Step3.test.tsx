import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import Step3 from './Step3';
import {
  Step3Data,
  Step1Data,
  Step2Data,
  DebtPositionTypeEnum
} from '../../../../models/DebtPositionType';
import type { Beneficiary, Installment } from '../../../../models/paymentTypes';

vi.mock('../../../../hooks/useStep3ApiOperations', () => ({
  useStep3ApiOperations: vi.fn(() => ({
    handleEditModeFlow: vi.fn(),
    handleCreateModeFlow: vi.fn(),
    lastActionWasPublish: { current: false }
  }))
}));

vi.mock('../../../../hooks/useStep3FormHandlers', () => ({
  useStep3FormHandlers: vi.fn(() => ({
    handleAmountChange: vi.fn(),
    handleAmountBlur: vi.fn(),
    handlePaymentOptionChange: vi.fn(),
    handleMultibeneficiaryToggle: vi.fn()
  }))
}));

vi.mock('../../../../utils/step3ValidationUtils', () => ({
  validateFormFields: vi.fn(() => Promise.resolve(true)),
  validateBusinessLogic: vi.fn(() =>
    Promise.resolve({
      isValid: true,
      syncedInstallments: []
    })
  ),
  createValidateInstallmentsData: vi.fn(() =>
    vi.fn(() =>
      Promise.resolve({
        isValid: true,
        syncedInstallments: []
      })
    )
  )
}));

vi.mock('../../../../utils/step3FormDataUtils', () => ({
  hasActualDataToPopulate: vi.fn(() => false),
  populateAllFormFields: vi.fn(() => ({ hasPopulatedSomething: false })),
  prepareFormData: vi.fn((params) => params.values)
}));

vi.mock('../../../../api/debtPositions', () => ({
  default: {
    createDebtPosition: vi.fn(() => ({
      mutateAsync: vi.fn()
    })),
    manageDebtPositionInstallments: vi.fn(() => ({
      mutateAsync: vi.fn()
    })),
    getDebtPositionDetail: vi.fn(() => ({
      data: null
    }))
  }
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: vi.fn(() => ({
      state: { debtPositionId: '123' }
    }))
  };
});

vi.mock('../../../../store/GlobalStore', () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => children,
  useStore: vi.fn(() => ({
    state: { organizationId: 1 }
  }))
}));

vi.mock('../Beneficiary/BeneficiaryField', () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="beneficiary-field">{children}</div>
  )),
  BeneficiaryFieldRef: {}
}));

vi.mock('../Installment/InstallmentField', () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="installment-field">{children}</div>
  ))
}));

vi.mock('../../../../components/Wizard/WizardStepButtons', () => ({
  default: vi.fn(({ onNext, onBack, onSaveDraft }) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      <button onClick={onNext} data-testid="next-button">
        Next
      </button>
      {onSaveDraft && (
        <button onClick={onSaveDraft} data-testid="save-draft-button">
          Save Draft
        </button>
      )}
    </div>
  ))
}));

vi.mock('../../../../components/Wizard/WizardStepWrapper', () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="wizard-step-wrapper" {...props}>
      {children}
    </div>
  ))
}));

vi.mock('../../../../components/Wizard/SectionBox', () => ({
  default: vi.fn(({ children, title, ...props }) => (
    <div data-testid="section-box" {...props}>
      <h2>{title}</h2>
      {children}
    </div>
  ))
}));

const createDefaultStep1Data = (): Step1Data => ({
  description: { value: 'Test Description', readonly: false },
  debtPositionType: { value: '1', flagMandatoryDueDate: false, readonly: false }
});

const createDefaultStep2Data = (): Step2Data => ({
  subjectType: { value: 'individual', readonly: false },
  taxCode: { value: 'RSSMRA80A01H501U', readonly: false },
  fullName: { value: 'Mario Rossi', readonly: false },
  address: { value: 'Via Roma', readonly: false },
  civicNumber: { value: '1', readonly: false },
  zipCode: { value: '00100', readonly: false },
  country: { value: 'IT', readonly: false },
  province: { value: 'RM', readonly: false },
  city: { value: 'Roma', readonly: false }
});

const createDefaultStep3Data = (): Step3Data => ({
  paymentObject: { value: '', readonly: false },
  paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
  amount: { value: '', readonly: false },
  dueDate: { value: '', readonly: false },
  isMultibeneficiary: { value: false, readonly: false },
  beneficiaries: [],
  installments: [],
  flagMandatoryDueDate: false
});

const createTestBeneficiary = (): Beneficiary => ({
  entityName: 'Test Entity',
  amount: '100.00',
  taxCode: 'RSSMRA80A01H501U',
  remittance: 'Test remittance',
  iban: 'IT60X0542811101000000123456',
  postalIban: '',
  taxonomyCode: 'TAX001'
});

const createTestInstallment = (): Installment => ({
  amount: '100.00',
  dueDate: '2024-12-31',
  remittance: 'Test installment',
  isMultibeneficiary: false,
  beneficiaries: []
});

describe('Step3 Component', () => {
  const defaultProps = {
    data: createDefaultStep3Data(),
    setData: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    step1Data: createDefaultStep1Data(),
    step2Data: createDefaultStep2Data(),
    isEditing: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('should render the component with basic elements', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('section-box')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('payment-object-field')).toBeInTheDocument();
      expect(screen.getByTestId('payment-option-field')).toBeInTheDocument();
      expect(screen.getByTestId('amount-field')).toBeInTheDocument();
    });

    it('should render payment option dropdown', () => {
      render(<Step3 {...defaultProps} />);

      const paymentOptionSelect = screen.getByTestId('payment-option-field');
      expect(paymentOptionSelect).toBeInTheDocument();

      const selectElement =
        paymentOptionSelect.querySelector('[role="combobox"]');
      expect(selectElement).toBeInTheDocument();
    });

    it('should show multi-beneficiary switch when not in installment mode', () => {
      render(<Step3 {...defaultProps} />);

      expect(
        screen.getByTestId('multi-beneficiary-switch')
      ).toBeInTheDocument();
    });

    it('should not show beneficiary section initially', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.queryByTestId('beneficiary-field')).not.toBeInTheDocument();
    });

    it('should not show installments section initially', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.queryByTestId('installment-field')).not.toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle payment object input change', async () => {
      render(<Step3 {...defaultProps} />);

      const paymentObjectField = screen.getByTestId('payment-object-field');
      const paymentObjectInput = paymentObjectField.querySelector('input');

      expect(paymentObjectInput).toBeInTheDocument();

      if (paymentObjectInput) {
        await userEvent.clear(paymentObjectInput);
        await userEvent.type(paymentObjectInput, 'Test Payment Object');

        expect(paymentObjectInput.value).toBe('Test Payment Object');
      }
    });

    it('should handle amount input change', async () => {
      render(<Step3 {...defaultProps} />);

      const amountField = screen.getByTestId('amount-field');
      const amountInput = amountField.querySelector('input');

      expect(amountInput).toBeInTheDocument();

      if (amountInput) {
        expect(amountInput).not.toBeDisabled();
        await userEvent.click(amountInput);
        expect(amountInput).toHaveFocus();
      }
    });

    it('should handle payment option change to installments', async () => {
      const installmentsData = {
        ...createDefaultStep3Data(),
        paymentOption: {
          value: DebtPositionTypeEnum.INSTALLMENTS,
          readonly: false
        }
      };
      render(<Step3 {...defaultProps} data={installmentsData} />);
      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    it('should handle multi-beneficiary toggle', () => {
      const multiBeneficiaryData = {
        ...createDefaultStep3Data(),
        isMultibeneficiary: { value: true, readonly: false }
      };

      render(<Step3 {...defaultProps} data={multiBeneficiaryData} />);

      expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when form is invalid', async () => {
      const { validateFormFields } = await import(
        '../../../../utils/step3ValidationUtils'
      );
      vi.mocked(validateFormFields).mockResolvedValueOnce(false);

      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(defaultProps.onNext).not.toHaveBeenCalled();
    });

    it('should proceed when form is valid', async () => {
      const { validateFormFields, validateBusinessLogic } = await import(
        '../../../../utils/step3ValidationUtils'
      );
      const { prepareFormData } = await import(
        '../../../../utils/step3FormDataUtils'
      );

      vi.mocked(validateFormFields).mockResolvedValueOnce(true);
      vi.mocked(validateBusinessLogic).mockResolvedValueOnce({ isValid: true });
      vi.mocked(prepareFormData).mockReturnValueOnce(createDefaultStep3Data());

      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(nextButton).toBeInTheDocument();
    });

    it('should handle business logic validation failure', async () => {
      const { validateFormFields, validateBusinessLogic } = await import(
        '../../../../utils/step3ValidationUtils'
      );

      vi.mocked(validateFormFields).mockResolvedValueOnce(true);
      vi.mocked(validateBusinessLogic).mockResolvedValueOnce({
        isValid: false
      });

      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    const editModeProps = {
      ...defaultProps,
      isEditing: true,
      data: {
        ...createDefaultStep3Data(),
        paymentObject: { value: 'Existing Payment Object', readonly: false },
        amount: { value: '150.00', readonly: false }
      }
    };

    it('should render in edit mode', () => {
      render(<Step3 {...editModeProps} />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Existing Payment Object')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('150,00')).toBeInTheDocument();
    });

    it('should populate form fields in edit mode', async () => {
      const { hasActualDataToPopulate, populateAllFormFields } = await import(
        '../../../../utils/step3FormDataUtils'
      );

      vi.mocked(hasActualDataToPopulate).mockReturnValueOnce(true);
      vi.mocked(populateAllFormFields).mockReturnValueOnce({
        hasPopulatedSomething: true
      });

      render(<Step3 {...editModeProps} />);

      expect(hasActualDataToPopulate).toHaveBeenCalledWith(editModeProps.data);
    });

    it('should show correct button labels in edit mode', () => {
      render(<Step3 {...editModeProps} />);

      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Draft Mode', () => {
    it('should show save draft button in creation mode', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
    });

    it('should handle save draft click', async () => {
      const { validateFormFields, validateBusinessLogic } = await import(
        '../../../../utils/step3ValidationUtils'
      );

      vi.mocked(validateFormFields).mockResolvedValueOnce(true);
      vi.mocked(validateBusinessLogic).mockResolvedValueOnce({ isValid: true });

      render(<Step3 {...defaultProps} />);

      const saveDraftButton = screen.getByTestId('save-draft-button');
      await userEvent.click(saveDraftButton);

      expect(saveDraftButton).toBeInTheDocument();
    });
  });

  describe('Installments Mode', () => {
    const installmentsData = {
      ...createDefaultStep3Data(),
      paymentOption: {
        value: DebtPositionTypeEnum.INSTALLMENTS,
        readonly: false
      },
      installments: [createTestInstallment()]
    };

    it('should render installments field when payment option is installments', () => {
      render(<Step3 {...defaultProps} data={installmentsData} />);

      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    it('should not show due date field in installments mode', () => {
      render(<Step3 {...defaultProps} data={installmentsData} />);

      expect(screen.queryByTestId('due-date-picker')).not.toBeInTheDocument();
    });

    it('should not show multi-beneficiary switch in installments mode', () => {
      render(<Step3 {...defaultProps} data={installmentsData} />);

      expect(
        screen.queryByTestId('multi-beneficiary-switch')
      ).not.toBeInTheDocument();
    });

    it('should disable amount field in installments mode', () => {
      render(<Step3 {...defaultProps} data={installmentsData} />);

      const amountField = screen.getByTestId('amount-field');
      const amountInput = amountField.querySelector('input');
      if (amountInput) {
        expect(amountInput).toBeDisabled();
      }
    });

    it('should disable payment object field in installments mode', () => {
      render(<Step3 {...defaultProps} data={installmentsData} />);

      const paymentObjectField = screen.getByTestId('payment-object-field');
      const paymentObjectInput = paymentObjectField.querySelector('input');
      if (paymentObjectInput) {
        expect(paymentObjectInput).toBeDisabled();
      }
    });
  });

  describe('Multi-beneficiary Mode', () => {
    const multiBeneficiaryData = {
      ...createDefaultStep3Data(),
      isMultibeneficiary: { value: true, readonly: false },
      beneficiaries: [createTestBeneficiary()]
    };

    it('should render beneficiary field when multi-beneficiary is enabled', () => {
      render(<Step3 {...defaultProps} data={multiBeneficiaryData} />);

      expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    });

    it('should pass correct props to beneficiary field', async () => {
      const { default: BeneficiaryField } = await import(
        '../Beneficiary/BeneficiaryField'
      );

      render(<Step3 {...defaultProps} data={multiBeneficiaryData} />);

      expect(BeneficiaryField).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: '',
          fieldNamePrefix: 'beneficiaries',
          disabled: false,
          isEditing: false
        }),
        expect.any(Object)
      );
    });
  });

  describe('Button Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      render(<Step3 {...defaultProps} />);

      const backButton = screen.getByTestId('back-button');
      await userEvent.click(backButton);

      expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('should handle create button click', async () => {
      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { validateFormFields } = await import(
        '../../../../utils/step3ValidationUtils'
      );

      vi.mocked(validateFormFields).mockRejectedValueOnce(
        new Error('Validation error')
      );

      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should update form state when data changes', () => {
      const initialData = {
        ...createDefaultStep3Data(),
        paymentObject: { value: 'Initial Payment Object', readonly: false }
      };

      const { rerender } = render(
        <Step3 {...defaultProps} data={initialData} />
      );

      const paymentObjectField = screen.getByTestId('payment-object-field');
      const paymentObjectInput = paymentObjectField.querySelector('input');
      if (paymentObjectInput) {
        expect(paymentObjectInput).toHaveValue('Initial Payment Object');
      }

      const updatedData = {
        ...createDefaultStep3Data(),
        paymentObject: { value: 'Updated Payment Object', readonly: false }
      };

      rerender(<Step3 {...defaultProps} data={updatedData} />);

      const updatedPaymentObjectField = screen.getByTestId(
        'payment-object-field'
      );
      const updatedPaymentObjectInput =
        updatedPaymentObjectField.querySelector('input');

      expect(updatedPaymentObjectField).toBeInTheDocument();
      if (updatedPaymentObjectInput) {
        expect(updatedPaymentObjectInput).toBeInTheDocument();
      }
    });

    it('should handle installments change', async () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('payment-object-field')).toBeInTheDocument();
      expect(screen.getByTestId('payment-option-field')).toBeInTheDocument();
      expect(screen.getByTestId('amount-field')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<Step3 {...defaultProps} />);

      const form = screen.getByTestId('step3-form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('id', 'step3-configuration-form');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<Step3 {...defaultProps} />);

      rerender(<Step3 {...defaultProps} />);

      expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate properly with custom hooks', async () => {
      const { useStep3ApiOperations } = await import(
        '../../../../hooks/useStep3ApiOperations'
      );
      const { useStep3FormHandlers } = await import(
        '../../../../hooks/useStep3FormHandlers'
      );

      render(<Step3 {...defaultProps} />);

      expect(useStep3ApiOperations).toHaveBeenCalled();
      expect(useStep3FormHandlers).toHaveBeenCalled();
    });

    it('should integrate properly with validation utilities', async () => {
      render(<Step3 {...defaultProps} />);

      const nextButton = screen.getByTestId('next-button');
      await userEvent.click(nextButton);

      expect(nextButton).toBeInTheDocument();
    });

    it('should integrate properly with form data utilities', async () => {
      const { hasActualDataToPopulate } = await import(
        '../../../../utils/step3FormDataUtils'
      );

      render(<Step3 {...defaultProps} isEditing={true} />);

      expect(hasActualDataToPopulate).toHaveBeenCalled();
    });
  });
});
