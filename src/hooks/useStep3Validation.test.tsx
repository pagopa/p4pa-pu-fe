import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useStep3Validation } from './useStep3Validation';
import { Step3FormValues } from '../models/Step3Schema';
import { DebtPositionTypeEnum } from '../models/DebtPositionType';
import type { Installment } from '../models/paymentTypes';
import type {
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger
} from 'react-hook-form';
import type { Path } from 'react-hook-form';

vi.mock('../utils/step3ValidationUtils', () => ({
  validateFormFields: vi.fn(),
  validateBusinessLogic: vi.fn(),
  createValidateInstallmentsData: vi.fn()
}));

describe('useStep3Validation', () => {
  let mockSetValue: UseFormSetValue<Step3FormValues>;
  let mockTrigger: UseFormTrigger<Step3FormValues>;
  let mockGetValues: UseFormGetValues<Step3FormValues>;

  const baseFormValues: Step3FormValues = {
    paymentObject: { value: 'Test', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    isMultibeneficiary: { value: false, readonly: false },
    beneficiaries: [],
    installments: []
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockSetValue = vi.fn();
    mockTrigger = vi.fn();
    mockGetValues = ((name?: Path<Step3FormValues>): unknown => {
      if (name === undefined) {
        return baseFormValues as unknown;
      }
      if (name === 'installments') {
        return baseFormValues.installments as unknown;
      }
      if (name === 'beneficiaries') {
        return baseFormValues.beneficiaries as unknown;
      }
      return undefined as unknown;
    }) as UseFormGetValues<Step3FormValues>;
  });

  it('should expose initial validation state and convenience getters', () => {
    const { result } = renderHook(() =>
      useStep3Validation({
        setValue: mockSetValue,
        trigger: mockTrigger,
        getValues: mockGetValues
      })
    );

    expect(result.current.validationState).toEqual({
      hasClickedFinalCTA: false,
      submissionCount: 0,
      isSubmitting: false
    });
    expect(result.current.hasClickedFinalCTA).toBe(false);
    expect(result.current.submissionCount).toBe(0);
  });

  it('markFinalCTAClicked should set hasClickedFinalCTA, increment submissionCount and set isSubmitting', () => {
    const { result } = renderHook(() =>
      useStep3Validation({
        setValue: mockSetValue,
        trigger: mockTrigger,
        getValues: mockGetValues
      })
    );

    act(() => {
      result.current.markFinalCTAClicked();
    });

    expect(result.current.validationState.hasClickedFinalCTA).toBe(true);
    expect(result.current.validationState.submissionCount).toBe(1);
    expect(result.current.validationState.isSubmitting).toBe(true);
  });

  it('resetValidationState should reset state to defaults', () => {
    const { result } = renderHook(() =>
      useStep3Validation({
        setValue: mockSetValue,
        trigger: mockTrigger,
        getValues: mockGetValues
      })
    );

    act(() => {
      result.current.markFinalCTAClicked();
    });

    act(() => {
      result.current.resetValidationState();
    });

    expect(result.current.validationState).toEqual({
      hasClickedFinalCTA: false,
      submissionCount: 0,
      isSubmitting: false
    });
  });

  it('shouldShowErrors should respect submissionCount versus componentCreationCount', () => {
    const { result } = renderHook(() =>
      useStep3Validation({
        setValue: mockSetValue,
        trigger: mockTrigger,
        getValues: mockGetValues
      })
    );

    expect(result.current.shouldShowErrors()).toBe(false);

    act(() => {
      result.current.markFinalCTAClicked();
    });

    // After first submission, components created before (count 0) should show errors
    expect(result.current.shouldShowErrors(0)).toBe(true);
    // Components created in the same tick after submission (count 1) should not
    expect(result.current.shouldShowErrors(1)).toBe(false);
  });

  describe('validateStep3Form', () => {
    it('should short-circuit when form fields validation fails', async () => {
      const utilsModule = await import('../utils/step3ValidationUtils');
      vi.mocked(utilsModule.validateFormFields).mockResolvedValue(false);

      const { result } = renderHook(() =>
        useStep3Validation({
          setValue: mockSetValue,
          trigger: mockTrigger,
          getValues: mockGetValues,
          flagMandatoryDueDate: true
        })
      );

      await act(async () =>
        result.current.validateStep3Form({
          isInstallment: false,
          isMultibeneficiary: false,
          totalAmount: '100.00'
        })
      );

      expect(result.current.validationState.isSubmitting).toBe(false);
      expect(utilsModule.validateFormFields).toHaveBeenCalled();
      expect(utilsModule.validateBusinessLogic).not.toHaveBeenCalled();
      vi.mocked(utilsModule.validateFormFields).mockResolvedValue(false);
      const res = await result.current.validateStep3Form({
        isInstallment: false,
        isMultibeneficiary: false,
        totalAmount: '100.00'
      });
      expect(res).toEqual({ isValid: false });
    });

    it('should orchestrate business validation and propagate synced installments', async () => {
      const utilsModule = await import('../utils/step3ValidationUtils');

      const mockedValidateInstallmentsData = vi.fn().mockResolvedValue({
        isValid: true,
        syncedInstallments: [{ id: '1' } as Installment]
      });

      vi.mocked(utilsModule.createValidateInstallmentsData).mockReturnValue(
        mockedValidateInstallmentsData
      );

      vi.mocked(utilsModule.validateFormFields).mockResolvedValue(true);
      vi.mocked(utilsModule.validateBusinessLogic).mockResolvedValue({
        isValid: true,
        syncedInstallments: [{ id: '1' } as Installment]
      });

      const { result } = renderHook(() =>
        useStep3Validation({
          setValue: mockSetValue,
          trigger: mockTrigger,
          getValues: mockGetValues,
          flagMandatoryDueDate: true
        })
      );

      const res = await result.current.validateStep3Form({
        isInstallment: true,
        isMultibeneficiary: false,
        totalAmount: '100.00'
      });

      expect(utilsModule.createValidateInstallmentsData).toHaveBeenCalledWith({
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      });
      expect(utilsModule.validateBusinessLogic).toHaveBeenCalledWith(
        expect.objectContaining({
          isInstallment: true,
          isMultibeneficiary: false,
          totalAmount: '100.00',
          getValues: mockGetValues,
          trigger: mockTrigger,
          setValue: mockSetValue,
          validateInstallmentsData: mockedValidateInstallmentsData
        })
      );
      expect(res).toEqual({
        isValid: true,
        syncedInstallments: [{ id: '1' } as Installment]
      });
      expect(result.current.validationState.isSubmitting).toBe(false);
    });

    it('should pass flagMandatoryDueDate to form field validation', async () => {
      const utilsModule = await import('../utils/step3ValidationUtils');
      vi.mocked(utilsModule.validateFormFields).mockResolvedValue(true);
      vi.mocked(utilsModule.validateBusinessLogic).mockResolvedValue({
        isValid: true
      });

      const { result } = renderHook(() =>
        useStep3Validation({
          setValue: mockSetValue,
          trigger: mockTrigger,
          getValues: mockGetValues,
          flagMandatoryDueDate: true
        })
      );

      await result.current.validateStep3Form({
        isInstallment: false,
        isMultibeneficiary: false,
        totalAmount: '100.00'
      });

      expect(utilsModule.validateFormFields).toHaveBeenCalledWith(
        expect.objectContaining({
          isInstallment: false,
          setValue: mockSetValue,
          trigger: mockTrigger,
          values: expect.objectContaining({ flagMandatoryDueDate: true })
        })
      );
    });
  });
});
