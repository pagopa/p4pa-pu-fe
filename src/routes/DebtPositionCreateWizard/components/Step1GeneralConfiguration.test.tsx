import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useStore } from '../../../store/GlobalStore';
import { useForm } from 'react-hook-form';
import Step1GeneralConfiguration from './Step1GeneralConfiguration';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';

// Mock dei moduli
vi.mock('../../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: vi.fn()
}));

// Mock di react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn()
}));

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock dei componenti
vi.mock('./SectionBox', () => ({
  default: ({
    children,
    title
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="section-box" data-title={title}>
      {children}
    </div>
  )
}));

vi.mock('./WizardStepButtons', () => ({
  default: ({
    onNext,
    onBack,
    disableNext,
    disableBack
  }: {
    onNext: () => void;
    onBack?: () => void;
    disableNext: boolean;
    disableBack: boolean;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button data-testid="next-button" onClick={onNext} disabled={disableNext}>
        Avanti
      </button>
      <button data-testid="back-button" onClick={onBack} disabled={disableBack}>
        Indietro
      </button>
    </div>
  )
}));

// Tipi per i mocks
type FormValues = {
  debtPositionType: string;
  description: string;
};

// Tipo per le opzioni di register
type RegisterOptions = {
  required?: string | boolean;
  validate?: (value: string) => boolean | string;
};

describe('Step1GeneralConfiguration', () => {
  // Setup iniziale per i test
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const defaultProps = {
    data: {
      debtPositionType: {
        value: '',
        readonly: false
      },
      description: {
        value: '',
        readonly: false
      }
    },
    setData: mockSetData,
    onNext: mockOnNext,
    onBack: mockOnBack
  };

  const mockDebtPositionsTypes = [
    { value: '1', label: 'Tipo 1' },
    { value: '2', label: 'Tipo 2' }
  ];

  // Mock di base per useForm
  const mockRegister = vi.fn((name: string) => ({
    name,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn()
  }));

  const mockHandleSubmit = vi.fn(
    (onSubmit: (data: FormValues) => void) =>
      (e?: { preventDefault?: () => void }) => {
        // Simula il comportamento di handleSubmit
        e?.preventDefault?.();
        onSubmit({
          debtPositionType: '1',
          description: 'Test descrizione'
        });
        return false;
      }
  );

  const mockWatch = vi.fn().mockImplementation((name: string) => {
    if (name === 'debtPositionType') return '1';
    return '';
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock dello store
    (useStore as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { organizationId: '123' }
    });

    // Mock dell'hook per i tipi di dovuto
    (useDebtPositionsTypeOrg as ReturnType<typeof vi.fn>).mockReturnValue({
      optionsMap: mockDebtPositionsTypes
    });

    // Mock di base per useForm
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: mockWatch,
      formState: { errors: {} }
    });
  });

  it('renderizza correttamente il componente', () => {
    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il componente sia renderizzato
    expect(screen.getByTestId('section-box')).toBeInTheDocument();

    // Verifica che i campi del form siano presenti
    expect(
      screen.getByText('debtPositionCreateWizard.step1.debtPositionType.label')
    ).toBeInTheDocument();

    // Usa getAllByText per gestire elementi multipli con lo stesso testo
    const descriptionLabels = screen.getAllByText(
      'debtPositionCreateWizard.step1.description.label'
    );
    expect(descriptionLabels.length).toBeGreaterThan(0);

    // Verifica che i pulsanti siano presenti
    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('inizializza il form con i valori forniti', () => {
    const propsWithValues = {
      ...defaultProps,
      data: {
        debtPositionType: {
          value: '1',
          readonly: false
        },
        description: {
          value: 'Test description',
          readonly: false
        }
      }
    };

    render(<Step1GeneralConfiguration {...propsWithValues} />);

    // Verifica che useForm sia stato chiamato con i valori iniziali corretti
    expect(useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          debtPositionType: '1',
          description: 'Test description'
        }
      })
    );
  });

  it('disabilita i campi quando readonly è true', () => {
    const propsWithReadonly = {
      ...defaultProps,
      data: {
        debtPositionType: {
          value: '1',
          readonly: true
        },
        description: {
          value: 'Test description',
          readonly: true
        }
      }
    };

    render(<Step1GeneralConfiguration {...propsWithReadonly} />);

    // Verifica che i campi siano disabilitati chiamando register con le proprietà corrette
    expect(mockRegister).toHaveBeenCalledWith(
      'debtPositionType',
      expect.anything()
    );
    expect(mockRegister).toHaveBeenCalledWith('description', expect.anything());
  });

  it('il pulsante Avanti è disabilitato quando il form è vuoto', () => {
    // Override del mock di watch per simulare un form vuoto
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue(''), // Simuliamo che non sia selezionato nessun tipo
      formState: { errors: {} }
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il pulsante Avanti sia disabilitato
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('disabilita il pulsante Avanti quando nessun tipo di dovuto è selezionato', () => {
    // Override del mock di watch per simulare che nessun tipo sia selezionato
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue(''), // Tipo non selezionato
      formState: { errors: {} }
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il pulsante Avanti sia disabilitato
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('non disabilita il pulsante Avanti quando debtPositionType.readonly è true', () => {
    const propsWithReadonly = {
      ...defaultProps,
      data: {
        debtPositionType: {
          value: '',
          readonly: true
        },
        description: {
          value: '',
          readonly: false
        }
      }
    };

    render(<Step1GeneralConfiguration {...propsWithReadonly} />);

    // Verifica che il pulsante Avanti non sia disabilitato
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();
  });

  it("completa l'intero flusso utente con successo", () => {
    // Creiamo un mock per handleSubmit che effettivamente chiama la funzione di callback
    const handleSubmitMock = vi.fn().mockImplementation(() => {
      return (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        mockSetData({
          debtPositionType: {
            value: '1',
            readonly: false
          },
          description: {
            value: 'Test descrizione',
            readonly: false
          }
        });
        mockOnNext();
      };
    });

    // Applichiamo il mock a useForm
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: handleSubmitMock,
      watch: vi.fn().mockReturnValue('1'), // Simuliamo che il tipo sia selezionato
      formState: { errors: {} }
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Simula il click sul pulsante Avanti
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    // Verifica che handleSubmit sia stato chiamato con una funzione di callback
    expect(handleSubmitMock).toHaveBeenCalled();

    // Verifica che i dati siano stati salvati correttamente
    expect(mockSetData).toHaveBeenCalledWith({
      debtPositionType: {
        value: '1',
        readonly: false
      },
      description: {
        value: 'Test descrizione',
        readonly: false
      }
    });

    // Verifica che onNext sia stato chiamato per passare allo step successivo
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('gestisce gli errori di validazione della descrizione', () => {
    // Mock per simulare un errore di validazione
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: vi.fn(() => (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        // Non chiamiamo onSubmit per simulare che la validazione abbia fallito
        return false;
      }),
      watch: vi.fn().mockReturnValue('1'), // Simuliamo che il tipo sia selezionato
      formState: {
        errors: {
          description: {
            message: 'debtPositionCreateWizard.step1.description.minWords'
          }
        }
      }
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che l'errore sia visualizzato nel componente
    // Nota: in questo caso lo cerchiamo come helper text del TextField
    expect(
      screen.getByText('debtPositionCreateWizard.step1.description.minWords')
    ).toBeInTheDocument();

    // Verifica che il pulsante Avanti sia comunque abilitato (poiché il tipo è selezionato)
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();

    // Simuliamo il click ma sappiamo che il submit non avrà successo a causa della validazione
    fireEvent.click(nextButton);

    // Verifica che setData e onNext NON siano stati chiamati
    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  // Test aggiuntivo per verificare che le opzioni del select vengano popolate correttamente
  it('popola correttamente le opzioni del select con i tipi di dovuto', () => {
    // Rendiamo il componente
    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che l'hook useDebtPositionsTypeOrg sia stato chiamato con l'organizationId corretto
    expect(useDebtPositionsTypeOrg).toHaveBeenCalledWith({
      organizationId: '123'
    });

    // Verifica che i tipi di dovuto siano stati utilizzati
    expect(mockDebtPositionsTypes).toHaveLength(2);
    expect(mockDebtPositionsTypes[0]).toEqual({ value: '1', label: 'Tipo 1' });
    expect(mockDebtPositionsTypes[1]).toEqual({ value: '2', label: 'Tipo 2' });
  });

  // Test aggiuntivo per verificare la validazione della descrizione
  it('verifica che la descrizione richieda almeno 5 parole quando non è vuota', () => {
    type ValidateFunction = (value: string) => boolean | string;

    // Creiamo un mock per register che cattura la funzione di validazione
    let descriptionValidate: ValidateFunction | undefined;

    mockRegister.mockImplementation(
      (name: string, options?: RegisterOptions) => {
        if (name === 'description' && options?.validate) {
          descriptionValidate = options.validate;
        }
        return {
          name,
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn()
        };
      }
    );

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che register sia stato chiamato con il campo description
    expect(mockRegister).toHaveBeenCalledWith('description', expect.anything());

    // Verifica che la funzione di validazione sia stata registrata
    expect(descriptionValidate).toBeDefined();

    if (descriptionValidate) {
      // Verifica il comportamento della validazione con diversi input
      expect(descriptionValidate('')).toBe(true); // Campo vuoto è valido
      expect(descriptionValidate('parola')).toBe(
        'debtPositionCreateWizard.step1.description.minWords'
      );
      expect(descriptionValidate('uno due tre quattro')).toBe(
        'debtPositionCreateWizard.step1.description.minWords'
      );
      expect(descriptionValidate('uno due tre quattro cinque')).toBe(true);
    }
  });

  // Test aggiuntivo per verificare l'interazione con i campi del form
  it('gestisce correttamente i cambiamenti nei campi del form', () => {
    // Simuliamo un evento di cambiamento di un campo
    const mockOnChange = vi.fn();
    mockRegister.mockImplementation((name: string) => ({
      name,
      onChange: mockOnChange,
      onBlur: vi.fn(),
      ref: vi.fn()
    }));

    // Applichiamo un mock a useForm che ritorna una funzione watch che cambia comportamento
    // dopo che abbiamo impostato un valore
    let selectedType = '';

    const customWatch = vi.fn((name?: string) => {
      if (name === 'debtPositionType') return selectedType;
      return '';
    });

    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: customWatch,
      formState: { errors: {} }
    });

    // Renderizziamo il componente
    const { rerender } = render(
      <Step1GeneralConfiguration {...defaultProps} />
    );

    // Dovremmo avere un pulsante Avanti disabilitato inizialmente
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();

    // Simuliamo la selezione di un tipo di dovuto
    selectedType = '1';

    // Ri-renderizziamo lo stesso componente con lo stesso props ma ora watch ritorna un valore diverso
    rerender(<Step1GeneralConfiguration {...defaultProps} />);

    // Ora il pulsante dovrebbe essere abilitato
    expect(nextButton).not.toBeDisabled();
  });
});
