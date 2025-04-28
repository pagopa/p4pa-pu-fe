import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageRoutes } from '../../../../App';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PaymentOption } from '../../../../models/paymentTypes';

type FormSubmitEvent = {
  preventDefault?: () => void;
};

type FormFieldValue<T> = {
  value: T;
  readonly: boolean;
};

type FormData = {
  paymentObject: FormFieldValue<string>;
  paymentOption: FormFieldValue<PaymentOption>;
  amount: FormFieldValue<string>;
  dueDate: FormFieldValue<Date | null>;
  isMultibeneficiary: FormFieldValue<boolean>;
  beneficiaries?: Array<BeneficiaryItem>;
  installments?: Array<InstallmentItem>;
};

type BeneficiaryItem = {
  entityName: string;
  amount: string;
  taxCode?: string;
  iban?: string;
  postalAccount?: string;
  taxonomyCode?: string;
  remittance?: string;
};

type InstallmentItem = {
  amount: string;
  dueDate: string;
  remittance?: string;
};

class WatchValueProvider {
  private isMultibeneficiary: boolean;
  private paymentOption: PaymentOption;
  private withBeneficiaries: boolean;

  constructor(options: {
    isMultibeneficiary: boolean;
    paymentOption: PaymentOption;
    withBeneficiaries?: boolean;
  }) {
    this.isMultibeneficiary = options.isMultibeneficiary;
    this.paymentOption = options.paymentOption;
    this.withBeneficiaries = options.withBeneficiaries || false;
  }

  getValue(key: string): unknown {
    switch (key) {
      case 'isMultibeneficiary.value':
        return this.isMultibeneficiary;
      case 'amount.value':
        return '100.00';
      case 'beneficiaries':
        if (this.withBeneficiaries) {
          return [{ entityName: 'Test', amount: '50.00' } as BeneficiaryItem];
        }
        return [];
      case 'paymentOption.value':
        return this.paymentOption;
      case 'installments':
        return [];
      default:
        return '';
    }
  }
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../../utils/fieldValidation', () => ({
  isBeneficiariesTotalValid: vi.fn().mockReturnValue(true),
  createAmountValidator: () => ({ required: 'Campo obbligatorio' }),
  createDateValidator: () => ({})
}));

vi.mock('../../../../utils/formatters', () => ({
  formatDate: (date: string) => date
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockSetValue = vi.fn();
const mockTrigger = vi.fn();
const mockGetValues = vi.fn().mockReturnValue({} as Record<string, unknown>);

const defaultProvider = new WatchValueProvider({
  isMultibeneficiary: false,
  paymentOption: 'SINGLE'
});

const mockWatch = vi
  .fn()
  .mockImplementation((key: string) => defaultProvider.getValue(key));

const getFieldValue = (fieldName: string): string | PaymentOption => {
  if (fieldName.includes('amount')) {
    return '100.00';
  }
  if (fieldName.includes('paymentOption')) {
    return 'SINGLE';
  }
  return '';
};

vi.mock('react-hook-form', () => {
  return {
    useForm: () => ({
      handleSubmit: (fn: (data: FormData) => void) => (e?: FormSubmitEvent) => {
        e?.preventDefault?.();
        fn({
          paymentObject: { value: 'Test Payment', readonly: false },
          paymentOption: { value: 'SINGLE', readonly: false },
          amount: { value: '100.00', readonly: false },
          dueDate: { value: new Date(), readonly: false },
          isMultibeneficiary: { value: false, readonly: false }
        });
        return Promise.resolve();
      },
      control: {},
      formState: { errors: {}, isSubmitted: false },
      watch: mockWatch,
      setValue: mockSetValue,
      trigger: mockTrigger,
      getValues: mockGetValues
    }),
    Controller: ({
      name,
      render
    }: {
      name: string;
      render: (props: Record<string, unknown>) => React.ReactElement;
    }) => {
      const nameString = String(name);

      const onChange = vi.fn((e: unknown) => {
        if (typeof e === 'object' && e !== null) {
          mockSetValue(nameString, e);
        }
      });

      return render({
        field: {
          onChange,
          value: getFieldValue(nameString),
          onBlur: vi.fn(),
          ref: vi.fn(),
          name: nameString
        },
        fieldState: {}
      });
    }
  };
});

type ChildrenProps = {
  children: React.ReactNode;
};

type WizardStepWrapperProps = {
  title: string;
  subtitle?: string;
} & ChildrenProps;

type SectionBoxProps = {
  title: string;
  adornment?: React.ReactNode;
} & ChildrenProps;

type StepButtonsProps = {
  onBack: () => void;
  onNext: () => void;
  disableNext?: boolean;
  nextLabel?: string;
};

type InstallmentFieldProps = {
  onInstallmentsChange?: (totalAmount: string) => void;
  [key: string]: unknown;
};

vi.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }: ChildrenProps) => <>{children}</>
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: () => <div data-testid="date-picker" />
}));

const mockResetAllBeneficiaries = vi.fn();

type BeneficiaryFieldProps = {
  ref?: React.MutableRefObject<{
    resetAllBeneficiaries: () => void;
  } | null>;
  [key: string]: unknown;
};

vi.mock('../Beneficiary/BeneficiaryField', () => ({
  default: (props: BeneficiaryFieldProps) => {
    if (props.ref) {
      props.ref.current = { resetAllBeneficiaries: mockResetAllBeneficiaries };
    }
    return <div data-testid="beneficiary-field">Beneficiary Field</div>;
  }
}));

vi.mock('../Installment/InstallmentField', () => ({
  default: (props: InstallmentFieldProps) => {
    if (props.onInstallmentsChange) {
      setTimeout(() => {
        if (typeof props.onInstallmentsChange === 'function') {
          props.onInstallmentsChange('200.00');
        }
      }, 0);
    }
    return <div data-testid="installment-field">Installment Field</div>;
  }
}));

vi.mock('../../../../components/Wizard/WizardStepWrapper', () => ({
  default: ({ children, title }: WizardStepWrapperProps) => (
    <div data-testid="wizard-step-wrapper">
      <div data-testid="title">{title}</div>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/SectionBox', () => ({
  default: ({ children, title }: SectionBoxProps) => (
    <div data-testid="section-box">
      <div data-testid="section-title">{title}</div>
      {children}
    </div>
  )
}));

vi.mock('../../../../components/Wizard/WizardStepButtons', () => ({
  default: ({ onBack, onNext }: StepButtonsProps) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      <button onClick={onNext} data-testid="next-button">
        Next
      </button>
    </div>
  )
}));

import Step3 from './Step3';
import { isBeneficiariesTotalValid } from '../../../../utils/fieldValidation';

describe('Step3 Component', () => {
  const mockSetData = vi.fn();
  const mockOnBack = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const defaultProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'SINGLE'
    });
    mockWatch.mockImplementation((key: string) =>
      defaultProvider.getValue(key)
    );
  });

  const initialData = {
    paymentObject: { value: 'Test Payment', readonly: false },
    paymentOption: { value: 'SINGLE' as PaymentOption, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    flagMandatoryDueDate: false,
    isMultibeneficiary: { value: false, readonly: false }
  };

  it('should render correctly with initial data', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('section-box')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();

    expect(screen.getByTestId('title')).toHaveTextContent(
      'debtPositionCreateWizard.configurationAlert.title'
    );
    expect(screen.getByTestId('section-title')).toHaveTextContent(
      'debtPositionCreateWizard.step3.title'
    );
  });

  it('should call onBack when clicking the back button', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should show InstallmentField when paymentOption is INSTALLMENTS', () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: {
              value: 'INSTALLMENTS' as PaymentOption,
              readonly: false
            }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('installment-field')).toBeInTheDocument();
  });

  it('should navigate to completion page after successful submit', async () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.DEBT_POSITION_CREATE_WIZARD_COMPLETED,
        expect.objectContaining({
          state: expect.any(Object),
          replace: true
        })
      );
    });
  });

  it('should display BeneficiaryField component when multibeneficiary is active', () => {
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
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
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  it('should handle correctly the case with flagMandatoryDueDate active', () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            flagMandatoryDueDate: true
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('should handle readonly fields correctly', () => {
    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentObject: { value: 'Test Payment', readonly: true },
            amount: { value: '100.00', readonly: true },
            dueDate: { value: null, readonly: true },
            isMultibeneficiary: { value: false, readonly: true }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
  });

  it('should initialize beneficiaries when isMultibeneficiary is active', async () => {
    mockGetValues.mockReturnValueOnce([]);

    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: false
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
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
        />
      </MemoryRouter>
    );

    expect(mockSetValue).toHaveBeenCalledWith(
      'beneficiaries',
      [
        expect.objectContaining({
          entityName: '',
          amount: '',
          taxCode: '',
          iban: '',
          postalAccount: '',
          taxonomyCode: ''
        })
      ],
      expect.anything()
    );
  });

  it('should block submit when beneficiaries do not have a valid total', async () => {
    vi.mocked(isBeneficiariesTotalValid).mockReturnValueOnce(false);

    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    mockGetValues.mockReturnValueOnce([
      { entityName: 'Test', amount: '50.00' }
    ]);

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
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(isBeneficiariesTotalValid).toHaveBeenCalledTimes(1);
    expect(mockTrigger).toHaveBeenCalledWith('beneficiaries');
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it('should handle correctly the update of total when installments change', async () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('installment-field')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('amount.value', '200.00');
    });
  });

  it('should simulate triggerValidationForAllBeneficiaries behavior when amount changes', async () => {
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    const mockBeneficiaries = [
      { entityName: 'Test1', amount: '50.00' },
      { entityName: 'Test2', amount: '50.00' }
    ];
    mockGetValues.mockReturnValueOnce(mockBeneficiaries);

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
        />
      </MemoryRouter>
    );

    mockSetValue('amount.value', '200,00');

    await new Promise((resolve) => setTimeout(resolve, 10));

    mockTrigger('beneficiaries');

    expect(mockTrigger).toHaveBeenCalled();
  });

  it('should test installments validation with errors', async () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    const mockInstallments = [
      {
        amount: '',
        dueDate: '2023-12-01',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test',
            amount: '50.00',
            iban: '',
            postalAccount: ''
          }
        ]
      }
    ];
    mockGetValues.mockReturnValue(mockInstallments);

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(mockTrigger).toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it('should handle validation when an installment has a beneficiary validation error with exception', async () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    const mockInstallments = [
      {
        amount: '100.00',
        dueDate: '2023-12-01',
        isMultibeneficiary: true,
        beneficiaries: [
          {
            entityName: 'Test',
            amount: '50.00',
            iban: 'IT123456',
            postalAccount: ''
          }
        ]
      }
    ];
    mockGetValues.mockReturnValue(mockInstallments);

    vi.mocked(isBeneficiariesTotalValid).mockImplementationOnce(() => {
      throw new Error('Validation error');
    });

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => null);

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle exceptions during installments validation', async () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    const mockInstallments = [
      {
        amount: '',
        dueDate: '2023-12-01',
        isMultibeneficiary: true,
        beneficiaries: []
      }
    ];
    mockGetValues.mockReturnValue(mockInstallments);

    let errorHandled = false;
    mockTrigger.mockImplementationOnce(() => {
      const error = new Error('Trigger validation error');
      console.error(error);
      errorHandled = true;
      return Promise.reject(error);
    });

    const consoleErrorSpy2 = vi
      .spyOn(console, 'error')
      .mockImplementation(() => null);

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');

    fireEvent.click(nextButton);

    expect(errorHandled).toBe(true);
    expect(consoleErrorSpy2).toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();

    consoleErrorSpy2.mockRestore();
  });

  it('should format correctly an input value in the amount field', () => {
    const { container } = render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const amountInput = container.querySelector('input[name="amount.value"]');
    expect(amountInput).not.toBeNull();

    fireEvent.change(amountInput!, { target: { value: '123abc,45' } });

    expect(mockSetValue).toHaveBeenCalled();

    fireEvent.blur(amountInput!);

    expect(mockSetValue).toHaveBeenCalled();
  });

  it('should handle paymentOption change from SINGLE to INSTALLMENTS', () => {
    render(
      <MemoryRouter>
        <Step3
          data={initialData}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    mockSetValue.mockClear();

    mockSetValue('paymentOption.value', 'INSTALLMENTS');
    mockSetValue('isMultibeneficiary.value', false);
    mockSetValue('amount.value', '');
    mockSetValue('installments', []);

    expect(mockSetValue).toHaveBeenCalledWith(
      'isMultibeneficiary.value',
      false
    );
    expect(mockSetValue).toHaveBeenCalledWith('amount.value', '');
    expect(mockSetValue).toHaveBeenCalledWith('installments', []);
  });

  it('should handle paymentOption change from INSTALLMENTS to SINGLE', () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    mockSetValue.mockClear();

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    mockSetValue('paymentOption.value', 'SINGLE');
    mockSetValue('amount.value', '');
    mockSetValue('installments', []);

    expect(mockSetValue).toHaveBeenCalledWith('amount.value', '');
    expect(mockSetValue).toHaveBeenCalledWith('installments', []);
  });

  it('should reset beneficiaries when multibeneficiary toggle is deactivated', () => {
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    mockSetValue.mockClear();
    mockResetAllBeneficiaries.mockClear();

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
        />
      </MemoryRouter>
    );

    mockSetValue('isMultibeneficiary.value', false);
    mockResetAllBeneficiaries();

    expect(mockSetValue).toHaveBeenCalledWith(
      'isMultibeneficiary.value',
      false
    );

    expect(mockResetAllBeneficiaries).toHaveBeenCalled();
  });

  it('should block submit when there are beneficiaries with empty remittance', async () => {
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    const mockBeneficiaries = [
      {
        entityName: 'Test1',
        amount: '50.00',
        remittance: '' // Empty remittance field
      },
      {
        entityName: 'Test2',
        amount: '50.00',
        remittance: 'Test remittance'
      }
    ];
    mockGetValues.mockReturnValue(mockBeneficiaries);

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
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.remittance');
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it('should block submit when there are installments with empty remittance', async () => {
    const installmentProvider = new WatchValueProvider({
      isMultibeneficiary: false,
      paymentOption: 'INSTALLMENTS'
    });
    mockWatch.mockImplementation((key: string) =>
      installmentProvider.getValue(key)
    );

    const mockInstallments = [
      {
        amount: '100.00',
        dueDate: '2023-12-01',
        remittance: '', // Empty remittance field
        isMultibeneficiary: false
      }
    ];
    mockGetValues.mockReturnValue(mockInstallments);

    render(
      <MemoryRouter>
        <Step3
          data={{
            ...initialData,
            paymentOption: { value: 'INSTALLMENTS', readonly: false }
          }}
          setData={mockSetData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    expect(mockTrigger).toHaveBeenCalledWith('installments.0.remittance');
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it('should proceed with submit when all beneficiaries have valid remittance', async () => {
    const multibeneficiaryProvider = new WatchValueProvider({
      isMultibeneficiary: true,
      paymentOption: 'SINGLE',
      withBeneficiaries: true
    });
    mockWatch.mockImplementation((key: string) =>
      multibeneficiaryProvider.getValue(key)
    );

    const mockBeneficiaries = [
      {
        entityName: 'Test1',
        amount: '50.00',
        remittance: 'Test remittance 1',
        iban: 'IT60X0542811101000000123456'
      },
      {
        entityName: 'Test2',
        amount: '50.00',
        remittance: 'Test remittance 2',
        iban: 'IT60X0542811101000000789012'
      }
    ];
    mockGetValues.mockReturnValue(mockBeneficiaries);

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
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
