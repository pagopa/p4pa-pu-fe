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
          'Altri beneficiari',
        'debtPositionCreateWizard.step3.installments.sameBeneficiaries':
          'I beneficiari sono gli stessi della rata precedente?',
        'debtPositionCreateWizard.step3.beneficiary.sumMustBeLessThanTotal':
          "La somma degli importi dei beneficiari deve essere minore o uguale all'importo totale della rata"
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
  return {
    ...(actual as object),
    useWatch: vi
      .fn()
      .mockImplementation(({ name }: { name: string | Array<string> }) => {
        if (name === 'installments.0.amount') {
          return ['100,00'];
        }
        if (name === 'installments.1.amount') {
          return ['150,00'];
        }
        if (name === 'installments.0.isMultibeneficiary') {
          return [true];
        }
        if (name === 'installments.1.sameBeneficiariesAsBefore') {
          return [true];
        }
        if (name === 'installments.0.beneficiaries') {
          return [
            [
              {
                amount: '50,00',
                denomination: 'Beneficiario 1',
                postalgiro: '',
                iban: 'IT123456789'
              },
              {
                amount: '50,00',
                denomination: 'Beneficiario 2',
                postalgiro: '',
                iban: 'IT987654321'
              }
            ]
          ];
        }
        return [];
      }),
    Controller: vi
      .fn()
      .mockImplementation(
        ({
          render
        }: {
          render: (args: Record<string, unknown>) => React.ReactNode;
        }) => {
          return (
            <div data-testid="controller-mock">
              {render({
                field: {
                  value: false,
                  onChange: vi.fn(),
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
      )
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
      postalgiro: string;
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

    mockGetValues = createMockGetValues();
    mockSetValue = vi.fn();
    mockTrigger = vi.fn();
    mockToggleMultibeneficiary = vi.fn();
  });

  test('dovrebbe renderizzare lo switch per attivare/disattivare multi-beneficiario', () => {
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

    expect(screen.getByText('Altri beneficiari')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  test('dovrebbe mostrare il BeneficiaryField quando isMultibeneficiary è true e index è 0', () => {
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

  test('dovrebbe mostrare i radio button per le rate successive alla prima quando isMultibeneficiary è true', () => {
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
      screen.getByText('I beneficiari sono gli stessi della rata precedente?')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Sì')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  test('dovrebbe chiamare toggleMultibeneficiary quando si cambia lo stato dello switch', () => {
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

  test('dovrebbe chiamare setValue per copiare i beneficiari quando si seleziona "Sì" per una rata successiva', async () => {
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

    const radioSi = screen.getByLabelText('Sì');
    fireEvent.click(radioSi);

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

  test('dovrebbe copiare i beneficiari quando si seleziona radio "Si"', () => {
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

    const radioSi = screen.getByLabelText('Sì');
    fireEvent.click(radioSi);

    expect(mockSetValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      expect.any(Array),
      expect.objectContaining({ shouldDirty: true })
    );
  });

  test('dovrebbe gestire correttamente il componente disabilitato', () => {
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
});

const createMockGetValues = () => {
  const fn = vi.fn();

  type BeneficiaryType = {
    amount: string;
    denomination: string;
    postalgiro: string;
    iban: string;
  };

  const beneficiaryData: Array<BeneficiaryType> = [
    {
      amount: '50,00',
      denomination: 'Beneficiario 1',
      postalgiro: '',
      iban: 'IT123456789'
    },
    {
      amount: '50,00',
      denomination: 'Beneficiario 2',
      postalgiro: '',
      iban: 'IT987654321'
    }
  ];

  return fn.mockImplementation((path?: string | Array<string>): unknown => {
    if (path === undefined || Array.isArray(path)) {
      return {};
    }
    switch (path) {
      case 'installments.0.amount':
      case 'installments.1.amount':
        return path === 'installments.0.amount' ? '100,00' : '150,00';

      case 'installments.0.beneficiaries':
        return [...beneficiaryData];

      case 'installments.0':
        return {
          isMultibeneficiary: true,
          beneficiaries: [...beneficiaryData]
        };

      case 'installments.1.sameBeneficiariesAsBefore':
        return true;

      case 'installments.1.beneficiaries':
        return [];

      case 'installments.0.isMultibeneficiary':
        return true;

      case 'installments.0.sameBeneficiariesAsBefore':
        return false;

      default:
        if (path.includes('amount')) return '';
        if (path.includes('isMultibeneficiary')) return false;
        if (path.includes('sameBeneficiariesAsBefore')) return false;
        if (path.includes('beneficiaries')) return [];
        return '';
    }
  });
};
