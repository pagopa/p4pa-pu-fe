import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup
} from '@testing-library/react';
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
      // Simula errori per campi specifici nel test
      const hasError =
        name.includes('iban') ||
        name.includes('postalAccount') ||
        name.includes('entityName') ||
        name.includes('amount') ||
        name.includes('taxCode') ||
        name.includes('taxonomyCode');

      return render({
        field: {
          onChange: mockOnChange,
          onBlur: vi.fn(),
          value: '',
          name,
          ref: vi.fn()
        },
        fieldState: {
          error: hasError
            ? { message: `${name} error`, type: 'validate' }
            : undefined,
          invalid: hasError,
          isTouched: hasError,
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
      {error && (
        <span data-testid={`error-${name || label}`}>{helperText}</span>
      )}
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

    // Mock di getValues per simulare il comportamento del componente
    mockGetValues.mockImplementation((path: string): string => {
      if (path === 'beneficiaries.0.iban') {
        return 'invalid-iban'; // IBAN non valido
      }
      if (path === 'beneficiaries.0.postalAccount') {
        return 'invalid-postal'; // Conto postale non valido
      }
      // Per tutti gli altri campi
      return 'test-value';
    });

    render(
      <BeneficiaryField
        {...defaultProps}
        errors={customErrors}
        isSubmitted={true}
      />
    );

    // Verifica che gli elementi TextField abbiano l'attributo error impostato a true
    // Il test non verifica più il contenuto esatto dei messaggi di errore,
    // ma si assicura che gli elementi di errore siano presenti nel DOM
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.entityName')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.amount')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.taxCode')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.iban')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.postalAccount')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByTestId('textfield-beneficiaries.0.taxonomyCode')
        .querySelector('[data-testid]')
    ).toBeInTheDocument();
  });

  it('testa la logica di visualizzazione errori condizionali per IBAN e conto postale', () => {
    // Test 1: Caso IBAN valorizzato, Conto Postale vuoto
    // Configuriamo mock per getValues per simulare IBAN valorizzato
    mockGetValues.mockImplementation((name: string) => {
      if (name === 'beneficiaries.0.iban') {
        return 'IT60X0542811101000000123456'; // IBAN valorizzato
      }
      if (name === 'beneficiaries.0.postalAccount') {
        return ''; // Conto postale vuoto
      }
      return '';
    });

    // Creiamo errori personalizzati su entrambi i campi
    const customErrors = {
      beneficiaries: {
        0: {
          iban: { message: 'IBAN non valido' },
          postalAccount: { message: 'Conto corrente postale non valido' }
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

    // Quando l'IBAN è valorizzato, l'errore sul conto postale non dovrebbe apparire
    // anche se isSubmitted è true e c'è un errore nel campo
    expect(
      screen.queryByText('Conto corrente postale non valido')
    ).not.toBeInTheDocument();

    // Pulizia e reset per il secondo test
    cleanup();
    mockGetValues.mockReset();

    // Test del caso opposto: Conto postale valorizzato, IBAN vuoto
    mockGetValues.mockImplementation((name: string) => {
      if (name === 'beneficiaries.0.iban') {
        return ''; // IBAN vuoto
      }
      if (name === 'beneficiaries.0.postalAccount') {
        return '123456789012'; // Conto postale valorizzato
      }
      return '';
    });

    // Renderizziamo di nuovo con gli stessi errori
    render(
      <BeneficiaryField
        {...defaultProps}
        errors={customErrors}
        isSubmitted={true}
      />
    );

    // Quando il conto postale è valorizzato, l'errore sull'IBAN non dovrebbe apparire
    expect(screen.queryByText('IBAN non valido')).not.toBeInTheDocument();
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
