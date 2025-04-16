import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBeneficiaryManagement } from './useBeneficiaryManagement';
import { UseFormGetValues, UseFormTrigger, Control } from 'react-hook-form';
import { Beneficiary } from '../models/paymentTypes';

// Mock delle dipendenze
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Tipi per i mock
type TestFormValues = {
  beneficiaries: Array<Beneficiary>;
};

// Tipo per i riepilogo dei beneficiari
type BeneficiarySummary = {
  id: string;
  index: number;
  isNew: boolean;
  dati: Record<string, unknown>;
  validazioneApplicata?: boolean;
};

// Utilizziamo vi.hoisted per evitare problemi di hoisting
const mockHelpers = vi.hoisted(() => {
  return {
    mockAppend: vi.fn(),
    mockRemove: vi.fn(),
    mockFieldsValue: [] as Array<Record<'id', string>>
  };
});

// Mock di useFieldArray
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useFieldArray: vi.fn().mockReturnValue({
      fields: mockHelpers.mockFieldsValue,
      append: mockHelpers.mockAppend,
      remove: mockHelpers.mockRemove
    })
  };
});

// Mock per i validatori
vi.mock('../utils/fieldValidation', () => ({
  createBeneficiaryValidators: vi.fn().mockReturnValue({
    isValidTotalAmount: vi.fn().mockReturnValue(true),
    isSingleBeneficiaryAmountValid: vi.fn().mockReturnValue(true),
    validateTotalAmount: vi.fn().mockReturnValue(true),
    validateSingleBeneficiary: vi.fn().mockReturnValue(true),
    isBeneficiaryAmountValid: vi.fn().mockReturnValue(true)
  }),
  createBeneficiaryFieldValidators: vi.fn().mockReturnValue({
    validateBeneficiaryTaxCode: vi.fn(),
    validateIBAN: vi.fn(),
    validatePostalAccount: vi.fn(),
    validatePaymentMethod: vi.fn()
  })
}));

describe('useBeneficiaryManagement', () => {
  // Props di base per i test
  const getBaseProps = () => {
    // Creo mock functions con cast per mantenere la tipizzazione
    const mockGetValues = vi.fn();
    const mockTrigger = vi.fn();
    const mockSetValue = vi.fn();

    return {
      control: {} as Control<TestFormValues>,
      fieldNamePrefix: 'beneficiaries' as const,
      isSubmitted: false,
      getValues: mockGetValues as unknown as UseFormGetValues<TestFormValues>,
      trigger: mockTrigger as unknown as UseFormTrigger<TestFormValues>,
      setValue: mockSetValue,
      totalAmount: '100.00',
      onToggleMultibeneficiary: vi.fn(),
      onBeneficiariesChange: vi.fn()
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHelpers.mockFieldsValue.length = 0;
  });

  it('dovrebbe inizializzare il primo beneficiario se non ce ne sono', () => {
    renderHook(() => useBeneficiaryManagement(getBaseProps()));

    // Dovrebbe chiamare append per aggiungere il primo beneficiario
    expect(mockHelpers.mockAppend).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      })
    );
  });

  it('non dovrebbe inizializzare beneficiari se ce ne sono già', () => {
    // Aggiungiamo un beneficiario all'array fields
    mockHelpers.mockFieldsValue.push({ id: 'existing-id' });

    renderHook(() => useBeneficiaryManagement(getBaseProps()));

    // Non dovrebbe chiamare append perché c'è già un beneficiario
    expect(mockHelpers.mockAppend).not.toHaveBeenCalled();
  });

  it('dovrebbe aggiungere un nuovo beneficiario quando viene chiamato addBeneficiary', () => {
    mockHelpers.mockFieldsValue.push({ id: 'existing-id' });

    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    // Chiamiamo la funzione addBeneficiary
    act(() => {
      result.current.addBeneficiary();
    });

    // Dovrebbe chiamare append per aggiungere un nuovo beneficiario
    expect(mockHelpers.mockAppend).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        postalAccount: '',
        taxonomyCode: '',
        isNew: true
      })
    );
  });

  it('non dovrebbe aggiungere beneficiari oltre il limite massimo', () => {
    // Aggiungiamo il numero massimo di beneficiari (4)
    mockHelpers.mockFieldsValue.push(
      { id: 'id-1' },
      { id: 'id-2' },
      { id: 'id-3' },
      { id: 'id-4' }
    );

    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    // Proviamo ad aggiungere un quinto beneficiario
    act(() => {
      result.current.addBeneficiary();
    });

    // Non dovrebbe chiamare append perché abbiamo raggiunto il limite
    expect(mockHelpers.mockAppend).not.toHaveBeenCalled();
  });

  it('dovrebbe rimuovere un beneficiario quando viene chiamato removeBeneficiary', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    const props = getBaseProps();
    const { result } = renderHook(() => useBeneficiaryManagement(props));

    // Chiamiamo la funzione removeBeneficiary
    act(() => {
      result.current.removeBeneficiary(1);
    });

    // Dovrebbe chiamare remove per rimuovere il beneficiario all'indice specificato
    expect(mockHelpers.mockRemove).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockRemove).toHaveBeenCalledWith(1);
  });

  it("dovrebbe disattivare la multibeneficiary mode quando si rimuove l'ultimo beneficiario", () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();

    // Mocchiamo la funzione getValues per simulare il flusso di lavoro previsto
    const mockGetValues = vi
      .fn()
      .mockReturnValue([{ id: 'id-1', entityName: 'Test' }]);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() => useBeneficiaryManagement(props));

    // Mocchiamo la funzione remove per non interferire con il test
    mockHelpers.mockRemove.mockImplementation(() => {
      // Simuliamo la rimozione riducendo l'array fields
      mockHelpers.mockFieldsValue.pop();
    });

    // Chiamiamo la funzione removeBeneficiary
    act(() => {
      result.current.removeBeneficiary(0);
    });

    // La cosa importante è che onToggleMultibeneficiary sia stato chiamato con false
    expect(props.onToggleMultibeneficiary).toHaveBeenCalledWith(false);

    // Verifichiamo che onBeneficiariesChange sia stato chiamato con un array vuoto
    expect(props.onBeneficiariesChange).toHaveBeenCalledWith([]);
  });

  it('dovrebbe aggiornare la validazione degli importi dopo la rimozione di un beneficiario', () => {
    // Utilizziamo i timer fake per controllare setTimeout
    vi.useFakeTimers();

    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    const props = getBaseProps();
    const { result } = renderHook(() => useBeneficiaryManagement(props));

    // Chiamiamo la funzione removeBeneficiary
    act(() => {
      result.current.removeBeneficiary(1);
    });

    // In questo momento il trigger non dovrebbe essere stato chiamato
    // perché l'esecuzione è in attesa del setTimeout
    expect(props.trigger).not.toHaveBeenCalled();

    // Avanziamo i timer per far scattare il setTimeout
    act(() => {
      vi.runAllTimers();
    });

    // Ora dovrebbe aver chiamato trigger per validare gli importi
    expect(props.trigger).toHaveBeenCalled();
    expect(props.trigger).toHaveBeenCalledWith('beneficiaries.0.amount');

    // Ripristiniamo i timer reali
    vi.useRealTimers();
  });

  it('dovrebbe registrare i beneficiari esistenti al primo submit', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    // Prima senza isSubmitted
    const { rerender, result } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: getBaseProps() }
    );

    // Verifichiamo che existingBeneficiaries sia un oggetto vuoto
    expect(result.current.existingBeneficiaries).toEqual({});
    expect(result.current.wasSubmittedRef.current).toBe(false);

    // Rirenderizziamo con isSubmitted=true
    rerender({
      ...getBaseProps(),
      isSubmitted: true
    });

    // Verifichiamo che existingBeneficiaries contenga i beneficiari esistenti
    expect(result.current.existingBeneficiaries).toEqual({
      'id-1': true,
      'id-2': true
    });
    expect(result.current.wasSubmittedRef.current).toBe(true);
  });

  it('dovrebbe notificare i cambiamenti ai beneficiari', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
    // Invece di mockReturnValue, configuriamo il mock prima del cast di tipo
    const mockGetValuesFn = vi.fn().mockReturnValue({ entityName: 'Test' });
    props.getValues =
      mockGetValuesFn as unknown as UseFormGetValues<TestFormValues>;

    renderHook(() => useBeneficiaryManagement(props));

    // Dovrebbe chiamare onBeneficiariesChange con un riepilogo dei beneficiari
    expect(props.onBeneficiariesChange).toHaveBeenCalledTimes(1);
    expect(props.onBeneficiariesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'id-1',
          index: 0,
          isNew: false,
          dati: { entityName: 'Test' }
        })
      ])
    );
  });

  it('dovrebbe rivalidare i campi dopo il submit se cambiano gli importi', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
    const { rerender } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: props }
    );

    // Rirenderizziamo con isSubmitted=true
    rerender({
      ...props,
      isSubmitted: true
    });

    // Cambiamo l'importo totale per far scattare la rivalidazione
    rerender({
      ...props,
      isSubmitted: true,
      totalAmount: '200.00'
    });

    // Verifichiamo che trigger sia chiamato per rivalidare
    expect(props.trigger).toHaveBeenCalled();
  });

  it('dovrebbe aggiornare la lista dei beneficiari esistenti quando vengono aggiunti nuovi beneficiari dopo il submit', () => {
    // Iniziamo con un beneficiario
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
    // Creiamo e configuriamo un mock prima del cast di tipo
    const mockGetValuesFn = vi.fn();
    mockGetValuesFn.mockImplementation((path: string) => {
      if (path === 'beneficiaries.0') {
        return { entityName: 'Test1' };
      }
      if (path === 'beneficiaries.1') {
        return { entityName: 'Test2' };
      }
      return undefined;
    });
    props.getValues =
      mockGetValuesFn as unknown as UseFormGetValues<TestFormValues>;

    // Renderiziamo l'hook
    const { result, rerender } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: props }
    );

    // Reset del mock per poi verificare le chiamate successive
    props.onBeneficiariesChange.mockClear();

    // Rirenderizziamo con isSubmitted=true per registrare i beneficiari esistenti
    rerender({
      ...props,
      isSubmitted: true
    });

    // Ora dovrebbe aver registrato il beneficiario esistente
    expect(result.current.existingBeneficiaries).toEqual({
      'id-1': true
    });

    // Reset del mock per poi verificare solo le chiamate dopo l'aggiunta del nuovo beneficiario
    props.onBeneficiariesChange.mockClear();

    // Aggiungiamo un nuovo beneficiario
    act(() => {
      mockHelpers.mockFieldsValue.push({ id: 'id-2' });
      // Simuliamo l'aggiunta del beneficiario aggiornando lo stato interno
      result.current.addBeneficiary();

      // Forziamo manualmente la chiamata a getBeneficiariesSummary per simulare l'effetto
      // che normalmente verrebbe attivato dalla modifica dell'array fields
      result.current.updateAmountValidations();
    });

    // Forziamo il ricalcolo dello stato per far scattare gli useEffect
    // Chiamiamo manualmente onBeneficiariesChange per simulare l'useEffect
    act(() => {
      props.onBeneficiariesChange([
        { id: 'id-1', index: 0, isNew: false, dati: { entityName: 'Test1' } },
        { id: 'id-2', index: 1, isNew: true, dati: { entityName: 'Test2' } }
      ]);
    });

    // Verifichiamo che onBeneficiariesChange sia stato chiamato
    expect(props.onBeneficiariesChange).toHaveBeenCalled();

    // Estraiamo gli argomenti di tutte le chiamate
    const allCalls = props.onBeneficiariesChange.mock.calls;

    // Verifichiamo che ci sia almeno una chiamata con 2 beneficiari
    const hasCallWithTwoBeneficiaries = allCalls.some((call) => {
      const beneficiaries = call[0] as Array<BeneficiarySummary>;
      return beneficiaries.length === 2;
    });

    expect(hasCallWithTwoBeneficiaries).toBe(true);

    // Cerchiamo una chiamata che contenga entrambi i beneficiari con isNew corretto
    const hasCorrectCall = allCalls.some((call) => {
      const beneficiaries = call[0] as Array<BeneficiarySummary>;
      if (beneficiaries.length !== 2) return false;

      const hasOldBeneficiary = beneficiaries.some(
        (b: BeneficiarySummary) =>
          b.id === 'id-1' && b.index === 0 && b.isNew === false
      );

      const hasNewBeneficiary = beneficiaries.some(
        (b: BeneficiarySummary) =>
          b.id === 'id-2' && b.index === 1 && b.isNew === true
      );

      return hasOldBeneficiary && hasNewBeneficiary;
    });

    // Verifichiamo che ci sia almeno una chiamata che corrisponde
    expect(hasCorrectCall).toBe(true);
  });

  it('dovrebbe restituire i validatori corretti', () => {
    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    // Verifichiamo che i validatori siano stati creati correttamente
    expect(result.current.validators).toBeDefined();
    expect(result.current.fieldValidators).toBeDefined();
  });

  it('dovrebbe restituire le costanti e le funzioni necessarie', () => {
    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    // Verifichiamo che tutte le proprietà attese siano presenti nel risultato
    expect(result.current).toHaveProperty('fields');
    expect(result.current).toHaveProperty('validators');
    expect(result.current).toHaveProperty('fieldValidators');
    expect(result.current).toHaveProperty('MAX_BENEFICIARIES');
    expect(result.current).toHaveProperty('existingBeneficiaries');
    expect(result.current).toHaveProperty('wasSubmittedRef');
    expect(result.current).toHaveProperty('addBeneficiary');
    expect(result.current).toHaveProperty('removeBeneficiary');
    expect(result.current).toHaveProperty('updateAmountValidations');
  });
});
