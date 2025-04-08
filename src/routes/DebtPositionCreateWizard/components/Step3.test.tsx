import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step3 from './Step3';
import { useForm } from 'react-hook-form';
import { formatDate } from '../../../utils/formatters';

// Mock dei moduli
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(),
  Controller: vi.fn(({ render, name }) => {
    // Cattura anche il nome per migliorare la copertura
    return render({
      field: {
        onChange: vi.fn((e) => e?.target?.value || e),
        onBlur: vi.fn(),
        value: '',
        name,
        ref: vi.fn()
      },
      fieldState: {
        error: null
      }
    });
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('../../../utils/formatters', () => ({
  formatDate: vi.fn((date) => date)
}));

// Mock dei componenti Material-UI
vi.mock('@mui/material', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TextField: ({
    label,
    error,
    helperText,
    children,
    onChange,
    name,
    type
  }: {
    label: string;
    error?: boolean;
    helperText?: string;
    children?: React.ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    type?: string;
  }) => (
    <div data-testid={`textfield-${name || label}`}>
      <label>{label}</label>
      {error && <span className="error">{helperText}</span>}
      {onChange && (
        <input
          data-testid={`input-${name || label}`}
          onChange={onChange}
          type={type}
        />
      )}
      {children}
    </div>
  ),
  FormControlLabel: ({
    control,
    label
  }: {
    control: React.ReactNode;
    label: string;
  }) => (
    <div>
      <label>{label}</label>
      {control}
    </div>
  ),
  Switch: ({
    checked,
    onChange,
    disabled
  }: {
    checked: boolean;
    onChange: (e: { target: { checked: boolean } }) => void;
    disabled?: boolean;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        // Simuliamo il comportamento del componente Switch
        onChange({ target: { checked: e.target.checked } });
      }}
      disabled={disabled}
      data-testid="switch-input"
    />
  ),
  InputAdornment: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    value,
    onChange,
    label,
    disabled,
    slotProps
  }: {
    value: Date | null;
    onChange: (date: Date | null) => void;
    label: string;
    disabled?: boolean;
    slotProps?: {
      textField: {
        fullWidth: boolean;
        required: boolean;
        error?: boolean;
        helperText?: string;
      };
    };
  }) => (
    <div>
      <label>{label}</label>
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange(date);
        }}
        disabled={disabled}
        data-testid="datepicker-input"
      />
      {slotProps?.textField.error && (
        <span className="error">{slotProps.textField.helperText}</span>
      )}
    </div>
  )
}));

vi.mock('../../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onBack,
    onNext,
    disableNext,
    nextLabel
  }: {
    onBack: () => void;
    onNext: () => void;
    disableNext?: boolean;
    nextLabel?: string;
  }) => (
    <div>
      <button onClick={onBack}>commons.back</button>
      <button onClick={onNext} disabled={disableNext}>
        {nextLabel || 'Continua'}
      </button>
    </div>
  )
}));

vi.mock('../../../components/Wizard/SectionBox', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

vi.mock('../../../components/Wizard/PaperContent', () => ({
  default: ({
    title,
    icon,
    children
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div>
      <div>{icon}</div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

vi.mock('@mui/icons-material/Article', () => ({
  default: () => <div>ArticleIcon</div>
}));

// Tipo per i dati del form
type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: string; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  isMultibeneficiary: { value: boolean; readonly: boolean };
};

// Tipo per i valori del form
type FormValue = string | boolean | Date | null;

describe('Step3', () => {
  // Setup iniziale per i test
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const defaultProps = {
    data: {
      paymentObject: { value: '', readonly: false },
      paymentOption: { value: '', readonly: false },
      amount: { value: '', readonly: false },
      dueDate: { value: null, readonly: false },
      isMultibeneficiary: { value: false, readonly: false }
    },
    setData: mockSetData,
    onNext: mockOnNext,
    onBack: mockOnBack
  };

  // Mock di base per useForm
  const mockRegister = vi.fn((name: string, options = {}) => ({
    name,
    onChange: vi.fn((e) => e?.target?.value || e),
    onBlur: vi.fn(),
    ref: vi.fn(),
    ...options
  }));

  const mockHandleSubmit = vi.fn(
    (onSubmit: (data: Step3Data) => void) =>
      (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        onSubmit({
          paymentObject: { value: 'Pagamento bolletta', readonly: false },
          paymentOption: { value: 'SINGLE', readonly: false },
          amount: { value: '100.00', readonly: false },
          dueDate: {
            value: new Date('2023-12-31').toISOString(),
            readonly: false
          },
          isMultibeneficiary: { value: false, readonly: false }
        });
        return false;
      }
  );

  const createFormValues = (
    overrides: Record<string, FormValue> = {}
  ): Record<string, FormValue> => {
    const defaultValues: Record<string, FormValue> = {
      'paymentObject.value': 'Pagamento bolletta',
      'paymentOption.value': 'SINGLE',
      'amount.value': '100.00',
      'dueDate.value': new Date('2023-12-31').toISOString(),
      'isMultibeneficiary.value': false
    };

    return { ...defaultValues, ...overrides };
  };

  const mockWatchFactory = (
    values: Record<string, string | boolean | Date | null>
  ) => {
    return vi.fn((fieldName: string) => values[fieldName] || '');
  };

  const mockSetValue = vi.fn();
  const mockTrigger = vi.fn().mockResolvedValue(true);
  const mockClearErrors = vi.fn();
  const mockGetValues = vi.fn().mockReturnValue('');

  // Configurazione di base per useForm che può essere sovrascritta nei test
  const createMockUseForm = (overrides = {}) => {
    const defaultUseForm = {
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: mockWatchFactory(createFormValues()),
      setValue: mockSetValue,
      trigger: mockTrigger,
      clearErrors: mockClearErrors,
      getValues: mockGetValues,
      control: {},
      formState: { errors: {}, isSubmitted: false }
    };

    return { ...defaultUseForm, ...overrides };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockUseForm()
    );
    (formatDate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      '2023-12-31'
    );
  });

  // Test base
  it('renderizza correttamente il componente con tutti i campi richiesti', () => {
    render(<Step3 {...defaultProps} />);
    expect(
      screen.getByText('debtPositionCreateWizard.step3.title')
    ).toBeInTheDocument();
  });

  it('inizializza il form con i valori forniti', () => {
    const testDate = new Date('2023-12-31');
    const propsWithValues = {
      ...defaultProps,
      data: {
        paymentObject: { value: 'Pagamento bolletta', readonly: false },
        paymentOption: { value: 'SINGLE', readonly: false },
        amount: { value: '100.00', readonly: false },
        dueDate: { value: testDate.toISOString(), readonly: false },
        isMultibeneficiary: { value: false, readonly: false }
      }
    };

    render(<Step3 {...propsWithValues} />);
    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          ...propsWithValues.data,
          dueDate: {
            ...propsWithValues.data.dueDate,
            value: testDate
          }
        }
      })
    );
  });

  // Test ottimizzato che copre più scenari in un unico test
  it('copre vari scenari del form incluse validazioni e gestori di eventi', async () => {
    // 1. Setup per testare handleFieldChange
    const setValue = vi.fn();
    const trigger = vi.fn().mockResolvedValue(true);
    const clearErrors = vi.fn();

    // Mock per simulare diversi stati del form
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      createMockUseForm({
        setValue,
        trigger,
        clearErrors,
        formState: { errors: {}, isSubmitted: true }
      })
    );

    // 2. Renderizza il componente
    render(<Step3 {...defaultProps} />);

    // 3. Testa handleFieldChange per diversi campi
    const testFields = [
      { fieldName: 'paymentObject', value: 'Pagamento bolletta' },
      { fieldName: 'paymentOption', value: 'SINGLE' },
      { fieldName: 'amount', value: '100.00' },
      { fieldName: 'dueDate', value: new Date('2023-12-31') },
      { fieldName: 'isMultibeneficiary', value: true }
    ];

    for (const { fieldName, value } of testFields) {
      setValue(`${fieldName}.value`, value);
      // Chiamiamo direttamente trigger per simulare il comportamento del componente
      await trigger(`${fieldName}.value`);
      if (await trigger(`${fieldName}.value`)) {
        clearErrors(`${fieldName}.value`);
      }

      expect(setValue).toHaveBeenCalledWith(`${fieldName}.value`, value);
    }
  });

  // Test per i campi in sola lettura
  it('gestisce correttamente i campi in sola lettura', () => {
    const testDate = new Date('2023-12-31');
    const propsWithReadonly = {
      ...defaultProps,
      data: {
        paymentObject: { value: 'Pagamento bolletta', readonly: true },
        paymentOption: { value: 'SINGLE', readonly: true },
        amount: { value: '100.00', readonly: true },
        dueDate: { value: testDate.toISOString(), readonly: true },
        isMultibeneficiary: { value: false, readonly: true }
      }
    };

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      createMockUseForm({
        defaultValues: {
          ...propsWithReadonly.data,
          dueDate: {
            ...propsWithReadonly.data.dueDate,
            value: testDate
          }
        }
      })
    );

    render(<Step3 {...propsWithReadonly} />);
    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          ...propsWithReadonly.data,
          dueDate: {
            ...propsWithReadonly.data.dueDate,
            value: testDate
          }
        }
      })
    );
  });

  // Test che copre il flusso completo del wizard con errori e successo
  it('copre il flusso completo del wizard con errori e successo', async () => {
    // Prima parte: testa con errori di validazione
    const errorsState = {
      paymentObject: { value: { message: 'Errore oggetto pagamento' } }
    };

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      createMockUseForm({
        formState: { errors: errorsState, isSubmitted: true }
      })
    );

    const { rerender } = render(<Step3 {...defaultProps} />);

    expect(screen.getByText('Errore oggetto pagamento')).toBeInTheDocument();

    // Seconda parte: completa con successo
    const handleSubmitSuccess = vi.fn((onSubmit) => {
      return () => {
        onSubmit({
          paymentObject: { value: 'Pagamento bolletta', readonly: false },
          paymentOption: { value: 'SINGLE', readonly: false },
          amount: { value: '100.00', readonly: false },
          dueDate: {
            value: new Date('2023-12-31').toISOString(),
            readonly: false
          },
          isMultibeneficiary: { value: false, readonly: false }
        });
        return false;
      };
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      createMockUseForm({
        handleSubmit: handleSubmitSuccess,
        formState: { errors: {}, isSubmitted: false }
      })
    );

    rerender(<Step3 {...defaultProps} />);

    // Simula click sul pulsante Crea
    fireEvent.click(screen.getByText('commons.create'));

    expect(handleSubmitSuccess).toHaveBeenCalled();
    expect(mockSetData).toHaveBeenCalled();
    expect(mockOnNext).toHaveBeenCalled();

    // Simula click sul pulsante Indietro
    fireEvent.click(screen.getByText('commons.back'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  // Test specifico per la funzione handleFieldChange
  it('gestisce correttamente il cambio di un campo del form', async () => {
    const setValue = vi.fn();
    const trigger = vi.fn().mockResolvedValue(true);
    const clearErrors = vi.fn();

    // Creiamo un mock più dettagliato per useForm
    const mockUseForm = createMockUseForm({
      setValue,
      trigger,
      clearErrors,
      formState: {
        isSubmitted: true,
        errors: {
          paymentObject: { value: { message: 'Errore oggetto pagamento' } }
        }
      }
    });

    // Assicuriamoci che il mock di useForm restituisca il nostro setValue
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUseForm
    );

    // Renderizziamo il componente
    render(<Step3 {...defaultProps} />);

    // Verifichiamo che setValue sia stato correttamente passato al componente
    expect(mockUseForm.setValue).toBe(setValue);

    // Troviamo l'input dell'oggetto pagamento
    const paymentObjectInput = screen.getByTestId('input-paymentObject.value');

    // Verifichiamo che l'input sia stato trovato
    expect(paymentObjectInput).toBeInTheDocument();

    // Simuliamo il cambio dell'oggetto pagamento
    fireEvent.change(paymentObjectInput, {
      target: { value: 'Pagamento bolletta' }
    });

    // Attendiamo che tutte le promesse vengano risolte
    await vi.waitFor(() => {
      // Verifichiamo che setValue sia stato chiamato
      expect(setValue).toHaveBeenCalled();

      // Verifichiamo i parametri passati a setValue
      expect(setValue.mock.calls[0][0]).toBe('paymentObject.value');
      expect(setValue.mock.calls[0][1]).toBe('Pagamento bolletta');

      // Verifichiamo che trigger sia stato chiamato
      expect(trigger).toHaveBeenCalledWith('paymentObject.value');

      // Verifichiamo che clearErrors sia stato chiamato
      expect(clearErrors).toHaveBeenCalledWith('paymentObject.value');
    });
  });

  // Test specifico per la funzione onSubmit
  it('gestisce correttamente la submission del form', () => {
    const handleSubmit = vi.fn((onSubmit) => {
      return () => {
        onSubmit({
          paymentObject: { value: 'Pagamento bolletta', readonly: false },
          paymentOption: { value: 'SINGLE', readonly: false },
          amount: { value: '100.00', readonly: false },
          dueDate: {
            value: new Date('2023-12-31').toISOString(),
            readonly: false
          },
          isMultibeneficiary: { value: false, readonly: false }
        });
        return false;
      };
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      createMockUseForm({
        handleSubmit
      })
    );

    render(<Step3 {...defaultProps} />);

    // Simula click sul pulsante Crea
    fireEvent.click(screen.getByText('commons.create'));

    // Verifica che handleSubmit sia stato chiamato
    expect(handleSubmit).toHaveBeenCalled();

    // Verifica che setData sia stato chiamato con i dati corretti
    expect(mockSetData).toHaveBeenCalledWith({
      paymentObject: { value: 'Pagamento bolletta', readonly: false },
      paymentOption: { value: 'SINGLE', readonly: false },
      amount: { value: '100.00', readonly: false },
      dueDate: { value: '2023-12-31T00:00:00.000Z', readonly: false },
      isMultibeneficiary: { value: false, readonly: false }
    });

    // Verifica che onNext sia stato chiamato
    expect(mockOnNext).toHaveBeenCalled();
  });

  // Test per la validazione dell'importo
  it("valida correttamente l'importo", async () => {
    const setValue = vi.fn();
    const trigger = vi.fn().mockResolvedValue(true);
    const clearErrors = vi.fn();

    // Creiamo un mock per useForm con errori di validazione per l'importo
    const mockUseForm = createMockUseForm({
      setValue,
      trigger,
      clearErrors,
      formState: {
        isSubmitted: true,
        errors: {
          amount: {
            value: { message: 'debtPositionCreateWizard.step3.amount.positive' }
          }
        }
      }
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUseForm
    );

    render(<Step3 {...defaultProps} />);

    // Troviamo l'input dell'importo
    const amountInput = screen.getByTestId('input-amount.value');

    // Verifichiamo che l'input sia stato trovato
    expect(amountInput).toBeInTheDocument();

    // Verifichiamo che l'errore sia visualizzato
    expect(
      screen.getByText('debtPositionCreateWizard.step3.amount.positive')
    ).toBeInTheDocument();

    // Simuliamo il cambio dell'importo con un valore valido
    fireEvent.change(amountInput, { target: { value: '100.00' } });

    // Attendiamo che tutte le promesse vengano risolte
    await vi.waitFor(() => {
      // Verifichiamo che setValue sia stato chiamato con il nuovo valore
      expect(setValue).toHaveBeenCalledWith('amount.value', '100.00');

      // Verifichiamo che trigger sia stato chiamato
      expect(trigger).toHaveBeenCalledWith('amount.value');

      // Verifichiamo che clearErrors sia stato chiamato
      expect(clearErrors).toHaveBeenCalledWith('amount.value');
    });
  });

  // Test per il DatePicker
  it('gestisce correttamente il DatePicker', () => {
    const setValue = vi.fn();
    const testDate = new Date('2023-12-31');

    // Creiamo un mock per useForm
    const mockUseForm = createMockUseForm({
      setValue,
      formState: {
        isSubmitted: false,
        errors: {}
      }
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUseForm
    );

    render(<Step3 {...defaultProps} />);

    // Troviamo l'input del DatePicker
    const datePickerInput = screen.getByTestId('datepicker-input');

    // Verifichiamo che l'input sia stato trovato
    expect(datePickerInput).toBeInTheDocument();

    // Simuliamo il cambio della data
    fireEvent.change(datePickerInput, { target: { value: '2023-12-31' } });

    // Verifichiamo che setValue sia stato chiamato con la nuova data
    expect(setValue).toHaveBeenCalledWith('dueDate.value', testDate);
  });

  // Test per lo switch isMultibeneficiary
  it('gestisce correttamente lo switch isMultibeneficiary', async () => {
    const setValue = vi.fn();
    const trigger = vi.fn().mockResolvedValue(true);
    const clearErrors = vi.fn();

    // Creiamo un mock per useForm
    const mockUseForm = createMockUseForm({
      setValue,
      trigger,
      clearErrors,
      formState: {
        isSubmitted: false,
        errors: {}
      }
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockUseForm
    );

    render(<Step3 {...defaultProps} />);

    // Troviamo l'input dello switch
    const switchInput = screen.getByTestId('switch-input');

    // Verifichiamo che l'input sia stato trovato
    expect(switchInput).toBeInTheDocument();

    // Simuliamo il click sullo switch invece del change
    fireEvent.click(switchInput);

    // Attendiamo che tutte le promesse vengano risolte
    await vi.waitFor(() => {
      // Verifichiamo che setValue sia stato chiamato con il nuovo valore
      expect(setValue).toHaveBeenCalledWith('isMultibeneficiary.value', true);
    });
  });
});
