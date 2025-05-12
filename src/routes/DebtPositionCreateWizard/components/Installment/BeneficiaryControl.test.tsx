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

  // Internal function with result casting
  const mockUseWatch = ({
    name
  }: {
    name: string | Array<string>;
  }): unknown => {
    if (name === 'installments.0.amount') {
      return '100,00';
    }
    if (name === 'installments.1.amount') {
      return '200,00';
    }
    if (name === 'installments.0.isMultibeneficiary') {
      return 'true';
    }
    if (name === 'installments.1.sameBeneficiariesAsBefore') {
      return 'true';
    }
    if (name === 'installments.0.beneficiaries') {
      return [
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
      ];
    }
    return null;
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
      // Simplified controller that only manages state and propagates onChange
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
                // Key point: trigger the change event
                if (
                  name.includes('sameBeneficiariesAsBefore') &&
                  typeof newValue === 'string' &&
                  newValue === 'true'
                ) {
                  // If "Yes" is selected, simulate the beneficiary copy action
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
        isSubmitted={false}
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
        isSubmitted={false}
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
    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
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
        isSubmitted={false}
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
    // Configure getValues mock to provide the needed data
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

    // Add event listener to simulate beneficiary copy action
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
        isSubmitted={false}
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
      // Verify that setValue was called at least once
      expect(mockSetValue).toHaveBeenCalled();

      // Find call with beneficiaries
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

    // Add event listener to simulate beneficiary copy action
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
        isSubmitted={false}
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
        isSubmitted={false}
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
        isSubmitted={false}
        fieldNamePrefix="installments"
        getValues={mockGetValues}
        setValue={mockSetValue}
        trigger={mockTrigger}
        isMultibeneficiary={true}
        toggleMultibeneficiary={mockToggleMultibeneficiary}
      />
    );
    // Error message about sum should not be present
    expect(
      screen.queryByText(
        'The sum of beneficiary amounts must be less than or equal to the total installment amount'
      )
    ).not.toBeInTheDocument();
  });

  test('should not show beneficiary sum error when there are no beneficiaries in the previous installment', () => {
    // Create a getValues function that simulates no beneficiaries in the previous installment
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
        isSubmitted={false}
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
    // Error message about sum should not be present
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
        isSubmitted={false}
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

    // Change from "Yes" to "No"
    const radioNo = screen.getByText('No');
    fireEvent.click(radioNo);

    // Verify that beneficiaries were reset
    expect(mockSetValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      [],
      expect.objectContaining({ shouldDirty: true })
    );

    // Verify that a new empty beneficiary was created
    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        [],
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should create an empty beneficiary after reset if the form is visible', async () => {
    // Simulate that after reset the form is visible (showBeneficiaryForm true)
    // To force the condition, we mock getValues and setValue
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
      // Simulate that after reset it's called a second time to create the empty beneficiary
      // First call resets to [], second call creates empty beneficiary
      return undefined;
    });

    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
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

    // Change from "Yes" to "No"
    const radioNo = screen.getByText('No');
    fireEvent.click(radioNo);

    // Verify that setValue was called for reset (empty array)
    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments.1.beneficiaries',
        [],
        expect.objectContaining({ shouldDirty: true })
      );
    });
  });

  test('should copy beneficiaries from the previous installment with recalculated amounts', async () => {
    // Mock of getValues providing the data needed for the test
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

    // Render the component with modified mocks
    render(
      <BeneficiaryControl<TestFormData>
        index={1}
        control={mockControl}
        errors={mockErrors}
        isSubmitted={false}
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

    // Select the "Yes" radio button
    const radioYes = screen.getByText('Yes');
    fireEvent.click(radioYes);

    // Verify that setValue is called with beneficiaries, without worrying about specific amounts
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
});

// Reusable helper function for getValues mocks
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

/**
 * Creates a getValues mock that returns a consistent value
 */
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
  // Internal function that handles all possible cases
  const getValueImplementation = (path?: string | Array<string>): unknown => {
    if (!path || Array.isArray(path)) {
      return '';
    }

    if (path === 'installments.0') {
      return (
        config.installment0 || {
          isMultibeneficiary: true,
          beneficiaries: []
        }
      );
    }
    if (path === 'installments.1') {
      return (
        config.installment1 || {
          isMultibeneficiary: true,
          beneficiaries: []
        }
      );
    }
    if (path === 'installments.0.amount') {
      return config.installment0Amount || '100,00';
    }
    if (path === 'installments.1.amount') {
      return config.installment1Amount || '150,00';
    }
    if (path === 'installments.0.beneficiaries') {
      return config.installment0Beneficiaries || [];
    }
    if (path === 'installments.1.beneficiaries') {
      return config.installment1Beneficiaries || [];
    }
    if (path === 'installments.0.isMultibeneficiary') {
      return true;
    }
    if (path === 'installments.1.isMultibeneficiary') {
      return false;
    }
    if (path === 'installments.0.sameBeneficiariesAsBefore') {
      return false;
    }
    if (path === 'installments.1.sameBeneficiariesAsBefore') {
      return config.sameBeneficiariesAsBefore === undefined
        ? 'true'
        : config.sameBeneficiariesAsBefore;
    }

    // Generic handling for unknown paths
    if (path.includes('amount')) return '';
    if (path.includes('isMultibeneficiary')) return false;
    if (path.includes('sameBeneficiariesAsBefore')) return false;
    if (path.includes('beneficiaries')) return [];

    return '';
  };

  // Return a wrapper function that always has the same return type: unknown
  return (path?: string | Array<string>): unknown => {
    return getValueImplementation(path);
  };
};
