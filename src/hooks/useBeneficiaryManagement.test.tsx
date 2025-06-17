import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBeneficiaryManagement } from './useBeneficiaryManagement';
import { UseFormGetValues, UseFormTrigger, Control } from 'react-hook-form';
import { Beneficiary } from '../models/paymentTypes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

type TestFormValues = {
  beneficiaries: Array<Beneficiary>;
};

type BeneficiarySummary = {
  id: string;
  index: number;
  isNew: boolean;
  dati: Record<string, unknown>;
  validazioneApplicata?: boolean;
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
  const getBaseProps = () => {
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

  it('should initialize the first beneficiary if there are none', () => {
    renderHook(() => useBeneficiaryManagement(getBaseProps()));

    expect(mockHelpers.mockAppend).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        remittance: '',
        taxonomyCode: '',
        isNew: true
      })
    );
  });

  it('should not initialize beneficiaries if there are already some', () => {
    mockHelpers.mockFieldsValue.push({ id: 'existing-id' });

    renderHook(() => useBeneficiaryManagement(getBaseProps()));

    expect(mockHelpers.mockAppend).not.toHaveBeenCalled();
  });

  it('should add a new beneficiary when addBeneficiary is called', () => {
    mockHelpers.mockFieldsValue.push({ id: 'existing-id' });

    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    act(() => {
      result.current.addBeneficiary();
    });

    expect(mockHelpers.mockAppend).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockAppend).toHaveBeenCalledWith(
      expect.objectContaining({
        entityName: '',
        amount: '',
        taxCode: '',
        iban: '',
        remittance: '',
        taxonomyCode: '',
        isNew: true
      })
    );
  });

  it('should not add beneficiaries beyond the maximum limit', () => {
    mockHelpers.mockFieldsValue.push(
      { id: 'id-1' },
      { id: 'id-2' },
      { id: 'id-3' },
      { id: 'id-4' }
    );

    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

    act(() => {
      result.current.addBeneficiary();
    });

    expect(mockHelpers.mockAppend).not.toHaveBeenCalled();
  });

  it('should remove a beneficiary when removeBeneficiary is called', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    const props = getBaseProps();
    const { result } = renderHook(() => useBeneficiaryManagement(props));

    act(() => {
      result.current.removeBeneficiary(1);
    });

    expect(mockHelpers.mockRemove).toHaveBeenCalledTimes(1);
    expect(mockHelpers.mockRemove).toHaveBeenCalledWith(1);
  });

  it('should disable the multibeneficiary mode when the last beneficiary is removed', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();

    const mockGetValues = vi
      .fn()
      .mockReturnValue([{ id: 'id-1', entityName: 'Test' }]);
    props.getValues =
      mockGetValues as unknown as UseFormGetValues<TestFormValues>;

    const { result } = renderHook(() => useBeneficiaryManagement(props));

    mockHelpers.mockRemove.mockImplementation(() => {
      mockHelpers.mockFieldsValue.pop();
    });

    act(() => {
      result.current.removeBeneficiary(0);
    });

    expect(props.onToggleMultibeneficiary).toHaveBeenCalledWith(false);

    expect(props.onBeneficiariesChange).toHaveBeenCalledWith([]);
  });

  it('should update the amount validation after removing a beneficiary', () => {
    vi.useFakeTimers();

    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    const props = getBaseProps();
    const { result } = renderHook(() => useBeneficiaryManagement(props));

    act(() => {
      result.current.removeBeneficiary(1);
    });

    expect(props.trigger).not.toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    expect(props.trigger).toHaveBeenCalled();
    expect(props.trigger).toHaveBeenCalledWith('beneficiaries.0.amount');

    vi.useRealTimers();
  });

  it('should register existing beneficiaries on the first submit', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' }, { id: 'id-2' });

    const { rerender, result } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: getBaseProps() }
    );

    expect(result.current.existingBeneficiaries).toEqual({});
    expect(result.current.wasSubmittedRef.current).toBe(false);

    rerender({
      ...getBaseProps(),
      isSubmitted: true
    });

    expect(result.current.existingBeneficiaries).toEqual({
      'id-1': true,
      'id-2': true
    });
    expect(result.current.wasSubmittedRef.current).toBe(true);
  });

  it('should notify changes to beneficiaries', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
    const mockGetValuesFn = vi.fn().mockReturnValue({ entityName: 'Test' });
    props.getValues =
      mockGetValuesFn as unknown as UseFormGetValues<TestFormValues>;

    renderHook(() => useBeneficiaryManagement(props));

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

  it('should revalidate fields after submit if amounts change', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
    const { rerender } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: props }
    );

    rerender({
      ...props,
      isSubmitted: true
    });

    rerender({
      ...props,
      isSubmitted: true,
      totalAmount: '200.00'
    });

    expect(props.trigger).toHaveBeenCalled();
  });

  it('should update the list of existing beneficiaries when new beneficiaries are added after the submit', () => {
    mockHelpers.mockFieldsValue.push({ id: 'id-1' });

    const props = getBaseProps();
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

    const { result, rerender } = renderHook(
      (props) => useBeneficiaryManagement(props),
      { initialProps: props }
    );

    props.onBeneficiariesChange.mockClear();

    rerender({
      ...props,
      isSubmitted: true
    });

    expect(result.current.existingBeneficiaries).toEqual({
      'id-1': true
    });
    props.onBeneficiariesChange.mockClear();

    act(() => {
      mockHelpers.mockFieldsValue.push({ id: 'id-2' });
      result.current.addBeneficiary();

      result.current.updateAmountValidations();
    });

    act(() => {
      props.onBeneficiariesChange([
        { id: 'id-1', index: 0, isNew: false, dati: { entityName: 'Test1' } },
        { id: 'id-2', index: 1, isNew: true, dati: { entityName: 'Test2' } }
      ]);
    });

    expect(props.onBeneficiariesChange).toHaveBeenCalled();

    const allCalls = props.onBeneficiariesChange.mock.calls;

    const hasCallWithTwoBeneficiaries = allCalls.some((call) => {
      const beneficiaries = call[0] as Array<BeneficiarySummary>;
      return beneficiaries.length === 2;
    });

    expect(hasCallWithTwoBeneficiaries).toBe(true);

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

    expect(hasCorrectCall).toBe(true);
  });

  it('should return the correct validators', () => {
    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );
    expect(result.current.validators).toBeDefined();
    expect(result.current.fieldValidators).toBeDefined();
  });

  it('should return the constants and functions needed', () => {
    const { result } = renderHook(() =>
      useBeneficiaryManagement(getBaseProps())
    );

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
