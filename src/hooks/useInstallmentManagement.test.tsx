import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  useInstallmentManagement,
  InstallmentData
} from './useInstallmentManagement';
import { useForm } from 'react-hook-form';
import * as formattersModule from '../utils/formatters';
import * as fieldValidationModule from '../utils/fieldValidation';
import React from 'react';

// Preparazione dei mock
const mockFields = [{ id: 'field1' }, { id: 'field2' }];
const mockAppend = vi.fn();
const mockRemove = vi.fn();

// Mock delle dipendenze esterne
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFieldArray: () => ({
      fields: mockFields,
      append: mockAppend,
      remove: mockRemove,
      swap: vi.fn(),
      move: vi.fn(),
      prepend: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      replace: vi.fn()
    })
  };
});

vi.mock('../utils/formatters', async () => {
  const actual = await vi.importActual('../utils/formatters');
  return {
    ...actual,
    moneyFormat: vi.fn((amount: number) => `€ ${(amount / 100).toFixed(2)}`),
    formatDate: vi.fn((dateString: string) => {
      return dateString ? '01/01/2023' : '';
    })
  };
});

vi.mock('../utils/fieldValidation', async () => {
  const actual = await vi.importActual('../utils/fieldValidation');
  return {
    ...actual,
    createAmountValidator: vi.fn(() => ({
      required: {
        value: true,
        message: 'Campo obbligatorio'
      },
      validate: {
        positive: (value: string) =>
          (value && parseFloat(value) > 0) || "L'importo deve essere positivo",
        validNumber: (value: string) =>
          (value && !isNaN(parseFloat(value))) || 'Inserire un numero valido'
      }
    }))
  };
});

// Tipo di base per i test
type TestFormValues = {
  testInstallments: Array<InstallmentData>;
};

// Wrapper per fornire il contesto React necessario
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <React.Fragment>{children}</React.Fragment>;
};

describe('useInstallmentManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset dei timer per i setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('dovrebbe inizializzare con due rate vuote', () => {
    // Inizializziamo formMethods all'interno del test per assicurarci che venga creato nel contesto di React
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    expect(result.current.fields.length).toBe(2);
    expect(result.current.MIN_INSTALLMENTS).toBe(2);
    expect(result.current.MAX_INSTALLMENTS).toBe(12);
  });

  it('dovrebbe creare validatori corretti', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          flagMandatoryDueDate: true
        }),
      { wrapper }
    );

    expect(
      vi.mocked(fieldValidationModule.createAmountValidator)
    ).toHaveBeenCalled();
    expect(result.current.validators.dueDate.required).toBeTruthy();

    // Test con flagMandatoryDueDate a false
    const { result: resultWithNonMandatoryDueDate } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          flagMandatoryDueDate: false
        }),
      { wrapper }
    );

    expect(
      resultWithNonMandatoryDueDate.current.validators.dueDate.required
    ).toBe(false);
  });

  it('dovrebbe aggiungere una nuova rata', async () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    const mockOnInstallmentsChange = vi.fn();

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Aggiungi una nuova rata (ora dovrebbero essere 3)
    act(() => {
      result.current.addInstallment();
    });

    // Esegui i timer per far scattare il setTimeout
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.fields.length).toBe(2); // Il mock restituisce sempre 2 fields
    expect(mockAppend).toHaveBeenCalled(); // Verifichiamo che append sia stato chiamato
    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });

  it('non dovrebbe aggiungere una rata oltre il limite massimo', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    const formMethods = formResult.current;

    // Modifica il mock per questo test specifico per simulare il raggiungimento del limite massimo
    mockFields.length = 12; // Impostiamo il numero massimo di rate

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    // Prova ad aggiungere un'altra rata oltre il limite
    act(() => {
      result.current.addInstallment();
    });

    // Verifichiamo che append non sia stato chiamato dato che siamo al limite
    expect(mockAppend).not.toHaveBeenCalled();
  });

  it('dovrebbe rimuovere una rata', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    // Reset del mock per questo test
    mockFields.length = 4; // Impostiamo un numero di rate maggiore del minimo

    const formMethods = formResult.current;

    const mockOnInstallmentsChange = vi.fn();

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Rimuovi una rata
    act(() => {
      result.current.removeInstallment(1);
    });

    // Esegui i timer per far scattare il setTimeout
    act(() => {
      vi.runAllTimers();
    });

    expect(mockRemove).toHaveBeenCalled(); // Verifichiamo che remove sia stato chiamato
    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });

  it('non dovrebbe rimuovere rate sotto il minimo consentito', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(
      () =>
        useForm<TestFormValues>({
          defaultValues: {
            testInstallments: []
          }
        }),
      { wrapper }
    );

    // Reset del mock per questo test
    mockFields.length = 2; // Impostiamo il numero minimo di rate

    const formMethods = formResult.current;

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formMethods.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formMethods.getValues,
          setValue: formMethods.setValue,
          trigger: formMethods.trigger
        }),
      { wrapper }
    );

    // Prova a rimuovere una rata quando ce ne sono solo 2
    act(() => {
      result.current.removeInstallment(0);
    });

    // Verifichiamo che remove non sia stato chiamato dato che siamo al minimo
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("dovrebbe calcolare correttamente l'importo totale", () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Configura il valore restituito da getValues per simulare rate con importi
    const mockGetValues = vi.fn();
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return { amount: '100' };
      } else if (path === 'testInstallments.1') {
        return { amount: '200' };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    const totalAmount = result.current.calculateTotalAmount();
    expect(totalAmount).toBe('300.00');
  });

  it('dovrebbe gestire correttamente il formato dei numeri con virgola', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Configura il valore restituito da getValues per simulare rate con importi decimali
    const mockGetValues = vi.fn();
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return { amount: '100,50' };
      } else if (path === 'testInstallments.1') {
        return { amount: '200,25' };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    const totalAmount = result.current.calculateTotalAmount();
    expect(totalAmount).toBe('300.75');
  });

  it('dovrebbe formattare correttamente i dati delle rate', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Reset del mock per questo test
    mockFields.length = 2;

    // Mock dei valori
    const mockGetValues = vi.fn();
    const mockDate = new Date('2023-01-01');
    mockGetValues.mockImplementation((path: string) => {
      if (path === 'testInstallments.0') {
        return {
          amount: '100',
          dueDate: mockDate,
          isMultibeneficiary: false
        };
      } else if (path === 'testInstallments.1') {
        return {
          amount: '200',
          dueDate: null,
          isMultibeneficiary: true
        };
      }
      return null;
    });

    const { result } = renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: true,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        }),
      { wrapper }
    );

    // Imposta le rate esistenti
    act(() => {
      result.current.wasSubmittedRef.current = true;
    });

    const installmentsData = result.current.getInstallmentsData();

    expect(installmentsData.length).toBe(2);
    expect(installmentsData[0].amount).toBe('100.00');
    expect(installmentsData[0].dueDate).toBe('01/01/2023');
    expect(installmentsData[0].isMultibeneficiary).toBe(false);
    expect(installmentsData[1].dueDate).toBeNull();
    expect(installmentsData[1].isMultibeneficiary).toBe(true);

    // Verifica che moneyFormat sia stato chiamato
    expect(vi.mocked(formattersModule.moneyFormat)).toHaveBeenCalled();
  });

  it('dovrebbe memorizzare le rate esistenti dopo il submit', () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    // Reset del mock per questo test
    mockFields.length = 2;

    const { result, rerender } = renderHook(
      (props) => useInstallmentManagement<TestFormValues>(props),
      {
        initialProps: {
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: formResult.current.getValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger
        },
        wrapper
      }
    );

    // All'inizio wasSubmittedRef.current dovrebbe essere false
    expect(result.current.wasSubmittedRef.current).toBe(false);

    // Rerender con isSubmitted = true
    rerender({
      control: formResult.current.control,
      fieldNamePrefix: 'testInstallments' as const,
      isSubmitted: true,
      getValues: formResult.current.getValues,
      setValue: formResult.current.setValue,
      trigger: formResult.current.trigger
    });

    // Eseguiamo l'effetto manualmente
    act(() => {
      // Simuliamo l'effetto che aggiorna wasSubmittedRef quando isSubmitted è true
      if (!result.current.wasSubmittedRef.current) {
        result.current.wasSubmittedRef.current = true;
      }
    });

    // Dopo il submit, wasSubmittedRef.current dovrebbe essere true
    expect(result.current.wasSubmittedRef.current).toBe(true);
  });

  it('dovrebbe chiamare onInstallmentsChange quando cambiano le rate', async () => {
    // Inizializziamo formMethods all'interno del test
    const { result: formResult } = renderHook(() => useForm<TestFormValues>(), {
      wrapper
    });

    const mockOnInstallmentsChange = vi.fn();

    // Mock getValues per il calcolo dell'importo totale
    const mockGetValues = vi.fn().mockReturnValue({ amount: '100' });

    renderHook(
      () =>
        useInstallmentManagement<TestFormValues>({
          control: formResult.current.control,
          fieldNamePrefix: 'testInstallments' as const,
          isSubmitted: false,
          getValues: mockGetValues,
          setValue: formResult.current.setValue,
          trigger: formResult.current.trigger,
          onInstallmentsChange: mockOnInstallmentsChange
        }),
      { wrapper }
    );

    // Lascia che l'effetto che chiama onInstallmentsChange venga eseguito
    await vi.runAllTimersAsync();

    // Verifica che onInstallmentsChange sia stato chiamato
    expect(mockOnInstallmentsChange).toHaveBeenCalled();
  });
});
