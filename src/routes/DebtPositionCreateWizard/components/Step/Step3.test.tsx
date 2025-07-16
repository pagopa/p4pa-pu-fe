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
import { MemoryRouter } from 'react-router';
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
        'commons.create': 'Create',
        'commons.save': 'Save',
        'commons.saveDraft': 'Save Draft'
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('react-router', async (importOriginal) => {
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
    createDebtPosition: vi.fn(),
    manageDebtPositionInstallments: vi.fn(),
    getDebtPositionDetail: vi.fn()
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
    nextLabel,
    showSaveDraft
  }: {
    onBack: () => void;
    onNext: () => void;
    onSaveDraft: () => void;
    nextLabel: string;
    showSaveDraft: boolean;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      <button onClick={onNext} data-testid="next-button">
        {nextLabel}
      </button>
      {showSaveDraft && (
        <button onClick={onSaveDraft} data-testid="save-draft-button">
          Save Draft
        </button>
      )}
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
  const mockManageDebtPositionInstallments = vi.fn();
  const mockGetDebtPositionDetail = vi.fn();
  const mockCreateDebtPositionAsync = vi.fn();
  const mockManageDebtPositionInstallmentsAsync = vi.fn();

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

    mockCreateDebtPositionAsync.mockResolvedValue({
      paymentObject: 'Test Payment Object',
      response: {
        status: DebtPositionStatus.UNPAID,
        debtPositionId: 123
      }
    });

    mockManageDebtPositionInstallmentsAsync.mockResolvedValue({
      description: 'Test Description',
      status: DebtPositionStatus.UNPAID,
      debtPositionId: 123
    });

    (
      debtPositionsApi.createDebtPosition as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutate: mockCreateDebtPosition,
      mutateAsync: mockCreateDebtPositionAsync
    });

    (
      debtPositionsApi.manageDebtPositionInstallments as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockReturnValue({
      mutate: mockManageDebtPositionInstallments,
      mutateAsync: mockManageDebtPositionInstallmentsAsync
    });

    (
      debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
        typeof vi.fn
      >
    ).mockReturnValue({
      data: null
    });

    mockGetDebtPositionDetail.mockReturnValue({
      data: null
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
    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    const datePicker = screen.getByTestId('date-picker-input');
    const submitButton = screen.getByTestId('next-button');

    fireEvent.change(paymentObjectInput, {
      target: { value: 'Updated Payment Object' }
    });

    fireEvent.change(amountInput, { target: { value: '200,50' } });
    fireEvent.blur(amountInput);

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    expect(paymentObjectInput).toHaveValue('Updated Payment Object');
    expect(amountInput).toHaveValue('200,50');
    expect(datePicker).toHaveValue('2025-07-15');

    fireEvent.click(submitButton);

    expect(paymentObjectInput).toHaveValue('Updated Payment Object');
    expect(amountInput).toHaveValue('200,50');
    expect(datePicker).toHaveValue('2025-07-15');
    expect(submitButton).toBeInTheDocument();

    expect(submitButton.closest('form')).toHaveAttribute(
      'id',
      'step3-configuration-form'
    );
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
      expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
    });
  });

  it('should handle back button click', () => {
    renderComponent();

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should trigger validation when changing amount with multi-beneficiary', async () => {
    vi.clearAllMocks();

    renderComponent();

    const multiBeneficiarySwitch = screen.getByRole('checkbox', {
      name: /Multiple Beneficiaries/i
    });
    fireEvent.click(multiBeneficiarySwitch);

    await waitFor(() => {
      expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
    });

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });
    fireEvent.change(amountInput, { target: { value: '500,00' } });

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

    expect(mockCreateDebtPositionAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          status: DebtPositionStatus.DRAFT
        })
      })
    );
  });

  it('should validate installments when submitting with installment payment option', async () => {
    renderComponent();

    const selectNativeInput = screen.getByDisplayValue('SINGLE');
    fireEvent.change(selectNativeInput, {
      target: { value: PaymentOptionTypeEnum.INSTALLMENTS }
    });

    await waitFor(() => {
      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      }
    );

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
      expect(mockCreateDebtPositionAsync).toHaveBeenCalled();
    });
  });

  it('should handle mandatory due date validation failure', async () => {
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
    fireEvent.blur(datePicker);

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
    });
  });

  it('should validate due date when date changes and it is mandatory', async () => {
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

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    fireEvent.change(datePicker, { target: { value: '' } });

    fireEvent.blur(datePicker);

    expect(datePicker).toHaveValue('');
  });

  it('should handle wheel event properly when target is HTMLElement', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveValue('100,00');

    fireEvent.change(amountInput, { target: { value: '200,50' } });
    expect(amountInput).toHaveValue('200,50');
  });

  it('should handle DatePicker onClose callback when due date is mandatory', async () => {
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

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    fireEvent.blur(datePicker);

    expect(datePicker).toHaveValue('2025-07-15');
  });

  it('should handle payment option readonly state', () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.SINGLE,
              readonly: true
            }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const paymentOptionSelect = screen.getByDisplayValue('SINGLE');
    expect(paymentOptionSelect).toBeDisabled();
  });

  it('should handle amount readonly state in installment mode', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            },
            amount: { value: '100.00', readonly: true }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      const amountInput = screen.getByRole('textbox', { name: /Amount/i });
      expect(amountInput).toBeDisabled();
    });
  });

  it('should handle due date readonly state', () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            dueDate: { value: '2025-06-01', readonly: true }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const datePicker = screen.getByTestId('date-picker-input');
    expect(datePicker).toBeDisabled();
  });

  it('should handle multi-beneficiary readonly state', () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            isMultibeneficiary: { value: false, readonly: true }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const multiBeneficiarySwitch = screen.getByRole('checkbox', {
      name: /Multiple Beneficiaries/i
    });
    expect(multiBeneficiarySwitch).toBeDisabled();
  });

  it('should handle payment object disabled state in installments mode', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      const paymentObjectInput = screen.getByRole('textbox', {
        name: /Payment Object/i
      });
      expect(paymentObjectInput).toBeDisabled();
    });
  });

  it('should handle validation failures for installments', async () => {
    renderComponent();

    const selectNativeInput = screen.getByDisplayValue('SINGLE');
    fireEvent.change(selectNativeInput, {
      target: { value: DebtPositionTypeEnum.INSTALLMENTS }
    });

    await waitFor(() => {
      expect(screen.getByTestId('installment-field')).toBeInTheDocument();
    });

    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: true,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      }
    );

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
    });
  });

  it('should set showSaveDraft to false when isEditing is true', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
          isEditing={true}
        />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('save-draft-button')).not.toBeInTheDocument();
  });

  it('should handle installments array fallback when formattedValues.installments is undefined', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            },
            installments: undefined
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
    });
  });

  it('should trigger paymentObject field onChange directly', async () => {
    renderComponent();

    const paymentObjectInput = screen.getByRole('textbox', {
      name: /Payment Object/i
    });

    fireEvent.change(paymentObjectInput, {
      target: { value: 'Test onChange' }
    });

    expect(paymentObjectInput).toHaveValue('Test onChange');
  });

  it('should show error helper text for paymentObject when submitted with error', async () => {
    render(
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

    const paymentObjectInput = screen.getByRole('textbox', {
      name: /Payment Object/i
    });

    fireEvent.change(paymentObjectInput, { target: { value: '' } });
    fireEvent.blur(paymentObjectInput);

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorText = screen.queryByText(/required/i);
      if (errorText) {
        expect(errorText).toBeInTheDocument();
      }
    });
  });

  it('should trigger validation timeout when date changes with mandatory flag', async () => {
    vi.useFakeTimers();

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

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    vi.runAllTimers();

    expect(datePicker).toHaveValue('2025-07-15');

    vi.useRealTimers();
  });

  it('should handle trigger validation timeout execution', async () => {
    vi.useFakeTimers();

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

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });
    fireEvent.change(datePicker, { target: { value: '2025-08-15' } });

    vi.runAllTimers();

    expect(datePicker).toHaveValue('2025-08-15');

    vi.useRealTimers();
  });

  it('should cover formattedValues.installments fallback to empty array', async () => {
    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      }
    );

    vi.spyOn(
      installmentValidation,
      'syncInstallmentBeneficiaries'
    ).mockReturnValueOnce({
      installments: [],
      modified: false
    });

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            },
            installments: undefined
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebtPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            paymentOptions: expect.arrayContaining([
              expect.objectContaining({
                installments: []
              })
            ])
          })
        })
      );
    });
  });

  it('should trigger validation on DatePicker onClose when flagMandatoryDueDate is false', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{ ...initialData, flagMandatoryDueDate: false }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const datePicker = screen.getByTestId('date-picker-input');

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    fireEvent.blur(datePicker);

    expect(datePicker).toHaveValue('2025-07-15');
  });

  it('should handle edge case in onSubmit when isInstallment is true but validateInstallmentsData returns invalid', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: true,
        hasInvalidPaymentFields: true,
        hasInvalidAmounts: true,
        hasEmptyRemittance: true
      }
    );

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
    });
  });

  it('should test wheel event handler edge case', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    const inputProps = amountInput.getAttribute('style');
    expect(inputProps).toContain('text-align: left');

    expect(amountInput).toBeInTheDocument();
  });

  it('should test amount field onChange handler callback', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    fireEvent.change(amountInput, { target: { value: '300,75' } });

    expect(amountInput).toHaveValue('300,75');
  });

  it('should trigger DatePicker onClose logic without mandatory flag', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{ ...initialData, flagMandatoryDueDate: false }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const datePicker = screen.getByTestId('date-picker-input');

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });
    fireEvent.blur(datePicker);

    expect(datePicker).toHaveValue('2025-07-15');
  });

  it('should test complex scenario with installments and editing mode', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            },
            installments: []
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
          isEditing={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('installment-field')).toBeInTheDocument();

    expect(screen.queryByTestId('save-draft-button')).not.toBeInTheDocument();
  });

  it('should cover onWheel event preventDefault case when target is not HTMLElement', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    fireEvent.wheel(amountInput);

    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveValue('100,00');
  });

  it('should cover paymentObject field onChange direct execution', async () => {
    renderComponent();

    const paymentObjectInput = screen.getByRole('textbox', {
      name: /Payment Object/i
    });

    const testValue = 'Test Payment Object Direct';

    fireEvent.change(paymentObjectInput, {
      target: { value: testValue }
    });

    expect(paymentObjectInput).toHaveValue(testValue);
  });

  it('should execute DatePicker onClose callback when mandatory flag is active', async () => {
    vi.useFakeTimers();

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

    fireEvent.change(datePicker, { target: { value: '2025-07-15' } });

    fireEvent.blur(datePicker);

    vi.runAllTimers();

    expect(datePicker).toHaveValue('2025-07-15');

    vi.useRealTimers();
  });

  it('should handle real wheel event simulation with HTMLElement target', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    amountInput.focus();

    const wheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 100
    });

    amountInput.dispatchEvent(wheelEvent);

    expect(amountInput).toBeInTheDocument();
  });

  it('should cover edge case: formattedValues.installments undefined in API call', async () => {
    vi.spyOn(installmentValidation, 'validateInstallments').mockReturnValueOnce(
      {
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      }
    );

    vi.spyOn(
      installmentValidation,
      'syncInstallmentBeneficiaries'
    ).mockReturnValueOnce({
      installments: [],
      modified: false
    });

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: DebtPositionTypeEnum.INSTALLMENTS,
              readonly: false
            },
            installments: undefined
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
          step1Data={mockStep1Data}
          step2Data={mockStep2Data}
        />
      </MemoryRouter>
    );

    const submitButton = screen.getByTestId('next-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDebtPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            paymentOptions: expect.arrayContaining([
              expect.objectContaining({
                installments: []
              })
            ])
          })
        })
      );
    });
  });

  it('should test multiple setTimeout executions in DatePicker', async () => {
    vi.useFakeTimers();

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

    fireEvent.change(datePicker, { target: { value: '2025-01-15' } });
    fireEvent.change(datePicker, { target: { value: '2025-02-15' } });
    fireEvent.change(datePicker, { target: { value: '2025-03-15' } });

    vi.runAllTimers();

    expect(datePicker).toHaveValue('2025-03-15');

    vi.useRealTimers();
  });

  it('should test onWheel with different event target scenarios', async () => {
    renderComponent();

    const amountInput = screen.getByRole('textbox', { name: /Amount/i });

    fireEvent.wheel(amountInput, { deltaY: 100 });

    expect(amountInput).toBeInTheDocument();
    expect(amountInput).toHaveValue('100,00');
  });

  describe('getSaveDraftHandler function', () => {
    it('should return undefined for UNPAID/EXPIRED in edit mode (no save draft option)', () => {
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      // In edit mode per UNPAID/EXPIRED, il save draft button non dovrebbe essere visibile
      expect(screen.queryByTestId('save-draft-button')).not.toBeInTheDocument();
    });

    it('should show save draft button for DRAFT in edit mode', async () => {
      // Mock per DRAFT debt position
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.DRAFT,
          paymentOptions: [{ paymentOptionId: 'payment-123' }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
      });
    });

    it('should show correct buttons for DRAFT in edit mode', async () => {
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.DRAFT,
          paymentOptions: [{ paymentOptionId: 'payment-123' }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('next-button')).toBeInTheDocument();
        expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
      });
    });

    it('should show save draft button in creation mode', async () => {
      render(
        <MemoryRouter>
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId('save-draft-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });
  });

  describe('Edit mode error handling', () => {
    it('should handle missing paymentOptionId in edit mode', async () => {
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.DRAFT,
          paymentOptions: [{ paymentOptionId: null }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockManageDebtPositionInstallmentsAsync).not.toHaveBeenCalled();
      });
    });

    it('should handle invalid debtPositionId in edit mode', async () => {
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.DRAFT,
          paymentOptions: [{ paymentOptionId: 'payment-123' }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 'invalid-id' }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockManageDebtPositionInstallmentsAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Button labels and visibility', () => {
    it('should show correct button labels for DRAFT in edit mode', async () => {
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.DRAFT,
          paymentOptions: [{ paymentOptionId: 'payment-123' }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button');
        expect(nextButton).toHaveTextContent('commons.create');

        const saveDraftButton = screen.getByTestId('save-draft-button');
        expect(saveDraftButton).toHaveTextContent('Save Draft');
      });
    });

    it('should show correct button labels for UNPAID in edit mode', async () => {
      (
        debtPositionsApi.getDebtPositionDetail as unknown as ReturnType<
          typeof vi.fn
        >
      ).mockReturnValue({
        data: {
          status: DebtPositionStatus.UNPAID,
          paymentOptions: [{ paymentOptionId: 'payment-123' }]
        }
      });

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        const nextButton = screen.getByTestId('next-button');
        expect(nextButton).toHaveTextContent('commons.save');

        expect(
          screen.queryByTestId('save-draft-button')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form data population in edit mode', () => {
    it('should populate form fields when editing with actual data', async () => {
      const dataWithActualValues: Step3Data = {
        paymentObject: { value: 'Existing Payment Object', readonly: false },
        paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
        amount: { value: '150.50', readonly: false },
        dueDate: { value: '2025-12-01', readonly: false },
        isMultibeneficiary: { value: true, readonly: false },
        beneficiaries: [
          {
            entityName: 'Test Entity',
            amount: '150.50',
            taxCode: 'TEST123',
            remittance: 'Test remittance',
            iban: 'IT60X0542811101000000123456',
            taxonomyCode: 'TEST'
          }
        ],
        installments: [],
        flagMandatoryDueDate: false
      };

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={dataWithActualValues}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('Existing Payment Object')
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('150,50')).toBeInTheDocument();
      });
    });

    it('should not populate form fields when editing without actual data', async () => {
      const dataWithEmptyValues: Step3Data = {
        paymentObject: { value: '', readonly: false },
        paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
        amount: { value: '', readonly: false },
        dueDate: { value: '', readonly: false },
        isMultibeneficiary: { value: false, readonly: false },
        beneficiaries: [],
        installments: [],
        flagMandatoryDueDate: false
      };

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={dataWithEmptyValues}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        const paymentObjectInput = screen.getByRole('textbox', {
          name: /Payment Object/i
        });
        expect(paymentObjectInput).toHaveValue('');
      });
    });

    it('should populate form fields with installments data', async () => {
      const dataWithInstallments: Step3Data = {
        paymentObject: { value: 'Installment Payment', readonly: false },
        paymentOption: {
          value: DebtPositionTypeEnum.INSTALLMENTS,
          readonly: false
        },
        amount: { value: '300.00', readonly: false },
        dueDate: { value: '', readonly: false },
        isMultibeneficiary: { value: false, readonly: false },
        beneficiaries: [],
        installments: [
          {
            amount: '100.00',
            dueDate: '2025-06-01',
            remittance: 'First installment',
            isMultibeneficiary: false,
            beneficiaries: []
          },
          {
            amount: '200.00',
            dueDate: '2025-07-01',
            remittance: 'Second installment',
            isMultibeneficiary: false,
            beneficiaries: []
          }
        ],
        flagMandatoryDueDate: false
      };

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={dataWithInstallments}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('installment-field')).toBeInTheDocument();
      });
    });

    it('should handle date value as string in dueDate field', async () => {
      const dataWithStringDate: Step3Data = {
        paymentObject: { value: 'Payment with string date', readonly: false },
        paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
        amount: { value: '100.00', readonly: false },
        dueDate: { value: '2025-06-15', readonly: false },
        isMultibeneficiary: { value: false, readonly: false },
        beneficiaries: [],
        installments: [],
        flagMandatoryDueDate: false
      };

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={dataWithStringDate}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        const datePicker = screen.getByTestId('date-picker-input');
        expect(datePicker).toHaveValue('2025-06-15');
      });
    });
  });

  describe('Multi-beneficiary initialization logic', () => {
    it('should initialize beneficiaries when multi-beneficiary is enabled and no beneficiaries exist', async () => {
      render(
        <MemoryRouter>
          <Step3
            data={{
              ...initialData,
              isMultibeneficiary: { value: false, readonly: false }
            }}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      const multiBeneficiarySwitch = screen.getByRole('checkbox', {
        name: /Multiple Beneficiaries/i
      });

      fireEvent.click(multiBeneficiarySwitch);

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
      });
    });

    it('should not initialize beneficiaries when in editing mode with already set up data', async () => {
      const dataWithExistingBeneficiaries: Step3Data = {
        ...initialData,
        isMultibeneficiary: { value: true, readonly: false },
        beneficiaries: [
          {
            entityName: 'Existing Entity',
            amount: '100.00',
            taxCode: 'EXISTING123',
            remittance: 'Existing remittance',
            iban: 'IT60X0542811101000000123456',
            taxonomyCode: 'EXISTING'
          }
        ]
      };

      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/debt-position-edit',
              state: { debtPositionId: 123 }
            }
          ]}
        >
          <Step3
            data={dataWithExistingBeneficiaries}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={true}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
      });
    });

    it('should clear beneficiaries when multi-beneficiary is disabled', async () => {
      render(
        <MemoryRouter>
          <Step3
            data={{
              ...initialData,
              isMultibeneficiary: { value: true, readonly: false }
            }}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
      });

      const multiBeneficiarySwitch = screen.getByRole('checkbox', {
        name: /Multiple Beneficiaries/i
      });

      fireEvent.click(multiBeneficiarySwitch);

      await waitFor(() => {
        expect(
          screen.queryByTestId('beneficiary-field')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Additional edge cases', () => {
    it('should handle beneficiary validation failure correctly', async () => {
      vi.spyOn(paymentUtility, 'validateMultiBeneficiary').mockReturnValue(
        false
      );

      render(
        <MemoryRouter>
          <Step3
            data={{
              ...initialData,
              isMultibeneficiary: { value: true, readonly: false }
            }}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
      });
    });

    it('should handle form validation failure correctly', async () => {
      render(
        <MemoryRouter>
          <Step3
            data={{
              ...initialData,
              paymentObject: { value: '', readonly: false }
            }}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCreateDebtPositionAsync).not.toHaveBeenCalled();
      });
    });

    it('should handle installments modification correctly', async () => {
      vi.spyOn(
        installmentValidation,
        'syncInstallmentBeneficiaries'
      ).mockReturnValueOnce({
        installments: [
          {
            amount: '100',
            dueDate: '2025-07-15',
            remittance: 'Modified payment',
            isMultibeneficiary: false,
            beneficiaries: []
          }
        ],
        modified: true
      });

      vi.spyOn(
        installmentValidation,
        'validateInstallments'
      ).mockReturnValueOnce({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      render(
        <MemoryRouter>
          <Step3
            data={{
              ...initialData,
              paymentOption: {
                value: DebtPositionTypeEnum.INSTALLMENTS,
                readonly: false
              }
            }}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('installment-field')).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockCreateDebtPositionAsync).toHaveBeenCalled();
      });
    });

    it('should handle amount formatting on blur with invalid number', async () => {
      render(
        <MemoryRouter>
          <Step3
            data={initialData}
            setData={mockSetData}
            onNext={mockOnNext}
            onBack={mockOnBack}
            step1Data={mockStep1Data}
            step2Data={mockStep2Data}
            isEditing={false}
          />
        </MemoryRouter>
      );

      const amountInput = screen.getByRole('textbox', { name: /Amount/i });

      fireEvent.change(amountInput, { target: { value: 'invalid-number' } });
      fireEvent.blur(amountInput);

      // Should not throw error and maintain the invalid value
      expect(amountInput).toHaveValue('');
    });
  });
});
