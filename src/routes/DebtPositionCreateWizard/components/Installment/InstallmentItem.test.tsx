import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldArrayPath
} from 'react-hook-form';
import InstallmentItem, { ValidationFunctions } from './InstallmentItem';

// Mock per l'hook useInstallmentBeneficiaryManagement
const mockHandleInstallmentAmountChange = vi.fn();
const mockToggleMultibeneficiary = vi.fn();
vi.mock('../../../../hooks/useInstallmentBeneficiaryManagement', () => ({
  useInstallmentBeneficiaryManagement: () => ({
    isMultibeneficiary: false,
    toggleMultibeneficiary: mockToggleMultibeneficiary,
    handleInstallmentAmountChange: mockHandleInstallmentAmountChange
  })
}));

vi.mock('@mui/icons-material/RemoveCircleOutline', () => ({
  default: () => <span data-testid="RemoveCircleOutlineIcon" />
}));

// Mock per i componenti figli
vi.mock('./AmountField', () => ({
  default: vi.fn().mockImplementation(({ onAmountChange, index }) => (
    <div data-testid="amount-field">
      <button
        data-testid={`amount-change-trigger-${index}`}
        onClick={() => onAmountChange(100)}
      >
        Change amount
      </button>
    </div>
  ))
}));

vi.mock('./DateField', () => ({
  default: vi.fn().mockImplementation(({ index, flagMandatoryDueDate }) => (
    <div
      data-testid={`date-field-${index}`}
      data-mandatory={String(flagMandatoryDueDate)}
    >
      DateField Mock
    </div>
  ))
}));

// Mock per RemittanceField
vi.mock('./RemittanceField', () => ({
  default: vi.fn().mockImplementation(({ index, disabled }) => (
    <div
      data-testid={`remittance-field-${index}`}
      data-disabled={String(!!disabled)}
    >
      RemittanceField Mock
    </div>
  ))
}));

vi.mock('./BeneficiaryControl', () => ({
  default: vi.fn().mockImplementation(({ index, disabled }) => (
    <div
      data-testid={`beneficiary-control-${index}`}
      data-disabled={String(!!disabled)}
    >
      BeneficiaryControl Mock
    </div>
  ))
}));

// Mock per react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('InstallmentItem', () => {
  // Tipo per il form
  type TestFormValues = {
    installments: Array<{
      amount: number;
      dueDate: Date | null;
      remittance: string;
      beneficiaries: Array<{ id: string; amount: number }>;
    }>;
  };

  // Mock delle props
  const getMockProps = () => {
    const field = { id: 'test-id' } as FieldArrayWithId<
      TestFormValues,
      FieldArrayPath<TestFormValues>,
      'id'
    >;
    const control = {
      _subjects: {},
      _removeUnmounted: true,
      _names: { mount: new Set(), array: new Set(), unMount: new Set() },
      _state: {
        isDirty: false,
        dirtyFields: {},
        isSubmitted: false,
        submitCount: 0,
        touched: {},
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false
      },
      _formValues: {},
      _defaultValues: {},
      _options: {
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        shouldFocusError: true
      },
      _formState: {
        isDirty: false,
        dirtyFields: {},
        touchedFields: {},
        defaultValues: {},
        isSubmitted: false,
        submitCount: 0
      },
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      handleSubmit: vi.fn(),
      reset: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(),
      watch: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setFocus: vi.fn(),
      trigger: vi.fn()
    } as unknown as Control<TestFormValues>;

    const errors = {} as FieldErrors<TestFormValues>;
    const trigger = vi.fn() as UseFormTrigger<TestFormValues>;
    const getValues = vi.fn() as UseFormGetValues<TestFormValues>;
    const setValue = vi.fn() as UseFormSetValue<TestFormValues>;

    const validators: ValidationFunctions = {
      validateInstallmentAmount: vi.fn(),
      validateDueDate: vi.fn(),
      validateRemittance: vi.fn()
    };

    return {
      index: 0,
      field,
      control,
      errors,
      isSubmitted: false,
      validators,
      fieldNamePrefix: 'installments',
      trigger,
      getValues,
      setValue
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component correctly', () => {
    render(<InstallmentItem<TestFormValues> {...getMockProps()} />);

    // Verify that the main element is present
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.installments.installment 1'
      )
    ).toBeInTheDocument();

    // Verify that child components have been rendered
    expect(screen.getByTestId('amount-field')).toBeInTheDocument();
    expect(screen.getByTestId('date-field-0')).toBeInTheDocument();
    expect(screen.getByTestId('remittance-field-0')).toBeInTheDocument();
    expect(screen.getByTestId('beneficiary-control-0')).toBeInTheDocument();
  });

  it('should show the remove button when onRemove is provided', () => {
    const onRemoveMock = vi.fn();

    render(
      <InstallmentItem<TestFormValues>
        {...getMockProps()}
        onRemove={onRemoveMock}
      />
    );

    // Find the remove icon
    const removeIcon = screen.getByTestId('RemoveCircleOutlineIcon');
    expect(removeIcon).toBeInTheDocument();

    // Find the remove button (parent of the icon) and click
    const removeButton = removeIcon.closest('button');
    expect(removeButton).toBeInTheDocument();

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(onRemoveMock).toHaveBeenCalledWith(0);
    }
  });

  it('should not show the remove button when onRemove is not provided', () => {
    render(<InstallmentItem<TestFormValues> {...getMockProps()} />);

    const removeIcon = screen.getByTestId('RemoveCircleOutlineIcon');
    expect(removeIcon).toBeInTheDocument();

    const removeButton = removeIcon.closest('button');
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toBeDisabled();
  });

  it('should handle amount change', () => {
    render(<InstallmentItem<TestFormValues> {...getMockProps()} />);

    const amountChangeButton = screen.getByTestId('amount-change-trigger-0');
    fireEvent.click(amountChangeButton);

    // Verify that the mockHandleInstallmentAmountChange function was called
    expect(mockHandleInstallmentAmountChange).toHaveBeenCalled();
  });

  it('should apply the flagMandatoryDueDate flag correctly', () => {
    render(
      <InstallmentItem<TestFormValues>
        {...getMockProps()}
        flagMandatoryDueDate={false}
      />
    );

    // Verify that the date field contains the data-mandatory="false" attribute
    const dateField = screen.getByTestId('date-field-0');
    expect(dateField).toHaveAttribute('data-mandatory', 'false');
  });

  it('should handle disabled state correctly', () => {
    render(
      <InstallmentItem<TestFormValues> {...getMockProps()} disabled={true} />
    );

    // Verify that child components are disabled
    const beneficiaryControl = screen.getByTestId('beneficiary-control-0');
    expect(beneficiaryControl).toHaveAttribute('data-disabled', 'true');

    const remittanceField = screen.getByTestId('remittance-field-0');
    expect(remittanceField).toHaveAttribute('data-disabled', 'true');
  });
});
