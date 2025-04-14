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
import { useBeneficiaryManagement } from '../../../../hooks/useBeneficiaryManagement';

// Mock delle dipendenze
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
  )
}));

// Mock dei componenti del gruppo di campi con props per testare disabled
vi.mock('./BeneficiaryFieldGroup', () => ({
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

vi.mock('../../../hooks/useBeneficiaryManagement', () => ({
  useBeneficiaryManagement: vi.fn()
}));

// Mock di react-hook-form useForm
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn().mockImplementation(() => ({
      control: { _formValues: {} },
      formState: { errors: {} },
      setValue: vi.fn(),
      getValues: vi.fn(),
      trigger: vi.fn(),
      register: vi.fn(),
      handleSubmit: vi.fn()
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

// Definizione del tipo per le props del TestComponent
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

    // Setup del mock per useBeneficiaryManagement
    (
      useBeneficiaryManagement as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      fields: mockFields,
      validators: {
        validateAmount: vi.fn()
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
      addBeneficiary: mockAddBeneficiary,
      removeBeneficiary: mockRemoveBeneficiary
    });
  });

  // Aggiunti i tipi per le props del componente
  const TestComponent = ({
    isSubmitted = false,
    disabled = false
  }: TestComponentProps) => {
    // useForm è già mockato, quindi qui non verrà eseguito il codice reale
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

  it('renderizza correttamente i beneficiari', () => {
    render(<TestComponent />);

    // Verifica che tutti i componenti dei beneficiari siano renderizzati
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

  it('consente di rimuovere un beneficiario', async () => {
    render(<TestComponent />);

    const removeButton = screen.getByTestId('remove-beneficiary-0');
    fireEvent.click(removeButton);

    expect(mockRemoveBeneficiary).toHaveBeenCalledWith(0);
  });

  it('mostra il pulsante "aggiungi beneficiario" solo sull\'ultimo beneficiario', () => {
    render(<TestComponent />);

    // Cerchiamo il pulsante verificando il testo
    const addButtons = screen.getAllByText(
      'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
    );
    expect(addButtons).toHaveLength(1);

    // Clicchiamo il pulsante e verifichiamo che addBeneficiary sia chiamato
    fireEvent.click(addButtons[0]);
    expect(mockAddBeneficiary).toHaveBeenCalled();
  });

  it('non mostra il pulsante "aggiungi beneficiario" se è stato raggiunto il numero massimo', () => {
    // Modifichiamo il mock per simulare il raggiungimento del numero massimo di beneficiari
    (
      useBeneficiaryManagement as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      fields: [
        { id: 'beneficiary-1' },
        { id: 'beneficiary-2' },
        { id: 'beneficiary-3' },
        { id: 'beneficiary-4' }
      ],
      validators: { validateAmount: vi.fn() },
      fieldValidators: {
        validateBeneficiaryTaxCode: vi.fn(),
        validateIBAN: vi.fn(),
        validatePostalAccount: vi.fn(),
        validatePaymentMethod: vi.fn()
      },
      MAX_BENEFICIARIES: 4,
      existingBeneficiaries: {},
      wasSubmittedRef: { current: false },
      addBeneficiary: mockAddBeneficiary,
      removeBeneficiary: mockRemoveBeneficiary
    });

    render(<TestComponent />);

    // Non dovrebbe esserci un pulsante di aggiunta quando abbiamo raggiunto MAX_BENEFICIARIES
    expect(
      screen.queryAllByText(
        'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
      )
    ).toHaveLength(0);
  });

  it('gestisce correttamente lo stato disabled', () => {
    render(<TestComponent disabled={true} />);

    // Verifichiamo che il componente trasmetta correttamente lo stato disabled ai componenti figli
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
    const isSubmitted = true;

    // Creiamo oggetti di mock con tipi appropriati
    const mockControl = {
      _formValues: {}
    } as unknown as Control<TestFormValues>;
    const mockErrors = {} as FieldErrors<TestFormValues>;
    const mockSetValue = vi.fn() as unknown as UseFormSetValue<TestFormValues>;
    const mockGetValues =
      vi.fn() as unknown as UseFormGetValues<TestFormValues>;
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<TestFormValues>;

    render(
      <BeneficiaryField
        control={mockControl}
        isSubmitted={isSubmitted}
        errors={mockErrors}
        totalAmount={totalAmount}
        fieldNamePrefix={fieldNamePrefix}
        disabled={false}
        setValue={mockSetValue}
        getValues={mockGetValues}
        trigger={mockTrigger}
        onToggleMultibeneficiary={mockOnToggleMultibeneficiary}
        onBeneficiariesChange={mockOnBeneficiariesChange}
      />
    );

    // Verifichiamo che l'hook sia stato chiamato con i parametri corretti
    expect(useBeneficiaryManagement).toHaveBeenCalledWith(
      expect.objectContaining({
        control: mockControl,
        isSubmitted,
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
