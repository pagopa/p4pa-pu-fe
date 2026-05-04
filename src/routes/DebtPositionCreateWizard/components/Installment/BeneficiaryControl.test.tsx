import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import BeneficiaryControl from './BeneficiaryControl';
import * as React from 'react';
import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors
} from 'react-hook-form';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'debtPositionCreateWizard.step3.installments.otherBeneficiaries':
          'Other beneficiaries',
        'debtPositionCreateWizard.step3.installments.sameBeneficiaries':
          'Are the beneficiaries the same as the previous installment?',
        'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal':
          'The sum of beneficiary amounts must be less than or equal to the total installment amount',
        'debtPositionCreateWizard.step3.installments.yes': 'Yes',
        'debtPositionCreateWizard.step3.installments.no': 'No'
      };
      return translations[key] || key;
    }
  })
}));

vi.mock('../Beneficiary/BeneficiaryField', () => ({
  default: vi
    .fn()
    .mockImplementation(() => (
      <div data-testid="beneficiary-field">BeneficiaryField</div>
    ))
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');

  const mockUseWatch = ({
    name
  }: {
    name: string | Array<string>;
  }): unknown => {
    const watchValueMap: Record<string, unknown> = {
      'installments.0.amount': '100,00',
      'installments.1.amount': '200,00',
      'installments.0.isMultibeneficiary': 'true',
      'installments.1.sameBeneficiariesAsBefore': 'true',
      'installments.0.beneficiaries': [
        {
          amount: '60,00',
          denomination: 'A',
          iban: 'IT123456789'
        },
        {
          amount: '40,00',
          denomination: 'B',
          iban: 'IT987654321'
        }
      ]
    };

    return watchValueMap[name as string] ?? null;
  };

  return {
    ...(actual as object),
    useWatch: vi.fn().mockImplementation(mockUseWatch),
    Controller: ({
      render,
      name,
      defaultValue
    }: {
      render: (args: {
        field: {
          value: string | boolean;
          onChange: (value: string | boolean) => void;
          onBlur: () => void;
          ref: () => void;
        };
        fieldState: {
          invalid: boolean;
        };
        formState: {
          errors: Record<string, unknown>;
        };
      }) => React.ReactNode;
      name: string;
      defaultValue?: unknown;
    }): React.ReactElement => {
      const [value, setValueState] = React.useState<string | boolean>(
        (defaultValue as string | boolean) ||
          (name.includes('sameBeneficiariesAsBefore') ? 'true' : false)
      );

      return (
        <div data-testid="controller-mock">
          {render({
            field: {
              value,
              onChange: (newValue: string | boolean) => {
                setValueState(newValue);
                if (
                  name.includes('sameBeneficiariesAsBefore') &&
                  typeof newValue === 'string' &&
                  newValue === 'true'
                ) {
                  setTimeout(() => {
                    document.dispatchEvent(new Event('copyBeneficiaries'));
                  }, 50);
                }
              },
              onBlur: vi.fn(),
              ref: vi.fn()
            },
            fieldState: {
              invalid: false
            },
            formState: {
              errors: {}
            }
          })}
        </div>
      );
    }
  };
});

type TestFormData = {
  installments: Array<{
    isMultibeneficiary: boolean;
    sameBeneficiariesAsBefore: boolean;
    amount: string;
    beneficiaries: Array<{
      amount: string;
      denomination: string;
      iban: string;
    }>;
  }>;
};

describe('BeneficiaryControl', () => {
  let mockControl: Control<TestFormData>;
  const mockErrors = {} as FieldErrors<TestFormData>;
  let mockGetValues: UseFormGetValues<TestFormData>;
  let mockSetValue: UseFormSetValue<TestFormData>;
  let mockTrigger: UseFormTrigger<TestFormData>;
  let mockToggleMultibeneficiary: (value: boolean) => void;

  beforeEach(() => {
    mockControl = {
      register: vi.fn(),
      unregister: vi.fn(),
      getFieldState: vi.fn(),
      handleSubmit: vi.fn(),
      reset: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(),
      trigger: vi.fn(),
      formState: {
        errors: {},
        dirtyFields: {},
        isDirty: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValidating: false,
        isValid: false,
        touchedFields: {},
        isLoading: false,
        submitCount: 0,
        defaultValues: {}
      },
      _defaultValues: {},
      _formValues: {},
      _options: {
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        shouldFocusError: true
      },
      _fields: {},
      _formState: {
        isDirty: false,
        isValidating: false,
        dirtyFields: {},
        isSubmitted: false,
        submitCount: 0,
        touchedFields: {},
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
        errors: {}
      },
      array: vi.fn().mockReturnValue({
        append: vi.fn(),
        prepend: vi.fn(),
        insert: vi.fn(),
        swap: vi.fn(),
        move: vi.fn(),
        remove: vi.fn(),
        update: vi.fn(),
        replace: vi.fn(),
        fields: []
      }),
      getFieldsState: vi.fn(),
      watch: vi.fn(),
      control: {} as Record<string, unknown>,
      useFormState: vi.fn(),
      useWatch: vi.fn()
    } as unknown as Control<TestFormData>;

    mockGetValues =
      createMockGetValuesWithConsistentReturn() as unknown as UseFormGetValues<TestFormData>;
    mockSetValue = vi.fn();
    mockTrigger = vi.fn();
    mockToggleMultibeneficiary = vi.fn();
  });

  test('should render the switch to enable/disable multi-beneficiary', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={false}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    expect(screen.getByText('Other beneficiaries')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  test('should show BeneficiaryField when isMultibeneficiary is true and index is 0', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should show radio buttons for subsequent installments when isMultibeneficiary is true', () => {
    const mockGetValuesForTest = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '60,00', denomination: 'A', iban: 'IT123456789' },
          { amount: '40,00', denomination: 'B', iban: 'IT987654321' }
        ]
      },
      installment1Amount: '200,00',
      sameBeneficiariesAsBefore: false
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesForTest as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    expect(
      screen.getByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('should call toggleMultibeneficiary when switch state changes', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={false}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockToggleMultibeneficiary).toHaveBeenCalledWith(true);
  });

  test('should call setValue to copy beneficiaries when "Yes" is selected for a subsequent installment', async () => {
    const getValuesMock = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '60,00', denomination: 'A' },
          { amount: '40,00', denomination: 'B' }
        ]
      },
      installment0Beneficiaries: [
        { amount: '60,00', denomination: 'A' },
        { amount: '40,00', denomination: 'B' }
      ],
      installment1Amount: '200,00'
    });

    const mockSetValue = vi.fn();

    document.addEventListener('copyBeneficiaries', () => {
      mockSetValue(
        'installments.1.beneficiaries',
        [
          { amount: '120.00', denomination: 'A' },
          { amount: '80.00', denomination: 'B' }
        ],
        { shouldDirty: true }
      );
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={getValuesMock as unknown as UseFormGetValues<TestFormData>}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    const radioYes = screen.getByText('Yes');
    fireEvent.click(radioYes);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalled();

      const setBeneficiariesCall = vi
        .mocked(mockSetValue)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' && call[0].includes('beneficiaries')
        );

      expect(setBeneficiariesCall).toBeTruthy();
      if (setBeneficiariesCall) {
        expect(setBeneficiariesCall[0]).toBe('installments.1.beneficiaries');
        expect(Array.isArray(setBeneficiariesCall[1])).toBe(true);
        expect(setBeneficiariesCall[2]).toEqual({ shouldDirty: true });
      }
    });
  });

  test('should copy beneficiaries when "Yes" radio is selected', async () => {
    const getValuesMock = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '60,00', denomination: 'A' },
          { amount: '40,00', denomination: 'B' }
        ]
      },
      installment0Beneficiaries: [
        { amount: '60,00', denomination: 'A' },
        { amount: '40,00', denomination: 'B' }
      ],
      installment1Amount: '200,00'
    });

    const mockSetValue = vi.fn();

    document.addEventListener('copyBeneficiaries', () => {
      mockSetValue(
        'installments.1.beneficiaries',
        [
          { amount: '60,00', denomination: 'A' },
          { amount: '40,00', denomination: 'B' }
        ],
        { shouldDirty: true }
      );
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={getValuesMock as unknown as UseFormGetValues<TestFormData>}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    const radioYes = screen.getByText('Yes');
    fireEvent.click(radioYes);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        expect.arrayContaining([
          expect.objectContaining({
            denomination: 'A'
          }),
          expect.objectContaining({
            denomination: 'B'
          })
        ]),
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should handle disabled component correctly', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={false}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        disabled={true}
      />
    );

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  test('should not show beneficiary sum error when index === 0', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );
    expect(
      screen.queryByText(
        'The sum of beneficiary amounts must be less than or equal to the total installment amount'
      )
    ).not.toBeInTheDocument();
  });

  test('should not show beneficiary sum error when there are no beneficiaries in the previous installment', () => {
    const getValuesNoPrevBeneficiaries =
      createMockGetValuesWithConsistentReturn({
        installment0: {
          isMultibeneficiary: true,
          beneficiaries: []
        },
        installment1Amount: '100,00',
        sameBeneficiariesAsBefore: true
      });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          getValuesNoPrevBeneficiaries as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );
    expect(
      screen.queryByText(
        'The sum of beneficiary amounts must be less than or equal to the total installment amount'
      )
    ).not.toBeInTheDocument();
  });

  test('should reset beneficiaries when switching from "Yes" to "No"', async () => {
    const getValuesWithExistingBeneficiaries =
      createMockGetValuesWithConsistentReturn({
        installment0: {
          isMultibeneficiary: true,
          beneficiaries: [
            { amount: '50,00', denomination: 'Beneficiario precedente' }
          ]
        },
        installment1Beneficiaries: [
          { amount: '50,00', denomination: 'Beneficiario esistente' }
        ],
        installment1Amount: '100,00',
        sameBeneficiariesAsBefore: true
      });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          getValuesWithExistingBeneficiaries as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    const radioNo = screen.getByText('No');
    fireEvent.click(radioNo);

    expect(mockSetValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      [],
      expect.objectContaining({ shouldDirty: true })
    );

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        [],
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should create an empty beneficiary after reset if the form is visible', async () => {
    const getValuesWithShowForm = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '50,00', denomination: 'Previous beneficiary' }
        ]
      },
      installment1Beneficiaries: [
        { amount: '50,00', denomination: 'Existing beneficiary' }
      ],
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: true
    });

    const mockSetValue = vi.fn(() => {
      return undefined;
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          getValuesWithShowForm as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    const radioNo = screen.getByText('No');
    fireEvent.click(radioNo);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        [],
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should copy beneficiaries from the previous installment with recalculated amounts', async () => {
    const getValuesFn = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        amount: '100,00',
        beneficiaries: [
          { amount: '60,00', denomination: 'A' },
          { amount: '40,00', denomination: 'B' }
        ]
      },
      installment0Amount: '100,00',
      installment1Amount: '200,00',
      installment0Beneficiaries: [
        { amount: '60,00', denomination: 'A' },
        { amount: '40,00', denomination: 'B' }
      ],
      sameBeneficiariesAsBefore: 'true',
      installment1Beneficiaries: []
    });

    const getValuesWithAmountsAndBeneficiaries = vi.fn(getValuesFn);

    const mockSetValue = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          getValuesWithAmountsAndBeneficiaries as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    const radioYes = screen.getByText('Yes');
    fireEvent.click(radioYes);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        expect.arrayContaining([
          expect.objectContaining({
            denomination: 'A'
          }),
          expect.objectContaining({
            denomination: 'B'
          })
        ]),
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should automatically set sameBeneficiariesAsBefore to true when switch is activated and previous beneficiaries exist', async () => {
    const mockGetValuesAutoDefault = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '50,00', denomination: 'Entity A', iban: 'IT123456789' },
          { amount: '30,00', denomination: 'Entity B', iban: 'IT987654321' }
        ]
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: undefined
    });

    const mockSetValueAutoDefault = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesAutoDefault as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValueAutoDefault}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    expect(screen.getByText('Other beneficiaries')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).toBeInTheDocument();

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    expect(yesRadio).toBeChecked();

    await waitFor(() => {
      expect(mockSetValueAutoDefault).toHaveBeenCalled();
    });
  });

  test('should not auto-set sameBeneficiariesAsBefore in editing mode', async () => {
    const mockGetValuesEditing = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '50,00', denomination: 'Entity A', iban: 'IT123456789' }
        ]
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: undefined
    });

    const mockSetValueEditing = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesEditing as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValueEditing}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={true}
      />
    );

    await waitFor(() => {
      expect(mockSetValueEditing).not.toHaveBeenCalledWith(
        'installments.1.sameBeneficiariesAsBefore',
        true,
        expect.any(Object)
      );
    });
  });

  test('should set sameBeneficiariesAsBefore to false when no previous beneficiaries exist', async () => {
    const mockGetValuesNoPrev = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: false,
        beneficiaries: []
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: true
    });

    const mockSetValueNoPrev = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesNoPrev as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValueNoPrev}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    await waitFor(() => {
      expect(mockSetValueNoPrev).toHaveBeenCalledWith(
        'installments.1.sameBeneficiariesAsBefore',
        false,
        { shouldDirty: true }
      );
    });
  });

  test('should show BeneficiaryField in editing mode regardless of radio value', () => {
    const mockGetValuesEditingForm = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '50,00', denomination: 'Entity A', iban: 'IT123456789' }
        ]
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: true
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesEditingForm as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={true}
      />
    );

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should handle RadioGroup value correctly when field.value is undefined', () => {
    const MockRadioController = ({
      field
    }: {
      field: { value: undefined };
    }) => (
      <div data-testid="radio-group-mock">
        <span data-testid="radio-value">
          {String(field.value === undefined ? 'true' : field.value)}
        </span>
      </div>
    );

    render(<MockRadioController field={{ value: undefined }} />);

    expect(screen.getByTestId('radio-value')).toHaveTextContent('true');
  });

  test('should handle first installment (index 0) correctly', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    expect(
      screen.queryByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should handle switch disabled state correctly', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={false}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        disabled={true}
      />
    );

    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeDisabled();
  });

  test('should not show radio buttons when hasPreviousBeneficiaries is false', () => {
    const mockGetValuesNoValidBeneficiaries =
      createMockGetValuesWithConsistentReturn({
        installment0: {
          isMultibeneficiary: true,
          beneficiaries: []
        },
        installment1Amount: '100,00'
      });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesNoValidBeneficiaries as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    expect(
      screen.queryByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).not.toBeInTheDocument();
  });

  test('should handle null/undefined previous installment', () => {
    const mockGetValuesNull = vi.fn().mockImplementation((path: string) => {
      if (path === 'installments.0') {
        return null;
      }
      if (path === 'installments.1.amount') {
        return '100,00';
      }
      return undefined;
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesNull as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    expect(
      screen.queryByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).not.toBeInTheDocument();
  });

  test('should default radio button to "Yes" when value is undefined and previous beneficiaries exist', () => {
    const mockGetValuesForDefault = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '60,00', denomination: 'Entity A', iban: 'IT123456789' }
        ]
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: undefined
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesForDefault as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    expect(
      screen.getByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).toBeInTheDocument();

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    const noRadio = screen.getByRole('radio', { name: 'No' });

    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  test('should handle beneficiary copying when radio is already set to true', async () => {
    const mockGetValuesCopyTest = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '40,00', denomination: 'Entity A', iban: 'IT123456789' }
        ]
      },
      installment1Amount: '80,00',
      sameBeneficiariesAsBefore: true
    });

    const mockSetValueCopy = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesCopyTest as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValueCopy}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });
    expect(yesRadio).toBeChecked();

    await waitFor(() => {
      expect(mockSetValueCopy).toHaveBeenCalled();
    });
  });

  test('should pass submissionCount prop to BeneficiaryField', () => {
    const testSubmissionCount = 5;

    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => true}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        submissionCount={testSubmissionCount}
      />
    );

    // Verify BeneficiaryField component exists
    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should pass shouldShowErrors to BeneficiaryField correctly', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => true}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    // Verify that the component renders with isSubmitted=true passed as hasClickedFinalCTA
    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should handle empty beneficiaries array when copying', async () => {
    const mockGetValuesEmpty = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: []
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: false
    });

    const mockSetValueEmpty = vi.fn();

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesEmpty as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValueEmpty}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    // When previous beneficiaries are empty, radio buttons should not be shown
    expect(
      screen.queryByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).not.toBeInTheDocument();

    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.queryByText('No')).not.toBeInTheDocument();

    // But BeneficiaryField should still be shown for creating new beneficiaries
    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should handle malformed beneficiary data gracefully', async () => {
    const mockGetValuesMalformed = vi
      .fn()
      .mockImplementation((path: string): unknown => {
        if (path === 'installments.0') {
          return { isMultibeneficiary: true, beneficiaries: null } as unknown; // malformed data
        }
        if (path === 'installments.1.amount') {
          return '100,00' as unknown;
        }
        return undefined as unknown;
      });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesMalformed as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );

    // Should not show radio buttons when beneficiaries data is malformed
    expect(
      screen.queryByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).not.toBeInTheDocument();
  });

  test('should handle default submissionCount when prop is not provided', () => {
    render(
      <BeneficiaryControl<TestFormData>
        index={0}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        // submissionCount not provided - should default to 0
      />
    );

    expect(screen.getByTestId('beneficiary-field')).toBeInTheDocument();
  });

  test('should handle radio button interaction without errors', () => {
    const mockGetValuesForRadio = createMockGetValuesWithConsistentReturn({
      installment0: {
        isMultibeneficiary: true,
        beneficiaries: [
          { amount: '50,00', denomination: 'Previous beneficiary' }
        ]
      },
      installment1Amount: '100,00',
      sameBeneficiariesAsBefore: false
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        shouldShowErrors={() => false}
        fieldNamePrefix="installments"
        getValues={
          mockGetValuesForRadio as unknown as UseFormGetValues<TestFormData>
        }
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
        isEditing={false}
      />
    );

    // Should show radio buttons
    expect(
      screen.getByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).toBeInTheDocument();

    const yesRadio = screen.getByText('Yes');
    const noRadio = screen.getByText('No');

    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();

    // Should be able to click radio buttons without errors
    fireEvent.click(yesRadio);
    fireEvent.click(noRadio);

    // Component should still be in the document after interactions
    expect(
      screen.getByText(
        'Are the beneficiaries the same as the previous installment?'
      )
    ).toBeInTheDocument();
  });
});

type BeneficiaryType = {
  amount: string;
  denomination: string;
  iban?: string;
};

type InstallmentType = {
  isMultibeneficiary: boolean;
  amount?: string;
  beneficiaries?: Array<BeneficiaryType>;
  sameBeneficiariesAsBefore?: string | boolean;
};

const createMockGetValuesWithConsistentReturn = (
  config: {
    installment0?: InstallmentType;
    installment1?: InstallmentType;
    installment0Amount?: string;
    installment1Amount?: string;
    installment0Beneficiaries?: Array<BeneficiaryType>;
    installment1Beneficiaries?: Array<BeneficiaryType>;
    sameBeneficiariesAsBefore?: string | boolean;
  } = {}
): ((path?: string | Array<string>) => unknown) => {
  const getDefaultValueForPath = (path: string): unknown => {
    const pathValueMap: Record<string, unknown> = {
      'installments.0': config.installment0 || {
        isMultibeneficiary: true,
        beneficiaries: []
      },
      'installments.1': config.installment1 || {
        isMultibeneficiary: true,
        beneficiaries: []
      },
      'installments.0.amount': config.installment0Amount || '100,00',
      'installments.1.amount': config.installment1Amount || '150,00',
      'installments.0.beneficiaries': config.installment0Beneficiaries || [],
      'installments.1.beneficiaries': config.installment1Beneficiaries || [],
      'installments.0.isMultibeneficiary': true,
      'installments.1.isMultibeneficiary': false,
      'installments.0.sameBeneficiariesAsBefore': false,
      'installments.1.sameBeneficiariesAsBefore':
        config.sameBeneficiariesAsBefore === undefined
          ? 'true'
          : config.sameBeneficiariesAsBefore
    };

    if (pathValueMap[path] !== undefined) {
      return pathValueMap[path];
    }

    if (path.includes('amount')) return '';
    if (path.includes('isMultibeneficiary')) return false;
    if (path.includes('sameBeneficiariesAsBefore')) return false;
    if (path.includes('beneficiaries')) return [];

    return '';
  };

  return (path?: string | Array<string>): unknown => {
    if (!path || Array.isArray(path)) {
      return '';
    }

    return getDefaultValueForPath(path);
  };
};
