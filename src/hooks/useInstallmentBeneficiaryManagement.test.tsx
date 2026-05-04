import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
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

  it('should correctly initialize properties', () => {
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

  it('should not validate payment fields if not in multibeneficiary mode', () => {
    const props = getBaseProps();

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    result.current.validatePaymentFields();

    expect(props.trigger).not.toHaveBeenCalled();
  });

  it('should validate payment fields (IBAN and postal account) in multibeneficiary mode', () => {
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

  it('should enable multibeneficiary mode', () => {
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

  it('should disable multibeneficiary mode and reset beneficiaries', () => {
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

  it('should handle installment amount change', () => {
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

  it('should update validations when installment amount changes', () => {
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

  it('should automatically update validations when isMultibeneficiary and installmentAmount change', () => {
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

describe('useInstallmentBeneficiaryManagement - Additional Coverage Tests', () => {
  const getBaseProps = () => {
    const mockGetValues = vi.fn(defaultMockFn);
    const mockTrigger = vi.fn();
    const mockSetValue = vi.fn();

    return {
      control: {} as Control<TestFormValues>,
      index: 1,
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

  it('should auto-set sameBeneficiariesAsBefore=true when enabling switch and there are beneficiaries in the previous installment', () => {
    const props = getBaseProps();

    const mockGetValuesWithPreviousBeneficiaries = vi.fn(
      (path: string): unknown => {
        if (path === 'installments.0') {
          return {
            isMultibeneficiary: true,
            beneficiaries: [
              { entityName: 'Test', amount: '50.00', taxCode: '123' },
              { entityName: 'Test2', amount: '30.00', taxCode: '456' }
            ]
          };
        }
        if (path.includes('amount')) return '100.00';
        if (path.includes('isMultibeneficiary')) return false;
        if (path.includes('beneficiaries')) return [];
        return null;
      }
    );

    props.getValues =
      mockGetValuesWithPreviousBeneficiaries as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.isMultibeneficiary',
      true
    );

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.sameBeneficiariesAsBefore',
      true,
      { shouldDirty: true }
    );
  });

  it('should not auto-set sameBeneficiariesAsBefore when there are no valid beneficiaries in the previous installment', () => {
    const props = getBaseProps();

    const mockGetValuesWithoutValidPreviousBeneficiaries = vi.fn(
      (path: string): unknown => {
        if (path === 'installments.0') {
          return {
            isMultibeneficiary: false,
            beneficiaries: []
          };
        }
        if (path.includes('amount')) return '100.00';
        if (path.includes('isMultibeneficiary')) return false;
        if (path.includes('beneficiaries')) return [];
        return null;
      }
    );

    props.getValues =
      mockGetValuesWithoutValidPreviousBeneficiaries as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.isMultibeneficiary',
      true
    );

    expect(props.setValue).not.toHaveBeenCalledWith(
      'installments.1.sameBeneficiariesAsBefore',
      true,
      { shouldDirty: true }
    );

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      [],
      { shouldDirty: true }
    );

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      [
        expect.objectContaining({
          entityName: '',
          amount: '',
          taxCode: '',
          remittance: '',
          iban: '',
          postalIban: '',
          taxonomyCode: '',
          isNew: true
        })
      ],
      { shouldDirty: true }
    );
  });

  it('should handle the case when index = 0 (first installment) without looking for previous beneficiaries', () => {
    const props = getBaseProps();
    props.index = 0;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.0.isMultibeneficiary',
      true
    );

    expect(props.setValue).not.toHaveBeenCalledWith(
      expect.stringContaining('sameBeneficiariesAsBefore'),
      true,
      expect.any(Object)
    );
  });

  it('should reset sameBeneficiariesAsBefore when disabling the switch', () => {
    const props = getBaseProps();

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();

    act(() => {
      result.current.toggleMultibeneficiary(false);
    });

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.isMultibeneficiary',
      false
    );

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.sameBeneficiariesAsBefore',
      false,
      { shouldDirty: true }
    );

    expect(mockBeneficiaryManager.resetAllBeneficiaries).toHaveBeenCalled();
  });

  it('should handle setTimeout to mark beneficiaries as "new" when wasSubmitted is true', () => {
    const props = getBaseProps();

    mockBeneficiaryManager.wasSubmittedRef.current = true;

    const mockGetValuesForSetTimeout = vi.fn((path: string): unknown => {
      if (path === 'installments.0') {
        return { isMultibeneficiary: false, beneficiaries: [] };
      }
      if (path === 'installments.1.beneficiaries') {
        return [
          { entityName: 'Test', amount: '50.00', isNew: false },
          { entityName: 'Test2', amount: '30.00', isNew: false }
        ];
      }
      if (path.includes('amount')) return '100.00';
      if (path.includes('isMultibeneficiary')) return false;
      if (path.includes('beneficiaries')) return [];
      return null;
    });

    props.getValues =
      mockGetValuesForSetTimeout as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();
    vi.useFakeTimers();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(props.setValue).toHaveBeenCalledWith(
      'installments.1.beneficiaries',
      [
        expect.objectContaining({
          entityName: 'Test',
          amount: '50.00',
          isNew: true
        }),
        expect.objectContaining({
          entityName: 'Test2',
          amount: '30.00',
          isNew: true
        })
      ],
      { shouldDirty: true }
    );

    vi.useRealTimers();
    mockBeneficiaryManager.wasSubmittedRef.current = false;
  });

  it('should not execute setTimeout when wasSubmitted is false', () => {
    const props = getBaseProps();

    mockBeneficiaryManager.wasSubmittedRef.current = false;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();
    vi.useFakeTimers();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    const mockSetValue = props.setValue as MockedFunction<
      UseFormSetValue<TestFormValues>
    >;
    const setValueCallsBeforeTimeout = mockSetValue.mock.calls.length;

    act(() => {
      vi.runAllTimers();
    });

    const setValueCallsAfterTimeout = mockSetValue.mock.calls.length;
    expect(setValueCallsAfterTimeout).toBe(setValueCallsBeforeTimeout);

    vi.useRealTimers();
  });

  it('should handle the case when currentBeneficiaries is empty in setTimeout', () => {
    const props = getBaseProps();

    mockBeneficiaryManager.wasSubmittedRef.current = true;

    const mockGetValuesEmptyBeneficiaries = vi.fn((path: string): unknown => {
      if (path === 'installments.0') {
        return { isMultibeneficiary: false, beneficiaries: [] };
      }
      if (path === 'installments.1.beneficiaries') {
        return [];
      }
      if (path.includes('amount')) return '100.00';
      if (path.includes('isMultibeneficiary')) return false;
      if (path.includes('beneficiaries')) return [];
      return null;
    });

    props.getValues =
      mockGetValuesEmptyBeneficiaries as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    vi.clearAllMocks();
    vi.useFakeTimers();

    act(() => {
      result.current.toggleMultibeneficiary(true);
    });

    const mockSetValue = props.setValue as MockedFunction<
      UseFormSetValue<TestFormValues>
    >;
    const setValueCallsBeforeTimeout = mockSetValue.mock.calls.length;

    act(() => {
      vi.runAllTimers();
    });

    const setValueCallsAfterTimeout = mockSetValue.mock.calls.length;
    expect(setValueCallsAfterTimeout).toBe(setValueCallsBeforeTimeout);

    vi.useRealTimers();
    mockBeneficiaryManager.wasSubmittedRef.current = false;
  });

  it('should handle the case when onToggleMultibeneficiary is not provided', () => {
    const props = getBaseProps();
    delete (props as { onToggleMultibeneficiary?: unknown })
      .onToggleMultibeneficiary;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    expect(() => {
      act(() => {
        result.current.toggleMultibeneficiary(true);
      });
    }).not.toThrow();
  });

  it('should maintain the same lastAmountRef value when the amount does not change', () => {
    const props = getBaseProps();

    const mockGetValuesSameAmount = vi.fn((path: string): unknown => {
      if (path.includes('amount')) return '100.00';
      return defaultMockFn(path);
    });

    props.getValues =
      mockGetValuesSameAmount as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    mockBeneficiaryManager.updateAmountValidations.mockClear();

    act(() => {
      result.current.validateBeneficiaryAmounts();
    });

    act(() => {
      result.current.validateBeneficiaryAmounts();
    });

    expect(
      mockBeneficiaryManager.updateAmountValidations
    ).toHaveBeenCalledTimes(1);
  });

  it('should handle the case when the previous installment is null/undefined', () => {
    const props = getBaseProps();

    const mockGetValuesNullPrevious = vi.fn((path: string): unknown => {
      if (path === 'installments.0') {
        return null;
      }
      if (path.includes('amount')) return '100.00';
      if (path.includes('isMultibeneficiary')) return false;
      if (path.includes('beneficiaries')) return [];
      return null;
    });

    props.getValues =
      mockGetValuesNullPrevious as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() =>
      useInstallmentBeneficiaryManagement(props)
    );

    expect(() => {
      act(() => {
        result.current.toggleMultibeneficiary(true);
      });
    }).not.toThrow();

    expect(props.setValue).not.toHaveBeenCalledWith(
      'installments.1.sameBeneficiariesAsBefore',
      true,
      { shouldDirty: true }
    );
  });
});
