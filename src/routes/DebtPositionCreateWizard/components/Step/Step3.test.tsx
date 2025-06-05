import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step3 from './Step3';
import {
  Step1Data,
  Step2Data,
  Step3Data,
  DebtPositionTypeEnum
} from '../../../../models/DebtPositionType';
import {
  PaymentOptionTypeEnum,
  DebtPositionStatus
} from '../../../../../generated/data-contracts';
import { MemoryRouter } from 'react-router-dom';
import { useStore } from '../../../../store/GlobalStore';
import debtPositionsApi from '../../../../api/debtPositions';

// Import the mocked utility to access directly in tests
import * as paymentUtility from '../../../../utils/paymentUtility';
import * as installmentValidation from '../../../../utils/paymentUtility';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'debtPositionCreateWizard.configurationAlert.title': 'Configuration',
        'debtPositionCreateWizard.configurationAlert.subtitle':
          'Configure debt position',
        'debtPositionCreateWizard.step3.title': 'Payment Options',
        'debtPositionCreateWizard.step3.paymentObject.label': 'Payment Object',
        'debtPositionCreateWizard.step3.paymentOption.label': 'Payment Option',
        'debtPositionCreateWizard.step3.paymentOption.single': 'Single Payment',
        'debtPositionCreateWizard.step3.paymentOption.installments':
          'Installments',
        'debtPositionCreateWizard.step3.amount.label': 'Amount',
        'debtPositionCreateWizard.step3.amount.installmentHelperText':
          'The amount will be calculated from installments',
        'debtPositionCreateWizard.step3.dueDate.label': 'Due Date',
        'debtPositionCreateWizard.step3.dueDate.required':
          'Due date is required',
        'debtPositionCreateWizard.step3.isMultibeneficiary.label':
          'Multiple Beneficiaries',
        'debtPositionCreateWizard.step3.error.subtitle':
          'Error creating debt position',
        'commons.create': 'Create'
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>
        Navigate
      </div>
    )
  };
});

vi.mock('../../../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../../../api/debtPositions', () => ({
  default: {
    createDebtPosition: vi.fn()
  }
}));

vi.mock('../../../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    },
    config: {
      deployPath: '/piattaformaunitaria'
    }
  }
}));

vi.mock('../../../../utils/paymentUtility', () => ({
  DEFAULT_VALUES: {
    FLAG_IUV_VOLATILE: false,
    MULTI_DEBTOR: false,
    FLAG_PAGO_PA_PAYMENT: true,
    PAYMENT_OPTION_INDEX: 1
  },
  createInstallmentObject: vi.fn((installment) => ({
    installmentNumber: 1,
    amount: installment.amount || '100',
    dueDate: installment.dueDate?.value || new Date(),
    beneficiaries: []
  })),
  createSingleInstallmentObject: vi.fn(() => ({
    installmentNumber: 1,
    amount: '100',
    dueDate: new Date(),
    beneficiaries: []
  })),
  triggerValidationForAllBeneficiaries: vi.fn(),
  syncInstallmentBeneficiaries: vi.fn(() => ({
    installments: [],
    modified: false
  })),
  validateInstallments: vi.fn(() => ({})),
  validateMultiBeneficiary: vi.fn(() => true),
  handleInstallmentValidationFailure: vi.fn()
}));

vi.mock('../../../../components/Wizard/SectionBox', () => ({
  default: ({
    children,
    title
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="section-box">
      <h3>{title}</h3>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({
    children,
    title
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="wizard-step-wrapper">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onBack,
    onNext,
    onSaveDraft,
    nextLabel
  }: {
    onBack: () => void;
    onNext: () => void;
    onSaveDraft: () => void;
    nextLabel: string;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      <button onClick={onNext} data-testid="next-button">
        {nextLabel}
      </button>
      <button onClick={onSaveDraft} data-testid="save-draft-button">
        Save Draft
      </button>
    </div>
  )
}));

vi.mock('../Beneficiary/BeneficiaryField', () => ({
  default: vi.fn(() => (
    <div data-testid="beneficiary-field">Beneficiary Field</div>
  ))
}));

vi.mock('../Installment/InstallmentField', () => ({
  default: vi.fn(() => (
    <div data-testid="installment-field">Installment Field</div>
  ))
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    onChange,
    disabled
  }: {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    disabled: boolean;
    slotProps: Record<string, unknown>;
  }) => (
    <div data-testid="date-picker">
      <label>{label}</label>
      <input
        type="text"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          onChange(e.target.value ? new Date(e.target.value) : null);
        }}
        disabled={disabled}
        data-testid="date-picker-input"
      />
    </div>
  )
}));

describe('Step3 Component', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  const mockCreateDebtPosition = vi.fn();

  const initialData: Step3Data = {
    paymentObject: { value: 'Test Payment', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: '2025-06-01', readonly: false },
    isMultibeneficiary: { value: false, readonly: false },
    flagMandatoryDueDate: false
  };

  const mockStep1Data: Step1Data = {
    description: { value: 'Test Description', readonly: false },
    debtPositionType: {
      value: '1',
      readonly: false,
      flagMandatoryDueDate: false
    }
  };

  const mockStep2Data: Step2Data = {
    taxCode: { value: 'ABCDEF12G34H567I', readonly: false },
    fullName: { value: 'John Doe', readonly: false },
    subjectType: { value: 'PF', readonly: false },
    address: { value: '', readonly: false },
    civicNumber: { value: '', readonly: false },
    zipCode: { value: '', readonly: false },
    country: { value: '', readonly: false },
    province: { value: '', readonly: false },
    city: { value: '', readonly: false }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { organizationId: '123' }
    });

    (
      debtPositionsApi.createDebtPosition as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutate: mockCreateDebtPosition
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );
  };

  it('should render the component correctly', () => {
    renderComponent();

    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('section-box')).toBeInTheDocument();
    expect(screen.getByText('Payment Options')).toBeInTheDocument();
    expect(screen.getByText('Payment Object')).toBeInTheDocument();
    expect(screen.getByText('Payment Option')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('should handle payment option change from single to installments', async () => {
    renderComponent();

    const selectNativeInput = screen.getByDisplayValue('SINGLE');
    fireEvent.change(selectNativeInput, {
      target: { value: PaymentOptionTypeEnum.INSTALLMENTS }
    });

    await waitFor(() => {
      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('date-picker')).not.toBeInTheDocument();
  });

  it('should handle multi-beneficiary toggle and amount change', async () => {
    const triggerSpy = vi.fn();
    vi.spyOn(
      paymentUtility,
      'triggerValidationForAllBeneficiaries'
    ).mockImplementation(triggerSpy);

    renderComponent();

    // Enable multi-beneficiary
    const multiBeneficiarySwitch = screen.getByRole('checkbox', {
      name: /Multiple Beneficiaries/i
    });
    fireEvent.click(multiBeneficiarySwitch);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    });

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    fireEvent.change(amountInput, { target: { value: '200,00' } });
    fireEvent.blur(amountInput);

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    expect(amountInput).toHaveValue('200,00');
  });

  it('should handle form submission for single payment', async () => {
    renderComponent();

    const paymentObjectInput = screen.getByRole('textbox', {
      name: /Payment Object/i
    });
    fireEvent.change(paymentObjectInput, {
      target: { value: 'Updated Payment Object' }
    });

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    fireEvent.change(amountInput, { target: { value: '200,50' } });
    fireEvent.blur(amountInput);

    const datePicker = screen.getByTestId('date-picker-input');
    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentObject: { value: 'Updated Payment Object', readonly: false },
          amount: { value: '200.50', readonly: false }
        })
      );
    });

    expect(mockCreateDebtPosition).toHaveBeenCalled();
  });

  it('should handle amount input correctly', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    fireEvent.change(amountInput, { target: { value: '123,45' } });
    fireEvent.blur(amountInput);

    expect(amountInput).toHaveValue('123,45');

    fireEvent.change(amountInput, { target: { value: 'abc123' } });

    expect(amountInput).toHaveValue('123');
  });

  it('should handle mandatory due date validation', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{ ...initialData, flagMandatoryDueDate: true }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const datePicker = screen.getByTestId('date-picker-input');
    fireEvent.change(datePicker, { target: { value: '' } });

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebtPosition).not.toHaveBeenCalled();
    });
  });

  it('should handle back button click', () => {
    renderComponent();

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should trigger validation when changing amount with multi-beneficiary', async () => {
    // Reset the mock before the test
    vi.clearAllMocks();

    renderComponent();

    // Enable multi-beneficiary
    const multiBeneficiarySwitch = screen.getByRole('checkbox', {
      name: /Multiple Beneficiaries/i
    });
    fireEvent.click(multiBeneficiarySwitch);

    // Wait for beneficiary field to appear
    await waitFor(() => {
      expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    });

    // Now change the amount
    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    fireEvent.change(amountInput, { target: { value: '500,00' } });

    // Verify the triggerValidationForAllBeneficiaries was called
    await waitFor(() => {
      expect(
        paymentUtility.triggerValidationForAllBeneficiaries
      ).toHaveBeenCalled();
    });
  });

  it('should handle save as draft functionality', async () => {
    renderComponent();

    const paymentObjectInput = screen.getByRole('textbox', {
      name: /Payment Object/i
    });
    fireEvent.change(paymentObjectInput, {
      target: { value: 'Draft Payment Object' }
    });

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    fireEvent.change(amountInput, { target: { value: '150,75' } });
    fireEvent.blur(amountInput);

    const datePicker = screen.getByTestId('date-picker-input');
    fireEvent.change(datePicker, { target: { value: '2025-08-20' } });

    const saveDraftButton = screen.getByTestId('save-draft-button');
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentObject: { value: 'Draft Payment Object', readonly: false },
          amount: { value: '150.75', readonly: false }
        })
      );
    });

    expect(mockCreateDebtPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          status: DebtPositionStatus.DRAFT
        })
      })
    );
  });

  it('should validate installments when submitting with installment payment option', async () => {
    renderComponent();

    // Change payment option to installments
    const selectNativeInput = screen.getByDisplayValue('SINGLE');
    fireEvent.change(selectNativeInput, {
      target: { value: PaymentOptionTypeEnum.INSTALLMENTS }
    });

    await waitFor(() => {
      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    // Mock the validateInstallmentsData result
    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      }
    );

    // Set up mock for syncInstallmentBeneficiaries to return valid data
    vi.spyOn(
      installmentValidation,
      'syncInstallmentBeneficiaries'
    ).mockReturnValueOnce({
      installments: [
        {
          amount: '100',
          dueDate: '2025-07-15',
          remittance: 'Test payment',
          isMultibeneficiary: false,
          beneficiaries: []
        }
      ],
      modified: true
    });

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockCreateDebtPosition).toHaveBeenCalled();
    });
  });

  it('should handle mandatory due date validation failure', async () => {
    // Create component with mandatory due date flag set to true
    render(
      <MemoryRouter>
        <Step3
          data={{ ...initialData, flagMandatoryDueDate: true }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    // Clear the date picker
    const datePicker = screen.getByTestId('date-picker-input');
    fireEvent.change(datePicker, { target: { value: '' } });
    fireEvent.blur(datePicker);

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockCreateDebtPosition).not.toHaveBeenCalled();
    });
  });

  it('should validate due date when date changes and it is mandatory', async () => {
    // Create component with mandatory due date flag set to true
    render(
      <MemoryRouter>
        <Step3
          data={{ ...initialData, flagMandatoryDueDate: true }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    // Get the date picker and trigger a change
    const datePicker = screen.getByTestId('date-picker-input');

    // First set a valid date
    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    // Then clear it to trigger validation
    fireEvent.change(datePicker, { target: { value: '' } });

    // Simulate the DatePicker onClose event
    fireEvent.blur(datePicker);

    expect(datePicker).toHaveValue('');
  });
});
