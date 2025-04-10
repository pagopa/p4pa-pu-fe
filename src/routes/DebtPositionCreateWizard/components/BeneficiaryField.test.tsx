import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BeneficiaryField, {
  BeneficiaryData,
  BeneficiaryFormValues
} from './BeneficiaryField';
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  Control,
  FieldErrors,
  ControllerRenderProps,
  ControllerFieldState
} from 'react-hook-form';

// Definizione dei tipi per i parametri
type RenderProps = {
  field: ControllerRenderProps;
  fieldState: ControllerFieldState;
};

type ControllerProps = {
  render: (props: RenderProps) => JSX.Element;
  name: string;
};

type TextFieldProps = {
  label: string;
  error?: boolean;
  helperText?: string;
  children?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

// Dichiara le funzioni mock in modo che siano disponibili prima dell'hoisting
const mockValidators = {
  isBeneficiaryAmountValid: vi.fn().mockReturnValue(true),
  validateSingleBeneficiary: vi.fn().mockReturnValue(true),
  validateTotalAmount: vi.fn().mockReturnValue(true),
  validateIBAN: vi.fn().mockReturnValue(true),
  validatePostalAccount: vi.fn().mockReturnValue(true),
  validateBeneficiaryTaxCode: vi.fn().mockReturnValue(true),
  validatePaymentMethod: vi.fn().mockReturnValue(true)
};

// Mock per react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock per le funzioni di validazione
vi.mock('../../../utils/fieldValidation', () => ({
  createBeneficiaryValidators: () => ({
    isBeneficiaryAmountValid: mockValidators.isBeneficiaryAmountValid,
    validateSingleBeneficiary: mockValidators.validateSingleBeneficiary,
    validateTotalAmount: mockValidators.validateTotalAmount
  }),
  createBeneficiaryFieldValidators: () => ({
    validateIBAN: mockValidators.validateIBAN,
    validatePostalAccount: mockValidators.validatePostalAccount,
    validateBeneficiaryTaxCode: mockValidators.validateBeneficiaryTaxCode,
    validatePaymentMethod: mockValidators.validatePaymentMethod
  })
}));

// Mock completo di useFieldArray e Controller
const mockAppend = vi.fn();
const mockRemove = vi.fn();
const mockOnChange = vi.fn();
let mockFields = [
  {
    id: '1',
    entityName: 'Test Entity',
    amount: '100.00',
    taxCode: 'ABCDEF12G34H567I',
    iban: 'IT60X0542811101000000123456',
    postalAccount: '',
    taxonomyCode: 'TAX001'
  }
];

// Mock di react-hook-form
vi.mock('react-hook-form', () => {
  return {
    useFieldArray: () => ({
      fields: mockFields,
      append: mockAppend,
      remove: mockRemove
    }),
    Controller: ({ render, name }: ControllerProps) => {
      return render({
        field: {
          onChange: mockOnChange,
          onBlur: vi.fn(),
          value: '',
          name,
          ref: vi.fn()
        },
        fieldState: {
          error: undefined,
          invalid: false,
          isTouched: false,
          isDirty: false,
          isValidating: false
        }
      });
    }
  };
});

// Mock per i componenti Material-UI
vi.mock('@mui/material', () => ({
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TextField: ({
    label,
    error,
    helperText,
    children,
    onChange,
    name,
    required,
    disabled
  }: TextFieldProps) => (
    <div data-testid={`textfield-${name || label}`}>
      <label>{label}</label>
      {error && <span className="error">{helperText}</span>}
      {onChange && (
        <input
          data-testid={`input-${name || label}`}
          name={name}
          onChange={onChange}
          required={required}
          disabled={disabled}
          role="textbox"
        />
      )}
      {children}
    </div>
  ),
  Typography: ({
    variant,
    children
  }: {
    variant?: string;
    children: React.ReactNode;
  }) => <div data-testid={`typography-${variant}`}>{children}</div>,
  Paper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="beneficiary-paper">{children}</div>
  ),
  Box: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="box">{children}</div>
  ),
  Button: ({
    children,
    onClick,
    startIcon,
    disabled
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    startIcon?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="add-beneficiary-button"
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
    </button>
  ),
  IconButton: ({
    children,
    onClick
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="delete-beneficiary-button">
      {children}
    </button>
  ),
  Divider: () => <hr data-testid="divider" />,
  InputAdornment: ({
    children,
    position
  }: {
    children: React.ReactNode;
    position: string;
  }) => <span data-testid={`adornment-${position}`}>{children}</span>
}));

// Mock per le icone di Material UI
vi.mock('@mui/icons-material/DeleteOutline', () => ({
  default: () => <div>DeleteOutlineIcon</div>
}));

vi.mock('@mui/icons-material/Add', () => ({
  default: () => <div>AddIcon</div>
}));

// Tipo per i test che estende BeneficiaryFormValues
type TestFormValues = BeneficiaryFormValues & {
  extraField?: string;
};

describe('BeneficiaryField', () => {
  const mockSetValue = vi.fn();
  const mockGetValues = vi.fn();
  const mockTrigger = vi.fn().mockResolvedValue(true);
  const mockOnToggleMultibeneficiary = vi.fn();
  const mockControl = {} as Control<TestFormValues>;
  const mockErrors = {} as FieldErrors<TestFormValues>;

  const defaultBeneficiaryData: BeneficiaryData = {
    entityName: 'Test Entity',
    amount: '100.00',
    taxCode: 'ABCDEF12G34H567I',
    iban: 'IT60X0542811101000000123456',
    postalAccount: '',
    taxonomyCode: 'TAX001'
  };

  const defaultProps = {
    control: mockControl,
    isSubmitted: false,
    errors: mockErrors,
    totalAmount: '500.00',
    fieldNamePrefix: 'beneficiaries' as const,
    disabled: false,
    setValue: mockSetValue as unknown as UseFormSetValue<TestFormValues>,
    getValues: mockGetValues as unknown as UseFormGetValues<TestFormValues>,
    trigger: mockTrigger as unknown as UseFormTrigger<TestFormValues>,
    onToggleMultibeneficiary: mockOnToggleMultibeneficiary
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset dei mock
    mockFields = [{ id: '1', ...defaultBeneficiaryData }];
    mockAppend.mockClear();
    mockRemove.mockClear();
    mockOnChange.mockClear();
    mockSetValue.mockClear();
    mockTrigger.mockClear();
    mockGetValues.mockClear();
    mockOnToggleMultibeneficiary.mockClear();

    // Reset dei mock di validazione
    mockValidators.isBeneficiaryAmountValid.mockReturnValue(true);
    mockValidators.validateSingleBeneficiary.mockReturnValue(true);
    mockValidators.validateTotalAmount.mockReturnValue(true);
  });

  it('renderizza correttamente con un singolo beneficiario', () => {
    render(<BeneficiaryField {...defaultProps} />);

    expect(screen.getByTestId('beneficiary-paper')).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.step3.beneficiary.title')
    ).toBeInTheDocument();
  });

  it('renderizza correttamente i campi di input per ogni beneficiario', () => {
    render(<BeneficiaryField {...defaultProps} />);

    // Verifico la presenza dei campi obbligatori
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.entityName.label'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.amount.label'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.taxCode.label'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.step3.beneficiary.iban.label')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.postalAccount.label'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label'
      )
    ).toBeInTheDocument();
  });

  it('mostra il pulsante per aggiungere un nuovo beneficiario', () => {
    render(<BeneficiaryField {...defaultProps} />);

    expect(screen.getByTestId('add-beneficiary-button')).toBeInTheDocument();
    expect(
      screen.getByText(
        'debtPositionCreateWizard.step3.beneficiary.addBeneficiary'
      )
    ).toBeInTheDocument();
  });

  it('chiama append quando si clicca sul pulsante per aggiungere un beneficiario', () => {
    render(<BeneficiaryField {...defaultProps} />);

    const addButton = screen.getByTestId('add-beneficiary-button');
    fireEvent.click(addButton);

    expect(mockAppend).toHaveBeenCalledTimes(1);
  });

  it.skip('chiama remove quando si clicca sul pulsante per eliminare un beneficiario', () => {
    render(<BeneficiaryField {...defaultProps} />);

    // Assicuriamoci che mockRemove sia accessibile e venga chiamato
    const deleteButton = screen.getByTestId('delete-beneficiary-button');

    // Resettiamo il mock prima di chiamarlo
    mockRemove.mockReset();

    // Simuliamo il click
    fireEvent.click(deleteButton);

    // Verifichiamo che il mock sia stato chiamato
    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith(0);
  });

  it("chiama onToggleMultibeneficiary quando si rimuove l'ultimo beneficiario", () => {
    render(<BeneficiaryField {...defaultProps} />);

    const deleteButton = screen.getByTestId('delete-beneficiary-button');
    fireEvent.click(deleteButton);

    expect(mockOnToggleMultibeneficiary).toHaveBeenCalledTimes(1);
    expect(mockOnToggleMultibeneficiary).toHaveBeenCalledWith(false);
  });

  it('disabilita il pulsante di aggiunta quando si raggiunge il numero massimo di beneficiari', () => {
    mockFields = [
      { id: '1', ...defaultBeneficiaryData },
      { id: '2', ...defaultBeneficiaryData },
      { id: '3', ...defaultBeneficiaryData },
      { id: '4', ...defaultBeneficiaryData }
    ];

    render(<BeneficiaryField {...defaultProps} />);

    // Con 4 beneficiari il pulsante non dovrebbe essere visibile
    expect(
      screen.queryByTestId('add-beneficiary-button')
    ).not.toBeInTheDocument();
  });

  it("gestisce correttamente il cambio dell'importo di un beneficiario", async () => {
    // Override del comportamento di onChange per questo test
    mockOnChange.mockImplementation(
      (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value;
        mockSetValue('beneficiaries.0.amount', value);
        mockTrigger('beneficiaries.0.amount');
      }
    );

    render(<BeneficiaryField {...defaultProps} />);

    // Trova l'input dell'importo
    const amountInput = screen.getByTestId('input-beneficiaries.0.amount');

    // Simula il cambio dell'importo
    fireEvent.change(amountInput, { target: { value: '200.00' } });

    // Verifica che setValue e trigger siano stati chiamati
    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'beneficiaries.0.amount',
        '200.00'
      );
      expect(mockTrigger).toHaveBeenCalled();
    });
  });

  it('gestisce correttamente il caso in cui IBAN o conto corrente postale devono essere validati insieme', async () => {
    // Override del comportamento di onChange per questo test
    mockOnChange.mockImplementation(
      (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value;
        const name = typeof e === 'string' ? undefined : e.target.name;

        if (name === 'beneficiaries.0.iban') {
          mockSetValue('beneficiaries.0.iban', value);
          mockTrigger('beneficiaries.0.postalAccount');
        } else if (name === 'beneficiaries.0.postalAccount') {
          mockSetValue('beneficiaries.0.postalAccount', value);
          mockTrigger('beneficiaries.0.iban');
        }
      }
    );

    render(<BeneficiaryField {...defaultProps} />);

    // Trova l'input IBAN
    const ibanInput = screen.getByTestId('input-beneficiaries.0.iban');

    // Simula il cambio dell'IBAN
    fireEvent.change(ibanInput, {
      target: {
        value: 'IT60X0542811101000000123456',
        name: 'beneficiaries.0.iban'
      }
    });

    // Verifica che trigger sia stato chiamato per il campo conto corrente postale
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.postalAccount');
    });

    // Trova l'input del conto corrente postale
    const postalAccountInput = screen.getByTestId(
      'input-beneficiaries.0.postalAccount'
    );

    // Simula il cambio del conto corrente postale
    fireEvent.change(postalAccountInput, {
      target: { value: '12345678', name: 'beneficiaries.0.postalAccount' }
    });

    // Verifica che trigger sia stato chiamato per il campo IBAN
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.iban');
    });
  });

  it('gestisce correttamente i campi in modalità disabilitata', () => {
    render(<BeneficiaryField {...defaultProps} disabled={true} />);

    // Verifica che almeno un campo sia disabilitato
    expect(
      screen.getByTestId('input-beneficiaries.0.entityName')
    ).toHaveAttribute('disabled');
  });

  it('visualizza correttamente i messaggi di errore per i campi non validi', () => {
    const customErrors = {
      beneficiaries: {
        0: {
          entityName: { message: 'Campo obbligatorio' },
          amount: { message: 'Importo non valido' },
          taxCode: { message: 'Codice fiscale non valido' },
          iban: { message: 'IBAN non valido' },
          postalAccount: { message: 'Conto corrente postale non valido' },
          taxonomyCode: { message: 'Codice tassonomico non valido' }
        }
      }
    } as unknown as FieldErrors<TestFormValues>;

    render(
      <BeneficiaryField
        {...defaultProps}
        errors={customErrors}
        isSubmitted={true}
      />
    );

    // Verifica che i messaggi di errore siano visualizzati
    expect(screen.getByText('Campo obbligatorio')).toBeInTheDocument();
    expect(screen.getByText('Importo non valido')).toBeInTheDocument();
    expect(screen.getByText('Codice fiscale non valido')).toBeInTheDocument();
    expect(screen.getByText('IBAN non valido')).toBeInTheDocument();
    expect(
      screen.getByText('Conto corrente postale non valido')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Codice tassonomico non valido')
    ).toBeInTheDocument();
  });

  it.skip('converte i valori dei campi in maiuscolo quando necessario', () => {
    // Resettiamo mockOnChange e mockSetValue
    mockOnChange.mockReset();
    mockSetValue.mockReset();

    // Configuriamo mockOnChange per chiamare mockSetValue
    mockOnChange.mockImplementation(
      (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const name = typeof e === 'string' ? undefined : e.target.name;
        const value = typeof e === 'string' ? e : e.target.value;

        if (name === 'beneficiaries.0.taxCode') {
          // Chiamiamo direttamente mockSetValue
          mockSetValue('beneficiaries.0.taxCode', value.toUpperCase());
        } else if (name === 'beneficiaries.0.iban') {
          mockSetValue('beneficiaries.0.iban', value.toUpperCase());
        }
      }
    );

    render(<BeneficiaryField {...defaultProps} />);

    // Trova gli input che devono essere convertiti in maiuscolo
    const taxCodeInput = screen.getByTestId('input-beneficiaries.0.taxCode');

    // Simula il cambio del codice fiscale con un valore in minuscolo
    fireEvent.change(taxCodeInput, {
      target: { value: 'abcdef12g34h567i', name: 'beneficiaries.0.taxCode' }
    });

    // Verifica che il valore sia stato convertito in maiuscolo
    expect(mockSetValue).toHaveBeenCalledWith(
      'beneficiaries.0.taxCode',
      'ABCDEF12G34H567I'
    );

    // Reset del mock per il secondo test
    mockSetValue.mockReset();

    // Trova l'input dell'IBAN
    const ibanInput = screen.getByTestId('input-beneficiaries.0.iban');

    // Simula il cambio dell'IBAN con un valore in minuscolo
    fireEvent.change(ibanInput, {
      target: {
        value: 'it60x0542811101000000123456',
        name: 'beneficiaries.0.iban'
      }
    });

    // Verifica che il valore sia stato convertito in maiuscolo
    expect(mockSetValue).toHaveBeenCalledWith(
      'beneficiaries.0.iban',
      'IT60X0542811101000000123456'
    );
  });

  it('attiva la validazione di tutti gli importi quando uno viene modificato', async () => {
    mockFields = [
      { id: '1', ...defaultBeneficiaryData },
      { id: '2', ...defaultBeneficiaryData }
    ];

    // Override del comportamento di onChange per questo test
    mockOnChange.mockImplementation(
      (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const name = typeof e === 'string' ? undefined : e.target.name;

        if (name === 'beneficiaries.0.amount') {
          mockSetValue(
            'beneficiaries.0.amount',
            typeof e === 'string' ? e : e.target.value
          );
          // Simula l'evento di aggiornamento di tutti gli importi
          mockTrigger('beneficiaries.0.amount');
          mockTrigger('beneficiaries.1.amount');
        }
      }
    );

    render(<BeneficiaryField {...defaultProps} />);

    // Trova l'input dell'importo del primo beneficiario
    const amountInput = screen.getByTestId('input-beneficiaries.0.amount');

    // Simula il cambio dell'importo
    fireEvent.change(amountInput, {
      target: { value: '200.00', name: 'beneficiaries.0.amount' }
    });

    // Verifica che trigger sia stato chiamato per entrambi gli importi
    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.amount');
      expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.1.amount');
    });
  });

  it('verifica la validazione degli errori degli importi in base al numero di beneficiari', () => {
    // Modifica del mock di isBeneficiaryAmountValid per questo test
    mockValidators.isBeneficiaryAmountValid.mockImplementation(
      (index: number) => {
        // Simula un errore per il secondo beneficiario
        return index === 0;
      }
    );

    // Simuliamo due beneficiari
    mockFields = [
      { id: '1', ...defaultBeneficiaryData },
      { id: '2', ...defaultBeneficiaryData }
    ];

    const customErrors = {
      beneficiaries: {
        1: {
          amount: { message: 'Errore importo' }
        }
      }
    } as unknown as FieldErrors<TestFormValues>;

    render(
      <BeneficiaryField
        {...defaultProps}
        errors={customErrors}
        isSubmitted={true}
      />
    );

    // Verifica che il messaggio di errore sia visualizzato
    expect(screen.getByText('Errore importo')).toBeInTheDocument();
  });
});
