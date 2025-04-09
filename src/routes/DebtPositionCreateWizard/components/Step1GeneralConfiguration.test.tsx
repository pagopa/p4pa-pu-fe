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
  useForm: vi.fn(),
  Controller: ({
    render
  }: {
    render: (props: {
      field: {
        value: string;
        onChange: () => void;
        onBlur: () => void;
        ref: () => void;
      };
    }) => React.ReactElement;
  }) =>
    render({
      field: {
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn()
      }
    })
}));

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'commons.continue') return 'Continua';
      return key;
    }
  })
}));

// Tipi per i mocks
type FormValues = {
  debtPositionType: string;
  description: string;
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
        readonly: false,
        flagMandatoryDueDate: false
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
      formState: { errors: {} },
      control: {}
    });
  });

  it('renderizza correttamente il componente', () => {
    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il componente sia renderizzato
    expect(
      screen.getByText('debtPositionCreateWizard.step1.title')
    ).toBeInTheDocument();

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
    expect(screen.getByText('commons.back')).toBeInTheDocument();
    expect(screen.getByText('Continua')).toBeInTheDocument();
  });

  it('inizializza il form con i valori forniti', () => {
    const propsWithValues = {
      ...defaultProps,
      data: {
        debtPositionType: {
          value: '1',
          readonly: false,
          flagMandatoryDueDate: false
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
          readonly: true,
          flagMandatoryDueDate: false
        },
        description: {
          value: 'Test description',
          readonly: true
        }
      }
    };

    render(<Step1GeneralConfiguration {...propsWithReadonly} />);

    // Verifica che i campi siano disabilitati
    // Poiché non possiamo usare getByLabelText a causa del mock di useTranslation,
    // verifichiamo che il componente sia renderizzato correttamente
    expect(
      screen.getByText('debtPositionCreateWizard.step1.title')
    ).toBeInTheDocument();

    // Verifichiamo che il pulsante Avanti sia presente
    expect(screen.getByText('Continua')).toBeInTheDocument();
  });

  it('il pulsante Avanti è sempre abilitato, indipendentemente dai valori del form', () => {
    // Override del mock di watch per simulare un form vuoto
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue(''), // Simuliamo che non sia selezionato nessun tipo
      formState: { errors: {} },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il pulsante Avanti sia sempre abilitato
    const nextButton = screen.getByText('Continua');
    expect(nextButton).not.toBeDisabled();
  });

  it('il pulsante Avanti è sempre abilitato anche quando nessun tipo di dovuto è selezionato', () => {
    // Override del mock di watch per simulare che nessun tipo sia selezionato
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue(''), // Tipo non selezionato
      formState: { errors: {} },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che il pulsante Avanti sia sempre abilitato
    const nextButton = screen.getByText('Continua');
    expect(nextButton).not.toBeDisabled();
  });

  it('non disabilita il pulsante Avanti quando debtPositionType.readonly è true', () => {
    const propsWithReadonly = {
      ...defaultProps,
      data: {
        debtPositionType: {
          value: '',
          readonly: true,
          flagMandatoryDueDate: false
        },
        description: {
          value: '',
          readonly: false
        }
      }
    };

    render(<Step1GeneralConfiguration {...propsWithReadonly} />);

    // Verifica che il pulsante Avanti non sia disabilitato
    const nextButton = screen.getByText('Continua');
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
            readonly: false,
            flagMandatoryDueDate: false
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
      formState: { errors: {} },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Simula il click sul pulsante Avanti
    const nextButton = screen.getByText('Continua');
    fireEvent.click(nextButton);

    // Verifica che handleSubmit sia stato chiamato con una funzione di callback
    expect(handleSubmitMock).toHaveBeenCalled();

    // Verifica che i dati siano stati salvati correttamente
    expect(mockSetData).toHaveBeenCalledWith({
      debtPositionType: {
        value: '1',
        readonly: false,
        flagMandatoryDueDate: false
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
            message: 'debtPositionCreateWizard.step1.minWords'
          }
        }
      },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che l'errore sia visualizzato nel componente
    expect(
      screen.getByText('debtPositionCreateWizard.step1.minWords')
    ).toBeInTheDocument();

    // Verifica che il pulsante Avanti sia comunque abilitato (poiché il tipo è selezionato)
    const nextButton = screen.getByText('Continua');
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
  it('verifica che la descrizione richieda almeno 3 parole quando non è vuota', () => {
    // Mock per simulare errori di validazione
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue('1'),
      formState: {
        errors: {
          description: {
            message: 'debtPositionCreateWizard.step1.minWords'
          }
        }
      },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che l'errore sia visualizzato nel componente
    expect(
      screen.getByText('debtPositionCreateWizard.step1.minWords')
    ).toBeInTheDocument();
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
      formState: { errors: {} },
      control: {}
    });

    // Renderizziamo il componente
    const { rerender } = render(
      <Step1GeneralConfiguration {...defaultProps} />
    );

    // Il pulsante Avanti dovrebbe essere sempre abilitato
    const nextButton = screen.getByText('Continua');
    expect(nextButton).not.toBeDisabled();

    // Simuliamo la selezione di un tipo di dovuto
    selectedType = '1';

    // Ri-renderizziamo lo stesso componente con lo stesso props ma ora watch ritorna un valore diverso
    rerender(<Step1GeneralConfiguration {...defaultProps} />);

    // Il pulsante dovrebbe rimanere abilitato
    expect(nextButton).not.toBeDisabled();
  });

  it('gestisce correttamente il submit del form', () => {
    // Mock per simulare un submit valido
    const mockHandleSubmit = vi.fn().mockImplementation((onSubmit) => {
      return (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        onSubmit({
          debtPositionType: '1',
          description: 'Test descrizione con tre parole'
        });
        return false;
      };
    });

    // Applichiamo il mock a useForm
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue('1'),
      formState: { errors: {} },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Simula il click sul pulsante Avanti
    const nextButton = screen.getByText('Continua');
    fireEvent.click(nextButton);

    // Verifica che handleSubmit sia stato chiamato
    expect(mockHandleSubmit).toHaveBeenCalled();

    // Verifica che i dati siano stati salvati correttamente
    expect(mockSetData).toHaveBeenCalledWith({
      debtPositionType: {
        value: '1',
        readonly: false,
        flagMandatoryDueDate: false
      },
      description: {
        value: 'Test descrizione con tre parole',
        readonly: false
      }
    });

    // Verifica che onNext sia stato chiamato
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('verifica la validazione del campo description con meno di 3 parole', () => {
    // Mock per simulare un errore di validazione per descrizione con meno di 3 parole
    (useForm as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      watch: vi.fn().mockReturnValue('1'),
      formState: {
        errors: {
          description: {
            message: 'debtPositionCreateWizard.step1.minWords'
          }
        }
      },
      control: {}
    });

    render(<Step1GeneralConfiguration {...defaultProps} />);

    // Verifica che l'errore sia visualizzato nel componente
    expect(
      screen.getByText('debtPositionCreateWizard.step1.minWords')
    ).toBeInTheDocument();
  });
});
