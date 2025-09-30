import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UseFormSetValue,
  UseFormTrigger,
  UseFormGetValues
} from 'react-hook-form';
import {
  validateFormFields,
  validateBusinessLogic,
  validateInstallmentsData,
  createValidateInstallmentsData,
  type ValidateFormFieldsParams,
  type ValidateBusinessLogicParams,
  type ValidateInstallmentsDataParams
} from '../step3ValidationUtils';
import { Step3FormValues } from '../../models/Step3Schema';
import type { Installment, Beneficiary } from '../../models/paymentTypes';
import { DebtPositionTypeEnum } from '../../models/DebtPositionType';

vi.mock('../paymentUtility', () => ({
  syncInstallmentBeneficiaries: vi.fn(),
  validateInstallments: vi.fn(),
  validateMultiBeneficiary: vi.fn(),
  handleInstallmentValidationFailure: vi.fn()
}));

describe('step3ValidationUtils', () => {
  let mockSetValue: UseFormSetValue<Step3FormValues>;
  let mockTrigger: UseFormTrigger<Step3FormValues>;
  let mockGetValues: UseFormGetValues<Step3FormValues>;

  const mockBeneficiary: Beneficiary = {
    id: '1',
    entityName: 'Test Entity',
    amount: '100.00',
    taxCode: 'TESTCODE123',
    remittance: 'Test Remittance',
    iban: 'IT60X0542811101000000123456',
    taxonomyCode: '9/123456789',
    isNew: false
  };

  const mockInstallment: Installment = {
    id: '1',
    amount: '100.00',
    dueDate: '2023-12-31',
    remittance: 'Test Remittance',
    isMultibeneficiary: false,
    beneficiaries: [],
    isNew: false
  };

  const mockFormValues: Step3FormValues = {
    paymentObject: { value: 'Test Payment', readonly: false },
    paymentOption: { value: DebtPositionTypeEnum.SINGLE, readonly: false },
    amount: { value: '100.00', readonly: false },
    dueDate: { value: null, readonly: false },
    isMultibeneficiary: { value: false, readonly: false },
    beneficiaries: [],
    installments: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetValue = vi.fn();
    mockTrigger = vi.fn();
    mockGetValues = vi.fn();
  });

  describe('validateFormFields', () => {
    it('should return false when due date is mandatory but missing for single payment', async () => {
      const params: ValidateFormFieldsParams = {
        values: {
          ...mockFormValues,
          flagMandatoryDueDate: true,
          dueDate: { value: null, readonly: false }
        },
        isInstallment: false,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockTrigger).mockResolvedValue(false);

      const result = await validateFormFields(params);

      expect(result).toBe(false);
      expect(mockSetValue).toHaveBeenCalledWith('dueDate.value', null, {
        shouldValidate: true
      });
      expect(mockTrigger).toHaveBeenCalledWith('dueDate.value');
    });

    it('should continue validation when due date is provided for single payment with mandatory due date', async () => {
      const params: ValidateFormFieldsParams = {
        values: {
          ...mockFormValues,
          flagMandatoryDueDate: true,
          dueDate: { value: new Date('2023-12-31'), readonly: false }
        },
        isInstallment: false,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockTrigger).mockResolvedValue(true);

      const result = await validateFormFields(params);

      expect(result).toBe(true);
      expect(mockSetValue).not.toHaveBeenCalled();
      expect(mockTrigger).toHaveBeenCalledWith();
    });

    it('should skip due date validation for installment payments', async () => {
      const params: ValidateFormFieldsParams = {
        values: {
          ...mockFormValues,
          flagMandatoryDueDate: true,
          dueDate: { value: null, readonly: false }
        },
        isInstallment: true,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockTrigger).mockResolvedValue(true);

      const result = await validateFormFields(params);

      expect(result).toBe(true);
      expect(mockSetValue).not.toHaveBeenCalled();
      expect(mockTrigger).toHaveBeenCalledWith();
    });

    it('should return trigger result when all validations pass', async () => {
      const params: ValidateFormFieldsParams = {
        values: mockFormValues,
        isInstallment: false,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockTrigger).mockResolvedValue(true);

      const result = await validateFormFields(params);

      expect(result).toBe(true);
      expect(mockTrigger).toHaveBeenCalledWith();
    });

    it('should return false when form validation fails', async () => {
      const params: ValidateFormFieldsParams = {
        values: mockFormValues,
        isInstallment: false,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockTrigger).mockResolvedValue(false);

      const result = await validateFormFields(params);

      expect(result).toBe(false);
      expect(mockTrigger).toHaveBeenCalledWith();
    });
  });

  describe('validateBusinessLogic', () => {
    it('should validate beneficiaries for single payment', async () => {
      const { validateMultiBeneficiary } = await import('../paymentUtility');
      vi.mocked(validateMultiBeneficiary).mockReturnValue(true);

      const mockValidateInstallmentsData = vi.fn();
      const params: ValidateBusinessLogicParams = {
        isInstallment: false,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      vi.mocked(mockGetValues).mockReturnValue([mockBeneficiary]);

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: true });
      expect(validateMultiBeneficiary).toHaveBeenCalled();
      expect(mockValidateInstallmentsData).not.toHaveBeenCalled();
    });

    it('should return invalid when beneficiary validation fails for single payment', async () => {
      const { validateMultiBeneficiary } = await import('../paymentUtility');
      vi.mocked(validateMultiBeneficiary).mockReturnValue(false);

      const mockValidateInstallmentsData = vi.fn();
      const params: ValidateBusinessLogicParams = {
        isInstallment: false,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      vi.mocked(mockGetValues).mockReturnValue([]);

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: false });
      expect(validateMultiBeneficiary).toHaveBeenCalled();
    });

    it('should validate installments for installment payment', async () => {
      const syncedInstallments = [mockInstallment];
      const mockValidateInstallmentsData = vi
        .fn()
        .mockResolvedValue({ isValid: true, syncedInstallments });

      const params: ValidateBusinessLogicParams = {
        isInstallment: true,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: true, syncedInstallments });
      expect(mockValidateInstallmentsData).toHaveBeenCalled();
      expect(mockSetValue).not.toHaveBeenCalled(); // Same data, no setValue needed
    });

    it('should update form values when installments are modified', async () => {
      const originalInstallments = [mockInstallment];
      const syncedInstallments = [{ ...mockInstallment, amount: '150.00' }];
      const mockValidateInstallmentsData = vi
        .fn()
        .mockResolvedValue({ isValid: true, syncedInstallments });

      const params: ValidateBusinessLogicParams = {
        isInstallment: true,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      vi.mocked(mockGetValues).mockReturnValue(originalInstallments);

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: true, syncedInstallments });
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments',
        syncedInstallments
      );
    });

    it('should return invalid when installment validation fails', async () => {
      const mockValidateInstallmentsData = vi
        .fn()
        .mockResolvedValue({ isValid: false });

      const params: ValidateBusinessLogicParams = {
        isInstallment: true,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: false });
      expect(mockValidateInstallmentsData).toHaveBeenCalled();
    });

    it('should return invalid when installment validation returns no synced installments', async () => {
      const mockValidateInstallmentsData = vi
        .fn()
        .mockResolvedValue({ isValid: true, syncedInstallments: undefined });

      const params: ValidateBusinessLogicParams = {
        isInstallment: true,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: false });
    });

    it('should return valid for edge case when neither installment nor single payment', async () => {
      const mockValidateInstallmentsData = vi.fn();
      const params: ValidateBusinessLogicParams = {
        isInstallment: false,
        isMultibeneficiary: false,
        totalAmount: '100.00',
        getValues: mockGetValues,
        trigger: mockTrigger,
        setValue: mockSetValue,
        validateInstallmentsData: mockValidateInstallmentsData
      };

      // Mock to simulate no beneficiaries validation path
      const { validateMultiBeneficiary } = await import('../paymentUtility');
      vi.mocked(validateMultiBeneficiary).mockReturnValue(true);
      vi.mocked(mockGetValues).mockReturnValue([]);

      const result = await validateBusinessLogic(params);

      expect(result).toEqual({ isValid: true });
    });
  });

  describe('validateInstallmentsData', () => {
    it('should clean installments by removing beneficiaries when not multibeneficiary', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      const installmentWithBeneficiaries = {
        ...mockInstallment,
        isMultibeneficiary: false,
        beneficiaries: [mockBeneficiary]
      };

      const cleanedInstallments = [
        {
          ...installmentWithBeneficiaries,
          beneficiaries: []
        }
      ];

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: cleanedInstallments,
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([installmentWithBeneficiaries]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({
        isValid: true,
        syncedInstallments: cleanedInstallments
      });
      expect(syncInstallmentBeneficiaries).toHaveBeenCalledWith(
        cleanedInstallments
      );
    });

    it('should preserve beneficiaries when installment is multibeneficiary', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      const multibeneficiaryInstallment = {
        ...mockInstallment,
        isMultibeneficiary: true,
        beneficiaries: [mockBeneficiary]
      };

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: [multibeneficiaryInstallment],
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([multibeneficiaryInstallment]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({
        isValid: true,
        syncedInstallments: [multibeneficiaryInstallment]
      });
      expect(syncInstallmentBeneficiaries).toHaveBeenCalledWith([
        multibeneficiaryInstallment
      ]);
    });

    it('should update form values when installments are modified during sync', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      const syncedInstallments = [mockInstallment];

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: syncedInstallments,
        modified: true
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({ isValid: true, syncedInstallments });
      expect(mockSetValue).toHaveBeenCalledWith(
        'installments',
        syncedInstallments
      );
    });

    it('should not update form values when installments are not modified during sync', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      const syncedInstallments = [mockInstallment];

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: syncedInstallments,
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({ isValid: true, syncedInstallments });
      expect(mockSetValue).not.toHaveBeenCalled();
    });

    it('should return invalid and handle validation failures', async () => {
      const {
        syncInstallmentBeneficiaries,
        validateInstallments,
        handleInstallmentValidationFailure
      } = await import('../paymentUtility');

      const syncedInstallments = [mockInstallment];
      const validationResults = {
        hasInvalidBeneficiaries: true,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      };

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: syncedInstallments,
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue(validationResults);

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({ isValid: false });
      expect(handleInstallmentValidationFailure).toHaveBeenCalledWith(
        syncedInstallments,
        validationResults,
        mockTrigger
      );
    });

    it('should handle empty installments array', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: [],
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({ isValid: true, syncedInstallments: [] });
    });

    it('should handle undefined installments from getValues', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: [],
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([]);

      const result = await validateInstallmentsData(params);

      expect(result).toEqual({ isValid: true, syncedInstallments: [] });
    });
  });

  describe('createValidateInstallmentsData', () => {
    it('should create a function that calls validateInstallmentsData with provided params', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: [mockInstallment],
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const validateFunction = createValidateInstallmentsData(params);
      const result = await validateFunction();

      expect(result).toEqual({
        isValid: true,
        syncedInstallments: [mockInstallment]
      });
      expect(mockGetValues).toHaveBeenCalled();
    });

    it('should return a reusable function that maintains parameter closure', async () => {
      const { syncInstallmentBeneficiaries, validateInstallments } =
        await import('../paymentUtility');

      vi.mocked(syncInstallmentBeneficiaries).mockReturnValue({
        installments: [mockInstallment],
        modified: false
      });
      vi.mocked(validateInstallments).mockReturnValue({
        hasInvalidBeneficiaries: false,
        hasInvalidPaymentFields: false,
        hasInvalidAmounts: false,
        hasEmptyRemittance: false
      });

      const params: ValidateInstallmentsDataParams = {
        getValues: mockGetValues,
        setValue: mockSetValue,
        trigger: mockTrigger
      };

      vi.mocked(mockGetValues).mockReturnValue([mockInstallment]);

      const validateFunction = createValidateInstallmentsData(params);

      // Call the function multiple times
      const result1 = await validateFunction();
      const result2 = await validateFunction();

      expect(result1).toEqual(result2);
      expect(mockGetValues).toHaveBeenCalledTimes(2);
    });
  });
});
