import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasActualDataToPopulate,
  populateBasicFields,
  populateDueDateField,
  populateMultiBeneficiaryField,
  populateComplexFields,
  populateAllFormFields,
  prepareFormData,
  isNotEmptyString,
  safeSetValue
} from '../step3FormDataUtils';
import type { Step3FormValues } from '../../models/Step3Schema';
import type {
  Step1Data,
  Step2Data,
  Step3Data
} from '../../models/DebtPositionType';
import { DebtPositionTypeEnum } from '../../models/DebtPositionType';
import type { UseFormSetValue } from 'react-hook-form';
import type { Installment } from '../../models/paymentTypes';

vi.mock('../../models/Step3Schema', () => ({
  convertFormValuesToStep3Data: vi.fn()
}));

describe('step3FormDataUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasActualDataToPopulate', () => {
    it('returns false when all fields are empty', () => {
      const data: Step3Data = {
        paymentObject: { value: '', readonly: false },
        paymentOption: { value: '', readonly: false },
        amount: { value: '', readonly: false },
        dueDate: { value: '', readonly: false },
        beneficiaries: [],
        installments: []
      } as unknown as Step3Data;

      expect(hasActualDataToPopulate(data)).toBe(false);
    });

    it('returns true when any relevant field has data', () => {
      const data: Step3Data = {
        paymentObject: { value: 'PO', readonly: false },
        paymentOption: { value: '', readonly: false },
        amount: { value: '', readonly: false },
        dueDate: { value: '', readonly: false },
        beneficiaries: [],
        installments: []
      } as unknown as Step3Data;

      expect(hasActualDataToPopulate(data)).toBe(true);
    });
  });

  describe('populateBasicFields', () => {
    it('sets non-empty paymentObject, paymentOption, amount and returns true', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        paymentObject: { value: 'PO', readonly: false },
        paymentOption: { value: 'SINGLE', readonly: false },
        amount: { value: '100.00', readonly: false }
      } as unknown as Step3Data;

      const result = populateBasicFields({ data, setValue });

      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith('paymentObject.value', 'PO');
      expect(setValue).toHaveBeenCalledWith('paymentOption.value', 'SINGLE');
      expect(setValue).toHaveBeenCalledWith('amount.value', '100.00');
    });

    it('returns false when nothing is populated', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        paymentObject: { value: '   ', readonly: false },
        paymentOption: { value: '', readonly: false },
        amount: { value: '', readonly: false }
      } as unknown as Step3Data;

      const result = populateBasicFields({ data, setValue });
      expect(result).toBe(false);
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('populateDueDateField', () => {
    it('converts string to Date and sets the field', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        dueDate: { value: '2023-12-31', readonly: false }
      } as unknown as Step3Data;

      const result = populateDueDateField({ data, setValue });
      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith(
        'dueDate.value',
        new Date('2023-12-31')
      );
    });

    it('returns false when due date empty', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        dueDate: { value: '   ', readonly: false }
      } as unknown as Step3Data;

      const result = populateDueDateField({ data, setValue });
      expect(result).toBe(false);
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('populateMultiBeneficiaryField', () => {
    it('sets isMultibeneficiary when provided and returns true', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        isMultibeneficiary: { value: true, readonly: false }
      } as unknown as Step3Data;

      const result = populateMultiBeneficiaryField({ data, setValue });
      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith('isMultibeneficiary.value', true);
    });

    it('returns false when not provided', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {} as unknown as Step3Data;
      const result = populateMultiBeneficiaryField({ data, setValue });
      expect(result).toBe(false);
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('populateComplexFields', () => {
    it('sets beneficiaries and installments when provided', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const beneficiaries = [{ id: 'b1' }];
      const installments: Array<Installment> = [
        {
          id: 'i1',
          amount: '10.00',
          dueDate: '2023-12-31',
          remittance: 'r',
          isMultibeneficiary: false,
          beneficiaries: [],
          isNew: false
        }
      ];
      const data: Step3Data = {
        beneficiaries,
        installments
      } as unknown as Step3Data;

      const result = populateComplexFields({ data, setValue });
      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith('beneficiaries', beneficiaries);
      expect(setValue).toHaveBeenCalledWith('installments', installments);
    });

    it('returns false when neither beneficiaries nor installments provided', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        beneficiaries: [],
        installments: []
      } as unknown as Step3Data;

      const result = populateComplexFields({ data, setValue });
      expect(result).toBe(false);
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('populateAllFormFields', () => {
    it('returns hasPopulatedSomething true when any sub-population occurs', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        paymentObject: { value: 'PO', readonly: false }
      } as unknown as Step3Data;

      const res = populateAllFormFields({ data, setValue });
      expect(res).toEqual({ hasPopulatedSomething: true });
    });

    it('returns hasPopulatedSomething false when nothing is populated', () => {
      const setValue = vi.fn() as unknown as UseFormSetValue<Step3FormValues>;
      const data: Step3Data = {
        paymentObject: { value: '   ', readonly: false },
        beneficiaries: [],
        installments: []
      } as unknown as Step3Data;

      const res = populateAllFormFields({ data, setValue });
      expect(res).toEqual({ hasPopulatedSomething: false });
    });
  });

  describe('prepareFormData', () => {
    it('calls convertFormValuesToStep3Data with merged values and returns formatted data', async () => {
      const { convertFormValuesToStep3Data } = await import(
        '../../models/Step3Schema'
      );
      const formatted: Step3Data = {
        paymentObject: { value: 'PO', readonly: false }
      } as unknown as Step3Data;
      vi.mocked(convertFormValuesToStep3Data).mockReturnValue(formatted);

      const values: Step3FormValues = {
        paymentObject: { value: 'PO', readonly: false },
        paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
        amount: { value: '100.00', readonly: false },
        dueDate: { value: null, readonly: false },
        isMultibeneficiary: { value: false, readonly: false },
        installments: [],
        flagMandatoryDueDate: true,
        step1Data: {} as Step1Data,
        step2Data: {} as Step2Data
      } as unknown as Step3FormValues;

      const syncedInstallments: Array<Installment> = [
        {
          id: 'i1',
          amount: '10.00',
          dueDate: '2023-12-31',
          remittance: 'r',
          isMultibeneficiary: false,
          beneficiaries: [],
          isNew: false
        }
      ];

      const setData = vi.fn();

      const res = prepareFormData({
        values,
        syncedInstallments,
        step1Data: {} as Step1Data,
        step2Data: {} as Step2Data,
        setData
      });

      expect(convertFormValuesToStep3Data).toHaveBeenCalledWith(
        expect.objectContaining({
          flagMandatoryDueDate: true,
          step1Data: expect.any(Object),
          step2Data: expect.any(Object),
          installments: syncedInstallments
        })
      );
      expect(setData).toHaveBeenCalledWith(formatted);
      expect(res).toBe(formatted);
    });
  });

  describe('isNotEmptyString', () => {
    it('returns true only for non-empty trimmed strings', () => {
      expect(isNotEmptyString('a')).toBe(true);
      expect(isNotEmptyString('  a ')).toBe(true);
      expect(isNotEmptyString('   ')).toBe(false);
      expect(isNotEmptyString('')).toBe(false);
      expect(isNotEmptyString()).toBe(false);
    });
  });

  describe('safeSetValue', () => {
    it('sets value and returns true when condition is true and value defined', () => {
      type F = { a: { b: string } };
      const setValue = vi.fn() as unknown as UseFormSetValue<F>;
      const result = safeSetValue<F, 'a.b'>(setValue, 'a.b', 'x', true);
      expect(result).toBe(true);
      expect(setValue).toHaveBeenCalledWith('a.b', 'x');
    });

    it('does not set when condition false or value nullish', () => {
      type F = { a: { b?: string | null } };
      const setValue = vi.fn() as unknown as UseFormSetValue<F>;

      const r1 = safeSetValue<F, 'a.b'>(
        setValue,
        'a.b',
        null as unknown as string,
        true
      );
      const r2 = safeSetValue<F, 'a.b'>(
        setValue,
        'a.b',
        undefined as unknown as string,
        true
      );
      const r3 = safeSetValue<F, 'a.b'>(setValue, 'a.b', 'x', false);

      expect(r1).toBe(false);
      expect(r2).toBe(false);
      expect(r3).toBe(false);
      expect(setValue).not.toHaveBeenCalled();
    });
  });
});
