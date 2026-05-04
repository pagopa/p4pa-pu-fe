import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useForm,
  FormProvider,
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger
} from 'react-hook-form';
import BeneficiaryField from './BeneficiaryField';
import * as beneficiaryManagementHooks from '../../../../hooks/useBeneficiaryManagement';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('./BeneficiaryFieldComponents', () => ({
  BeneficiaryHeader: ({
    index,
    t,
    onRemove
  }: {
    index: number;
    t: (key: string) => string;
    onRemove: (index: number) => void;
  }) => (
    <div data-testid={`beneficiary-header-${index}`}>
      <span>{t('debtPositionCreateWizard.step3.beneficiary.title')}</span>
      <button
        onClick={() => onRemove(index)}
        data-testid={`remove-beneficiary-${index}`}
      >
        {t('commons.delete')}
      </button>
    </div>
  ),
  EntityNameField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="entity-name-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`entity-name-input-${field.name}`}
      />
    </div>
  ),
  TaxCodeField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="tax-code-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`tax-code-input-${field.name}`}
      />
    </div>
  ),
  AmountField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="amount-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`amount-input-${field.name}`}
      />
    </div>
  ),
  IBANField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="iban-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`iban-input-${field.name}`}
      />
    </div>
  ),
  PostalAccountField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="postal-account-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`postal-account-input-${field.name}`}
      />
    </div>
  ),
  TaxonomyCodeField: ({
    field,
    disabled
  }: {
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t?: (key: string) => string;
    disabled?: boolean;
    context: Record<string, unknown>;
  }) => (
    <div data-testid="taxonomy-code-field">
      <input
        {...field}
        disabled={disabled}
        data-testid={`taxonomy-code-input-${field.name}`}
      />
    </div>
  )
}));

vi.mock('./BeneficiaryFieldControls', () => ({
  BeneficiaryIdentityFields: ({
    index,
    disabled
  }: {
    index: number;
    disabled: boolean;
  }) => (
    <div data-testid={`identity-fields-${index}`} data-disabled={disabled} />
  ),
  BeneficiaryAmountFields: ({
    index,
    disabled
  }: {
    index: number;
    disabled: boolean;
  }) => <div data-testid={`amount-fields-${index}`} data-disabled={disabled} />,
  BeneficiaryPaymentFields: ({
    index,
    disabled
  }: {
    index: number;
    disabled: boolean;
  }) => (
    <div data-testid={`payment-fields-${index}`} data-disabled={disabled} />
  ),
  BeneficiaryClassificationFields: ({
    index,
    disabled
  }: {
    index: number;
    disabled: boolean;
  }) => (
    <div
      data-testid={`classification-fields-${index}`}
      data-disabled={disabled}
    />
  )
}));

vi.mock('../../../../hooks/useBeneficiaryManagement', () => ({
  __esModule: true,
  useBeneficiaryManagement: vi.fn()
}));

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn().mockImplementation(() => ({
      control: {
        _formValues: {},
        _fields: {},
        _names: {
          array: new Set(),
          mount: new Set(),
          unMount: new Set(),
          watch: new Set(),
          focus: '',
          watchAll: false
        },
        _getWatch: vi.fn().mockReturnValue({}),
        _subjects: {
          watch: { next: vi.fn() },
          array: { next: vi.fn() },
          state: { next: vi.fn() }
        },
        register: vi.fn(),
        unregister: vi.fn(),
        getFieldState: vi.fn(),
        _updateValid: vi.fn(),
        _removeUnmounted: vi.fn(),
        _getDirty: vi.fn(),
        _updateFieldArray: vi.fn()
      },
      formState: { errors: {}, isDirty: false, isSubmitted: false },
      setValue: vi.fn(),
      getValues: vi.fn().mockReturnValue({}),
      trigger: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockReturnValue({}),
      handleSubmit: vi.fn(),
      watch: vi.fn(),
      reset: vi.fn(),
      clearErrors: vi.fn(),
      unregister: vi.fn(),
      setError: vi.fn()
    }))
  };
});

type TestFormValues = {
  beneficiaries: Array<{
    entityName: string;
    amount: string;
    taxCode: string;
    iban: string;
    postalAccount: string;
    taxonomyCode: string;
    id: string;
  }>;
};

type TestComponentProps = {
  isSubmitted?: boolean;
  disabled?: boolean;
};

describe('BeneficiaryField', () => {
  const mockAddBeneficiary = vi.fn();
  const mockRemoveBeneficiary = vi.fn();
  const mockOnToggleMultibeneficiary = vi.fn();
  const mockOnBeneficiariesChange = vi.fn();

  const mockFields = [{ id: 'beneficiary-1' }, { id: 'beneficiary-2' }];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(
      beneficiaryManagementHooks,
      'useBeneficiaryManagement'
    ).mockReturnValue({
      fields: mockFields,
      validators: {
        validateTotalAmount: vi.fn(),
        isValidTotalAmount: vi.fn().mockReturnValue(true),
        isSingleBeneficiaryAmountValid: vi.fn().mockReturnValue(true),
        validateSingleBeneficiary: vi.fn(),
        isBeneficiaryAmountValid: vi.fn().mockReturnValue(true)
      },
      fieldValidators: {
        validateBeneficiaryTaxCode: vi.fn(),
        validateIBAN: vi.fn(),
        validatePostalAccount: vi.fn(),
        validatePaymentMethod: vi.fn()
      },
      MAX_BENEFICIARIES: 4,
      existingBeneficiaries: {},
      wasSubmittedRef: { current: false },
      isInitializingRef: { current: false },
      updateAmountValidations: vi.fn(),
      addBeneficiary: mockAddBeneficiary,
      removeBeneficiary: mockRemoveBeneficiary,
      resetAllBeneficiaries: vi.fn(),
      getBeneficiaryPath: vi
        .fn()
        .mockImplementation((index, field) =>
          field ? `beneficiaries.${index}.${field}` : `beneficiaries.${index}`
        )
    });
  });

  const TestComponent = ({
    isSubmitted = false,
    disabled = false
  }: TestComponentProps) => {
    const methods = useForm<TestFormValues>();

    return (
      <FormProvider {...methods}>
        <BeneficiaryField
          control={methods.control}
          isSubmitted={isSubmitted}
          errors={methods.formState.errors}
          totalAmount="100.00"
          fieldNamePrefix="beneficiaries"
          disabled={disabled}
          setValue={methods.setValue}
          getValues={methods.getValues}
          trigger={methods.trigger}
          onToggleMultibeneficiary={mockOnToggleMultibeneficiary}
          onBeneficiariesChange={mockOnBeneficiariesChange}
        />
      </FormProvider>
    );
  };

  it('should render the beneficiaries correctly', () => {
    render(<TestComponent />);

    mockFields.forEach((_, index) => {
      expect(
        screen.getByTestId(`beneficiary-header-${index}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`identity-fields-${index}`)
      ).toBeInTheDocument();
      expect(screen.getByTestId(`amount-fields-${index}`)).toBeInTheDocument();
      expect(screen.getByTestId(`payment-fields-${index}`)).toBeInTheDocument();
      expect(
        screen.getByTestId(`classification-fields-${index}`)
      ).toBeInTheDocument();
    });
  });

  it('should remove a beneficiary', async () => {
    render(<TestComponent />);

    const removeButton = screen.getByTestId('remove-beneficiary-0');
    fireEvent.click(removeButton);

    expect(mockRemoveBeneficiary).toHaveBeenCalledWith(0);
  });

  it('should show the "add beneficiary" button only on the last beneficiary', () => {
    render(<TestComponent />);

    const addButtons = screen.getAllByText(
      'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
    );
    expect(addButtons).toHaveLength(1);

    fireEvent.click(addButtons[0]);
    expect(mockAddBeneficiary).toHaveBeenCalled();
  });

  it('should not show the "add beneficiary" button if the maximum number of beneficiaries is reached', () => {
    vi.spyOn(
      beneficiaryManagementHooks,
      'useBeneficiaryManagement'
    ).mockReturnValue({
      fields: [
        { id: 'beneficiary-1' },
        { id: 'beneficiary-2' },
        { id: 'beneficiary-3' },
        { id: 'beneficiary-4' }
      ],
      validators: {
        validateTotalAmount: vi.fn(),
        isValidTotalAmount: vi.fn().mockReturnValue(true),
        isSingleBeneficiaryAmountValid: vi.fn().mockReturnValue(true),
        validateSingleBeneficiary: vi.fn(),
        isBeneficiaryAmountValid: vi.fn().mockReturnValue(true)
      },
      fieldValidators: {
        validateBeneficiaryTaxCode: vi.fn(),
        validateIBAN: vi.fn(),
        validatePostalAccount: vi.fn(),
        validatePaymentMethod: vi.fn()
      },
      MAX_BENEFICIARIES: 4,
      existingBeneficiaries: {},
      wasSubmittedRef: { current: false },
      isInitializingRef: { current: false },
      updateAmountValidations: vi.fn(),
      addBeneficiary: mockAddBeneficiary,
      removeBeneficiary: mockRemoveBeneficiary,
      resetAllBeneficiaries: vi.fn(),
      getBeneficiaryPath: vi
        .fn()
        .mockImplementation((index, field) =>
          field ? `beneficiaries.${index}.${field}` : `beneficiaries.${index}`
        )
    });

    render(<TestComponent />);

    expect(
      screen.queryAllByText(
        'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
      )
    ).toHaveLength(0);
  });

  it('should handle the disabled state correctly', () => {
    render(<TestComponent disabled={true} />);

    mockFields.forEach((_, index) => {
      const identityField = screen.getByTestId(`identity-fields-${index}`);
      const amountField = screen.getByTestId(`amount-fields-${index}`);
      const paymentField = screen.getByTestId(`payment-fields-${index}`);
      const classificationField = screen.getByTestId(
        `classification-fields-${index}`
      );

      expect(identityField).toHaveAttribute('data-disabled', 'true');
      expect(amountField).toHaveAttribute('data-disabled', 'true');
      expect(paymentField).toHaveAttribute('data-disabled', 'true');
      expect(classificationField).toHaveAttribute('data-disabled', 'true');
    });
  });

  it("passa correttamente i parametri all'hook useBeneficiaryManagement", () => {
    const totalAmount = '200.00';
    const fieldNamePrefix = 'beneficiaries';
    const hasClickedFinalCTA = true;

    const mockControl = {
      _formValues: {},
      _fields: {},
      _names: {
        array: new Set(),
        mount: new Set(),
        unMount: new Set(),
        watch: new Set(),
        focus: '',
        watchAll: false
      },
      _getWatch: vi.fn().mockReturnValue({}),
      _subjects: {
        watch: { next: vi.fn() },
        array: { next: vi.fn() },
        state: { next: vi.fn() }
      },
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      _updateValid: vi.fn(),
      _removeUnmounted: vi.fn(),
      _getDirty: vi.fn(),
      _updateFieldArray: vi.fn()
    } as unknown as Control<TestFormValues>;

    const mockErrors = {} as FieldErrors<TestFormValues>;
    const mockSetValue = vi.fn() as unknown as UseFormSetValue<TestFormValues>;
    const mockGetValues = vi
      .fn()
      .mockReturnValue({}) as unknown as UseFormGetValues<TestFormValues>;
    const mockTrigger = vi
      .fn()
      .mockResolvedValue(true) as unknown as UseFormTrigger<TestFormValues>;

    render(
      <BeneficiaryField
        control={mockControl}
        isSubmitted={false}
        errors={mockErrors}
        totalAmount={totalAmount}
        fieldNamePrefix={fieldNamePrefix}
        disabled={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        onToggleMultibeneficiary={mockOnToggleMultibeneficiary}
        onBeneficiariesChange={mockOnBeneficiariesChange}
        shouldShowErrors={() => hasClickedFinalCTA}
      />
    );

    expect(
      beneficiaryManagementHooks.useBeneficiaryManagement
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        control: mockControl,
        isSubmitted: hasClickedFinalCTA,
        totalAmount,
        fieldNamePrefix,
        trigger: mockTrigger,
        getValues: mockGetValues,
        onToggleMultibeneficiary: mockOnToggleMultibeneficiary,
        onBeneficiariesChange: mockOnBeneficiariesChange
      })
    );
  });
});
