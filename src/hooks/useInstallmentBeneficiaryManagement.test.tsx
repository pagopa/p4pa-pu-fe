import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Control,
  UseFormGetValues,
  UseFormTrigger,
  UseFormSetValue
} from 'react-hook-form';
import { Installment } from '../models/paymentTypes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const mockBeneficiaryManager = {
  fields: [],
  validators: {},
  fieldValidators: {},
  MAX_BENEFICIARIES: 4,
  existingBeneficiaries: {},
  wasSubmittedRef: { current: false },
  isInitializingRef: { current: false },
  addBeneficiary: vi.fn(),
  removeBeneficiary: vi.fn(),
  resetAllBeneficiaries: vi.fn(),
  updateAmountValidations: vi.fn(),
  getBeneficiaryPath: vi.fn()
};

vi.mock('./useBeneficiaryManagement', () => ({
  useBeneficiaryManagement: () => mockBeneficiaryManager
}));

import { useInstallmentBeneficiaryManagement } from './useInstallmentBeneficiaryManagement';

type TestFormValues = {
  installments: Array<Installment>;
};

const mockHelpers = vi.hoisted(() => {
  return {
    mockAppend: vi.fn(),
    mockRemove: vi.fn(),
    mockFieldsValue: [] as Array<Record<'id', string>>
  };
});

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

const VALUES_MAP = {
  DEFAULT_AMOUNT: '100.00',
  DIFFERENT_AMOUNT: '200.00',
  EMPTY_BENEFICIARIES: [] as Array<{ id: string }>,
  SAMPLE_BENEFICIARIES: [{ id: 'ben-1' }, { id: 'ben-2' }] as Array<{
    id: string;
  }>
};

type FormPathValue = { value: string | boolean | Array<{ id: string }> | null };

const createMockGetValues = (
  isMb: boolean,
  amount: string,
  beneficiaries: Array<{ id: string }>
) => {
  return (path: string): FormPathValue => {
    if (path.includes('amount')) {
      return { value: amount };
    }
    if (path.includes('isMultibeneficiary')) {
      return { value: isMb };
    }
    if (path.includes('beneficiaries')) {
      return { value: beneficiaries };
    }
    return { value: null };
  };
};

const defaultMockFn = (path: string): unknown => {
  const result = createMockGetValues(
    false,
    VALUES_MAP.DEFAULT_AMOUNT,
    VALUES_MAP.EMPTY_BENEFICIARIES
  )(path);
  return result.value;
};

const multibeneficiaryMockFn = (path: string): unknown => {
  const result = createMockGetValues(
    true,
    VALUES_MAP.DEFAULT_AMOUNT,
    VALUES_MAP.SAMPLE_BENEFICIARIES
  )(path);
  return result.value;
};

const differentAmountMockFn = (path: string): unknown => {
  const result = createMockGetValues(
    true,
    VALUES_MAP.DIFFERENT_AMOUNT,
    VALUES_MAP.EMPTY_BENEFICIARIES
  )(path);
  return result.value;
};

describe('useInstallmentBeneficiaryManagement', () => {
  const getBaseProps = () => {
    const mockGetValues = vi.fn(defaultMockFn);
    const mockTrigger = vi.fn();
    const mockSetValue = vi.fn();

    return {
      control: {} as Control<TestFormValues>,
      index: 0,
      installmentsFieldNamePrefix: 'installments' as const,
      isSubmitted: false,
      getValues: mockGetValues as unknown as UseFormGetValues<TestFormValues>,
      trigger: mockTrigger as unknown as UseFormTrigger<TestFormValues>,
      setValue: mockSetValue as unknown as UseFormSetValue<TestFormValues>,
      onToggleMultibeneficiary: vi.fn()
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dovrebbe inizializzare correttamente le proprietà', () => {
    const props = getBaseProps();

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    expect(result.current.isMultibeneficiary).toBe(false);
    expect(typeof result.current.toggleMultibeneficiary).toBe('function');
    expect(typeof result.current.validateBeneficiaryAmounts).toBe('function');
    expect(typeof result.current.handleInstallmentAmountChange).toBe(
      'function'
    );
    expect(typeof result.current.validatePaymentFields).toBe('function');
  });

  it('non dovrebbe validare i campi di pagamento se non è in modalità multibeneficiario', () => {
    const props = getBaseProps();

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    result.current.validatePaymentFields();

    expect(props.trigger).not.toHaveBeenCalled();
  });

  it('dovrebbe validare i campi di pagamento (IBAN e conto postale) in modalità multibeneficiario', () => {
    const props = getBaseProps();
    const mockGetValues = vi.fn(multibeneficiaryMockFn);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    result.current.validatePaymentFields();

    expect(props.trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.iban'
    );
    expect(props.trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.0.postalAccount'
    );
    expect(props.trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.1.iban'
    );
    expect(props.trigger).toHaveBeenCalledWith(
      'installments.0.beneficiaries.1.postalAccount'
    );
  });

  it('dovrebbe attivare la modalità multibeneficiario', () => {
    const props = getBaseProps();

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    expect(props.setValue).toHaveBeenCalledTimes(3);
    expect(props.setValue).toHaveBeenNthCalledWith(
      1,
      'installments.0.isMultibeneficiary',
      true
    );

    expect(props.onToggleMultibeneficiary).toHaveBeenCalledWith(true);
  });

  it('dovrebbe disattivare la modalità multibeneficiario e resettare i beneficiari', () => {
    const props = getBaseProps();
    const mockGetValues = vi.fn(multibeneficiaryMockFn);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(false);
    });

    expect(props.setValue).toHaveBeenNthCalledWith(
      1,
      'installments.0.isMultibeneficiary',
      false
    );

    expect(mockBeneficiaryManager.resetAllBeneficiaries).toHaveBeenCalled();
  });

  it('dovrebbe gestire il cambio di importo della rata', () => {
    const props = getBaseProps();
    const mockGetValues = vi.fn(multibeneficiaryMockFn);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.handleInstallmentAmountChange('200.00');
    });

    expect(props.setValue).toHaveBeenNthCalledWith(
      1,
      'installments.0.amount',
      '200.00'
    );
  });

  it("dovrebbe aggiornare le validazioni quando cambia l'importo della rata", () => {
    mockBeneficiaryManager.updateAmountValidations.mockClear();

    const props = getBaseProps();
    const mockGetValues = vi.fn(differentAmountMockFn);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    result.current.validateBeneficiaryAmounts();

    expect(mockBeneficiaryManager.updateAmountValidations).toHaveBeenCalled();
  });

  it('dovrebbe aggiornare automaticamente le validazioni quando cambia isMultibeneficiary e installmentAmount', () => {
    const props = getBaseProps();
    const mockGetValues = vi.fn(differentAmountMockFn);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    vi.clearAllMocks();

    vi.useFakeTimers();

    renderHook(() => useInstallmentBeneficiaryManagement(props));

    act(() => {
      vi.runAllTimers();
    });

    expect(mockBeneficiaryManager.updateAmountValidations).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
