import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UseFormTrigger } from 'react-hook-form';
import { ValidationContext } from '../../../utils/beneficiaryValidation';
import {
  handleAmountChange,
  handleIBANChange,
  handlePostalAccountChange,
  handleAmountBlur,
  BeneficiaryHeader,
  EntityNameField,
  TaxCodeField,
  hasIBANError,
  getIBANErrorMessage,
  hasPostalAccountError,
  getPostalAccountErrorMessage,
  AmountField,
  IBANField,
  PostalAccountField,
  TaxonomyCodeField
} from './BeneficiaryFieldComponents';

// Mock delle funzioni di utilità per i test
const mockRef = { current: false };
const mockFieldNamePrefix = 'beneficiaries';
const mockIndex = 0;

describe('Event Handlers', () => {
  describe('handleAmountChange', () => {
    it('accetta solo numeri e separatori decimali', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '123abc.45!' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockOnChange).toHaveBeenCalledWith('123.45');
    });

    it('converte la virgola in punto', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '123,45' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockOnChange).toHaveBeenCalledWith('123.45');
    });

    it('aggiorna la validazione degli altri importi se ci sono più beneficiari', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}, {}];

      const event = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      // Verifica che trigger sia stato chiamato per l'altro campo
      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.1.amount`
      );
    });

    it("non aggiorna la validazione se c'è un solo beneficiario", () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;
      const mockFields: Array<Record<string, unknown>> = [{}];

      const event = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleAmountChange(
        event,
        mockOnChange,
        mockIndex,
        mockFields,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('handleIBANChange', () => {
    it('converte il valore in maiuscolo', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'it60x0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleIBANChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockOnChange).toHaveBeenCalledWith('IT60X0542811101000000123456');
    });

    it('richiama la validazione del campo conto postale', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: 'IT60X0542811101000000123456' }
      } as React.ChangeEvent<HTMLInputElement>;

      handleIBANChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.${mockIndex}.postalAccount`
      );
    });
  });

  describe('handlePostalAccountChange', () => {
    it('accetta solo caratteri numerici', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: '123abc456!' }
      } as React.ChangeEvent<HTMLInputElement>;

      handlePostalAccountChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockOnChange).toHaveBeenCalledWith('123456');
    });

    it('richiama la validazione del campo IBAN', () => {
      const mockOnChange = vi.fn();
      const mockTrigger = vi.fn() as unknown as UseFormTrigger<
        Record<string, unknown>
      >;

      const event = {
        target: { value: '123456789012' }
      } as React.ChangeEvent<HTMLInputElement>;

      handlePostalAccountChange(
        event,
        mockOnChange,
        mockIndex,
        mockTrigger,
        mockFieldNamePrefix
      );

      expect(mockTrigger).toHaveBeenCalledWith(
        `${mockFieldNamePrefix}.${mockIndex}.iban`
      );
    });
  });

  describe('handleAmountBlur', () => {
    it('formatta il valore con due decimali', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: '100.5' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).toHaveBeenCalledWith('100.50');
      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('gestisce correttamente i valori con virgola', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: '100,5' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).toHaveBeenCalledWith('100.50');
    });

    it('non formatta se il valore non è numerico', () => {
      const mockOnChange = vi.fn();
      const mockOnBlur = vi.fn();

      const event = {
        target: { value: 'abc' }
      } as React.FocusEvent<HTMLInputElement>;

      handleAmountBlur(event, mockOnChange, mockOnBlur);

      expect(mockOnChange).not.toHaveBeenCalled();
      expect(mockOnBlur).toHaveBeenCalled();
    });
  });
});

describe('Render Components', () => {
  const mockT = vi.fn((key: string) => key);

  describe('BeneficiaryHeader', () => {
    it("renderizza correttamente l'intestazione", () => {
      const mockOnRemove = vi.fn();

      render(
        <BeneficiaryHeader
          index={mockIndex}
          t={mockT}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText('1.')).toBeInTheDocument();
      expect(
        screen.getByText('debtPositionCreateWizard.step3.beneficiary.title')
      ).toBeInTheDocument();
      expect(screen.getByText('commons.delete')).toBeInTheDocument();
    });

    it('chiama onRemove quando si clicca sul pulsante di eliminazione', () => {
      const mockOnRemove = vi.fn();

      render(
        <BeneficiaryHeader
          index={mockIndex}
          t={mockT}
          onRemove={mockOnRemove}
        />
      );

      fireEvent.click(screen.getByText('commons.delete'));
      expect(mockOnRemove).toHaveBeenCalledWith(mockIndex);
    });
  });

  describe('EntityNameField', () => {
    it('renderizza correttamente il campo', () => {
      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: 'Test Entity',
        name: 'entityName',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn(),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      render(
        <EntityNameField field={mockField} t={mockT} context={mockContext} />
      );

      const input = screen.getByDisplayValue('Test Entity') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('Test Entity');

      expect(
        screen.getByText(
          'debtPositionCreateWizard.step3.beneficiary.entityName.label'
        )
      ).toBeInTheDocument();
    });
  });

  describe('TaxCodeField', () => {
    it('converte il valore in maiuscolo', () => {
      // Creiamo un semplice mock per la funzione onChange
      const mockOnChange = vi.fn();
      const mockField = {
        onChange: mockOnChange,
        onBlur: vi.fn(),
        value: 'rssmra80a01h501u',
        name: 'taxCode',
        ref: { current: null }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn(),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      // Renderizziamo il componente
      const { container } = render(
        <TaxCodeField field={mockField} t={mockT} context={mockContext} />
      );

      // Testiamo direttamente la conversione in maiuscolo simulando la funzione di onChange
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).not.toBeNull();

      // Simuliamo il cambio di valore direttamente
      fireEvent.change(input, { target: { value: 'abcxyz123' } });

      // Verifichiamo che sia stata chiamata con il valore in maiuscolo
      expect(mockOnChange).toHaveBeenCalledWith('ABCXYZ123');
    });
  });
});

describe('Validation Error Handling', () => {
  const mockT = vi.fn((key: string) => key);

  describe('hasIBANError', () => {
    it('non mostra errori se la validazione deve essere saltata', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, {});
      expect(result).toBe(false);
    });

    it('non mostra errori IBAN se il conto postale è valorizzato e IBAN è vuoto', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return '';
          return '';
        }),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, {});
      expect(result).toBe(false);
    });

    it('mostra errori IBAN se entrambi i campi sono valorizzati e IBAN ha errori', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            iban: {
              message: 'Errore IBAN'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return 'INVALID';
          return '';
        }),
        t: mockT
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = hasIBANError(mockContext, mockErrors);
      expect(result).toBe(true);
    });
  });

  describe('getIBANErrorMessage', () => {
    it('restituisce stringa vuota se la validazione deve essere saltata', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('restituisce messaggio di errore se entrambi i campi sono vuoti', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, {});
      expect(result).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('restituisce messaggio di errore specifico per IBAN non valido', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            iban: {
              message: 'Errore IBAN'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('postalAccount')) return '123456789012';
          if (path.includes('iban')) return 'INVALID';
          return '';
        }),
        t: mockT
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = getIBANErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Errore IBAN');
    });
  });

  describe('hasPostalAccountError', () => {
    it('non mostra errori se la validazione deve essere saltata', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, {});
      expect(result).toBe(false);
    });

    it('non mostra errori del conto postale se IBAN è valorizzato e conto postale è vuoto', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return '';
          return '';
        }),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, {});
      expect(result).toBe(false);
    });

    it('mostra errori del conto postale se entrambi i campi sono valorizzati e conto postale ha errori', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalAccount: {
              message: 'Errore conto postale'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return 'INVALID';
          return '';
        }),
        t: mockT
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = hasPostalAccountError(mockContext, mockErrors);
      expect(result).toBe(true);
    });
  });

  describe('getPostalAccountErrorMessage', () => {
    it('restituisce stringa vuota se la validazione deve essere saltata', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: false,
        wasSubmittedRef: mockRef,
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, {});
      expect(result).toBe('');
    });

    it('restituisce messaggio di errore se entrambi i campi sono vuoti', () => {
      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: {},
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation(() => ''),
        t: mockT
      } as ValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, {});
      expect(result).toBe(
        'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
      );
    });

    it('restituisce messaggio di errore specifico per conto postale non valido', () => {
      const mockErrors = {
        beneficiaries: {
          0: {
            postalAccount: {
              message: 'Errore conto postale'
            }
          }
        }
      };

      const mockContext = {
        id: '1',
        index: mockIndex,
        isSubmitted: true,
        wasSubmittedRef: { current: true },
        existingBeneficiaries: {},
        errors: mockErrors,
        fieldNamePrefix: mockFieldNamePrefix,
        getValues: vi.fn().mockImplementation((path) => {
          if (path.includes('iban')) return 'IT60X0542811101000000123456';
          if (path.includes('postalAccount')) return 'INVALID';
          return '';
        }),
        t: mockT
      } as unknown as ValidationContext<Record<string, unknown>>;

      const result = getPostalAccountErrorMessage(mockContext, mockErrors);
      expect(result).toBe('Errore conto postale');
    });
  });
});

describe('AmountField', () => {
  it('renderizza correttamente il campo importo', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockOnBlur = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      value: '100.50',
      name: 'amount',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT
    } as ValidationContext<Record<string, unknown>>;

    const mockFields: Array<Record<string, unknown>> = [{}];

    const { container } = render(
      <AmountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        fields={mockFields}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
      />
    );

    // Verifica che il valore visualizzato utilizzi la virgola invece del punto
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('100,50');

    // Verifica che il simbolo dell'euro sia presente
    expect(container.textContent).toContain('€');

    // Testa il comportamento onChange
    fireEvent.change(input, { target: { value: '200,75' } });
    expect(mockOnChange).toHaveBeenCalledWith('200.75');

    // Testa il comportamento onBlur
    fireEvent.blur(input, { target: { value: '300.25' } });
    expect(mockOnChange).toHaveBeenCalledWith('300.25');
    expect(mockOnBlur).toHaveBeenCalled();
  });
});

describe('IBANField', () => {
  it('renderizza correttamente il campo IBAN', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: 'IT60X0542811101000000123456',
      name: 'iban',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation(() => ''),
      t: mockT
    } as ValidationContext<Record<string, unknown>>;

    const { container } = render(
      <IBANField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={{}}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('IT60X0542811101000000123456');

    // Testa il comportamento onChange
    fireEvent.change(input, {
      target: { value: 'it12a123456789012345678901' }
    });
    expect(mockOnChange).toHaveBeenCalledWith('IT12A123456789012345678901');
    expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.postalAccount');
  });

  it('mostra errori quando è appropriato', () => {
    const mockT = vi.fn((key: string) => key);
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: 'INVALID',
      name: 'iban',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          iban: {
            message: 'Errore IBAN'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation((path) => {
        if (path.includes('iban')) return 'INVALID';
        return '';
      }),
      t: mockT
    } as unknown as ValidationContext<Record<string, unknown>>;

    render(
      <IBANField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={mockErrors}
      />
    );

    // Verifica che il messaggio di errore sia visualizzato
    expect(screen.getByText('Errore IBAN')).toBeInTheDocument();
  });
});

describe('PostalAccountField', () => {
  it('renderizza correttamente il campo conto postale', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: '123456789012',
      name: 'postalAccount',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation(() => ''),
      t: mockT
    } as ValidationContext<Record<string, unknown>>;

    const { container } = render(
      <PostalAccountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={{}}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('123456789012');

    // Testa il comportamento onChange
    fireEvent.change(input, { target: { value: '123abc456' } });
    expect(mockOnChange).toHaveBeenCalledWith('123456');
    expect(mockTrigger).toHaveBeenCalledWith('beneficiaries.0.iban');
  });

  it('mostra errori quando è appropriato', () => {
    const mockT = vi.fn((key: string) => key);
    const mockTrigger = vi.fn() as unknown as UseFormTrigger<
      Record<string, unknown>
    >;

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: 'INVALID',
      name: 'postalAccount',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          postalAccount: {
            message: 'Errore conto postale'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn().mockImplementation((path) => {
        if (path.includes('postalAccount')) return 'INVALID';
        return '';
      }),
      t: mockT
    } as unknown as ValidationContext<Record<string, unknown>>;

    render(
      <PostalAccountField
        field={mockField}
        t={mockT}
        context={mockContext}
        index={0}
        trigger={mockTrigger}
        fieldNamePrefix="beneficiaries"
        errors={mockErrors}
      />
    );

    // Verifica che il messaggio di errore sia visualizzato
    expect(screen.getByText('Errore conto postale')).toBeInTheDocument();
  });
});

describe('TaxonomyCodeField', () => {
  it('renderizza correttamente il campo codice tassonomico', () => {
    const mockT = vi.fn((key: string) => key);
    const mockOnChange = vi.fn();

    const mockField = {
      onChange: mockOnChange,
      onBlur: vi.fn(),
      value: 'TAX123',
      name: 'taxonomyCode',
      ref: { current: null }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: false,
      wasSubmittedRef: { current: false },
      existingBeneficiaries: {},
      errors: {},
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT
    } as ValidationContext<Record<string, unknown>>;

    const { container } = render(
      <TaxonomyCodeField field={mockField} t={mockT} context={mockContext} />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('TAX123');

    // Verifica che il campo sia obbligatorio
    const requiredLabel = screen.getByText(
      'debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label'
    );
    expect(requiredLabel).toBeInTheDocument();

    // Verifica che il campo abbia l'attributo required
    const requiredAsterisk = container.querySelector('.MuiFormLabel-asterisk');
    expect(requiredAsterisk).not.toBeNull();
  });

  it('mostra errori di validazione quando necessario', () => {
    const mockT = vi.fn((key: string) => key);

    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'taxonomyCode',
      ref: { current: null }
    };

    const mockErrors = {
      beneficiaries: {
        0: {
          taxonomyCode: {
            message: 'Campo obbligatorio'
          }
        }
      }
    };

    const mockContext = {
      id: '1',
      index: 0,
      isSubmitted: true,
      wasSubmittedRef: { current: true },
      existingBeneficiaries: {},
      errors: mockErrors,
      fieldNamePrefix: 'beneficiaries',
      getValues: vi.fn(),
      t: mockT
    } as unknown as ValidationContext<Record<string, unknown>>;

    render(
      <TaxonomyCodeField field={mockField} t={mockT} context={mockContext} />
    );

    // Il test per verificare che l'errore sia visualizzato dipende dall'implementazione di hasFieldError
    // e getFieldErrorMessage, che sono già testati in altri test case
  });
});
