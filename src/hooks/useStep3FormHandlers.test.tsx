import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useStep3FormHandlers } from './useStep3FormHandlers';
import { Step3FormValues } from '../models/Step3Schema';
import { DebtPositionTypeEnum } from '../models/DebtPositionType';
import { PaymentOptionType } from '../../generated/data-contracts';
import { triggerValidationForAllBeneficiaries } from '../utils/paymentUtility';
import type { Beneficiary } from '../models/paymentTypes';

vi.mock('../utils', () => ({
  default: {
    formatters: {
      parseAmountToNumber: vi.fn()
    }
  }
}));

vi.mock('../utils/paymentUtility', () => ({
  triggerValidationForAllBeneficiaries: vi.fn()
}));

describe('useStep3FormHandlers', () => {
  const mockSetValue = vi.fn();
  const mockTrigger = vi.fn();
  const mockReset = vi.fn();
  const mockGetValues = vi.fn();
  const mockResetValidationState = vi.fn();
  const mockBeneficiaryFieldRef = {
    current: {
      resetAllBeneficiaries: vi.fn()
    }
  };

  const mockInitialData: Step3FormValues = {
    paymentObject: { value: '', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '', readonly: false },
    dueDate: { value: null, readonly: false },
    isMultibeneficiary: { value: false, readonly: false },
    installments: []
  };

  const baseProps = {
    setValue: mockSetValue,
    trigger: mockTrigger,
    reset: mockReset,
    getValues: mockGetValues,
    initialData: mockInitialData,
    isMultibeneficiary: false,
    beneficiaries: [],
    paymentOption: DebtPositionTypeEnum.SINGLE,
    beneficiaryFieldRef: mockBeneficiaryFieldRef,
    resetValidationState: mockResetValidationState
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAmountChange', () => {
    it('should filter non-numeric characters and normalize commas to dots', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockOnChange = vi.fn();
      const mockEvent = {
        target: { value: '123,45abc' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleAmountChange(mockEvent, mockOnChange);
      });

      expect(mockOnChange).toHaveBeenCalledWith('123.45');
    });

    it('should trigger validation for beneficiaries when multibeneficiary is active', async () => {
      const mockBeneficiaries: Array<Beneficiary> = [
        {
          id: '1',
          entityName: 'Test Entity 1',
          amount: '50.00',
          taxCode: 'TSTCOD01',
          remittance: 'Test remittance 1',
          iban: 'IT60X0542811101000000123456',
          taxonomyCode: '01'
        },
        {
          id: '2',
          entityName: 'Test Entity 2',
          amount: '50.00',
          taxCode: 'TSTCOD02',
          remittance: 'Test remittance 2',
          iban: 'IT60X0542811101000000654321',
          taxonomyCode: '02'
        }
      ];

      const propsWithMultibeneficiary = {
        ...baseProps,
        isMultibeneficiary: true,
        beneficiaries: mockBeneficiaries
      };

      const { result } = renderHook(() =>
        useStep3FormHandlers(propsWithMultibeneficiary)
      );
      const mockOnChange = vi.fn();
      const mockEvent = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleAmountChange(mockEvent, mockOnChange);
      });

      expect(mockOnChange).toHaveBeenCalledWith('100');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(triggerValidationForAllBeneficiaries).toHaveBeenCalledWith(
        propsWithMultibeneficiary.beneficiaries,
        mockTrigger
      );
    });

    it('should not trigger validation when multibeneficiary is disabled', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockOnChange = vi.fn();
      const mockEvent = {
        target: { value: '100' }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleAmountChange(mockEvent, mockOnChange);
      });

      expect(triggerValidationForAllBeneficiaries).not.toHaveBeenCalled();
    });
  });

  describe('handleAmountBlur', () => {
    it('should format valid numeric value with two decimal places', async () => {
      const mockUtils = await import('../utils');
      vi.mocked(
        mockUtils.default.formatters.parseAmountToNumber
      ).mockReturnValue(123.4);

      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn()
      };
      const mockEvent = {
        target: { value: '123.4' }
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleAmountBlur(mockEvent, mockField);
      });

      expect(
        mockUtils.default.formatters.parseAmountToNumber
      ).toHaveBeenCalledWith('123.4');
      expect(mockField.onChange).toHaveBeenCalledWith('123.40');
      expect(mockField.onBlur).toHaveBeenCalled();
    });

    it('should not format invalid numeric value', async () => {
      const mockUtils = await import('../utils');
      vi.mocked(
        mockUtils.default.formatters.parseAmountToNumber
      ).mockReturnValue(null);

      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockField = {
        onChange: vi.fn(),
        onBlur: vi.fn()
      };
      const mockEvent = {
        target: { value: 'invalid' }
      } as React.FocusEvent<HTMLInputElement>;

      act(() => {
        result.current.handleAmountBlur(mockEvent, mockField);
      });

      expect(mockField.onChange).not.toHaveBeenCalled();
      expect(mockField.onBlur).toHaveBeenCalled();
    });
  });

  describe('handlePaymentOptionChange', () => {
    it('should call onChange and reset states when payment option changes', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockField = {
        onChange: vi.fn()
      };
      const mockEvent = {
        target: { value: DebtPositionTypeEnum.INSTALLMENTS }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handlePaymentOptionChange(mockEvent, mockField);
      });

      expect(mockField.onChange).toHaveBeenCalledWith(
        DebtPositionTypeEnum.INSTALLMENTS
      );
      expect(mockResetValidationState).toHaveBeenCalled();
    });

    it('should reset fields when changing to installments', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockField = {
        onChange: vi.fn()
      };
      const mockEvent = {
        target: { value: DebtPositionTypeEnum.INSTALLMENTS }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handlePaymentOptionChange(mockEvent, mockField);
      });

      expect(mockReset).toHaveBeenCalledWith({
        ...mockInitialData,
        paymentOption: {
          ...mockInitialData.paymentOption,
          value: DebtPositionTypeEnum.INSTALLMENTS
        },
        isMultibeneficiary: {
          ...mockInitialData.isMultibeneficiary,
          value: false
        },
        beneficiaries: [],
        installments: []
      });
    });

    it('should reset fields when changing from installments to single', () => {
      const propsWithInstallments = {
        ...baseProps,
        paymentOption: DebtPositionTypeEnum.INSTALLMENTS
      };

      const { result } = renderHook(() =>
        useStep3FormHandlers(propsWithInstallments)
      );
      const mockField = {
        onChange: vi.fn()
      };
      const mockEvent = {
        target: { value: PaymentOptionType.SINGLE_INSTALLMENT }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handlePaymentOptionChange(mockEvent, mockField);
      });

      expect(mockReset).toHaveBeenCalledWith({
        ...mockInitialData,
        paymentOption: {
          ...mockInitialData.paymentOption,
          value: DebtPositionTypeEnum.SINGLE
        },
        isMultibeneficiary: {
          ...mockInitialData.isMultibeneficiary,
          value: false
        },
        beneficiaries: [],
        installments: []
      });
    });

    it('should reset beneficiaries after timeout', async () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));
      const mockField = {
        onChange: vi.fn()
      };
      const mockEvent = {
        target: { value: DebtPositionTypeEnum.INSTALLMENTS }
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handlePaymentOptionChange(mockEvent, mockField);
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(
        mockBeneficiaryFieldRef.current.resetAllBeneficiaries
      ).toHaveBeenCalled();
    });
  });

  describe('handleMultibeneficiaryToggle', () => {
    it('should enable multibeneficiary and reset beneficiaries', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));

      act(() => {
        result.current.handleMultibeneficiaryToggle(true);
      });

      expect(
        mockBeneficiaryFieldRef.current.resetAllBeneficiaries
      ).toHaveBeenCalledTimes(1);
      expect(mockSetValue).toHaveBeenCalledWith(
        'isMultibeneficiary.value',
        true,
        {
          shouldValidate: false
        }
      );
    });

    it('should disable multibeneficiary and reset beneficiaries', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));

      act(() => {
        result.current.handleMultibeneficiaryToggle(false);
      });

      expect(mockSetValue).toHaveBeenCalledWith(
        'isMultibeneficiary.value',
        false,
        {
          shouldValidate: false
        }
      );
      expect(
        mockBeneficiaryFieldRef.current.resetAllBeneficiaries
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle missing resetAllBeneficiaries method gracefully', () => {
      const propsWithoutRef = {
        ...baseProps,
        beneficiaryFieldRef: { current: {} }
      };

      const { result } = renderHook(() =>
        useStep3FormHandlers(propsWithoutRef)
      );

      // Test that the function doesn't throw when resetAllBeneficiaries is missing
      act(() => {
        result.current.handleMultibeneficiaryToggle(true);
      });

      expect(mockSetValue).toHaveBeenCalledWith(
        'isMultibeneficiary.value',
        true,
        {
          shouldValidate: false
        }
      );
    });
  });

  describe('return object', () => {
    it('should return all handler functions', () => {
      const { result } = renderHook(() => useStep3FormHandlers(baseProps));

      expect(result.current).toHaveProperty('handleAmountChange');
      expect(result.current).toHaveProperty('handleAmountBlur');
      expect(result.current).toHaveProperty('handlePaymentOptionChange');
      expect(result.current).toHaveProperty('handleMultibeneficiaryToggle');

      expect(typeof result.current.handleAmountChange).toBe('function');
      expect(typeof result.current.handleAmountBlur).toBe('function');
      expect(typeof result.current.handlePaymentOptionChange).toBe('function');
      expect(typeof result.current.handleMultibeneficiaryToggle).toBe(
        'function'
      );
    });
  });
});
