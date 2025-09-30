import {
  UseFormSetValue,
  UseFormTrigger,
  UseFormGetValues,
  Path
} from 'react-hook-form';
import { Step3FormValues } from '../models/Step3Schema';
import type { Installment } from '../models/paymentTypes';
import {
  syncInstallmentBeneficiaries,
  validateInstallments,
  validateMultiBeneficiary,
  handleInstallmentValidationFailure
} from './paymentUtility';

/**
 * Parameters for the form fields validation
 */
export type ValidateFormFieldsParams = {
  values: Step3FormValues;
  isInstallment: boolean;
  setValue: UseFormSetValue<Step3FormValues>;
  trigger: UseFormTrigger<Step3FormValues>;
};

/**
 * Parameters for the business logic validation
 */
export type ValidateBusinessLogicParams = {
  isInstallment: boolean;
  isMultibeneficiary: boolean;
  totalAmount: string;
  getValues: UseFormGetValues<Step3FormValues>;
  trigger: UseFormTrigger<Step3FormValues>;
  setValue: UseFormSetValue<Step3FormValues>;
  validateInstallmentsData: () => Promise<{
    isValid: boolean;
    syncedInstallments?: Array<Installment>;
  }>;
};

/**
 * Parameters for the installments validation
 */
export type ValidateInstallmentsDataParams = {
  getValues: UseFormGetValues<Step3FormValues>;
  setValue: UseFormSetValue<Step3FormValues>;
  trigger: UseFormTrigger<Step3FormValues>;
};

/**
 * Validation result
 */
export type ValidationResult = {
  isValid: boolean;
  syncedInstallments?: Array<Installment>;
};

/**
 * Validates the form fields including the validation of the mandatory due date
 * @param params - Parameters for the form fields validation
 * @returns Promise<boolean> - true if the validation passes, false if early return is needed
 */
export const validateFormFields = async (
  params: ValidateFormFieldsParams
): Promise<boolean> => {
  const { values, isInstallment, setValue, trigger } = params;

  // Check the due date field if mandatory
  if (!isInstallment && values.flagMandatoryDueDate) {
    if (!values.dueDate.value) {
      setValue('dueDate.value', null, { shouldValidate: true });
      await trigger('dueDate.value');
      return false;
    }
  }

  // Validate all fields before proceeding
  return await trigger();
};

/**
 * Validates the business logic for beneficiaries or installments based on the payment type
 * @param params - Parameters for the business logic validation
 * @returns Promise<ValidationResult> - Validation result with optional synced installments
 */
export const validateBusinessLogic = async (
  params: ValidateBusinessLogicParams
): Promise<ValidationResult> => {
  const {
    isInstallment,
    isMultibeneficiary,
    totalAmount,
    getValues,
    trigger,
    setValue,
    validateInstallmentsData
  } = params;

  // For single payment, validate the beneficiaries
  if (!isInstallment) {
    const beneficiariesValid = validateMultiBeneficiary(
      () => getValues('beneficiaries') || [],
      isMultibeneficiary,
      totalAmount,
      (name) => trigger(`beneficiaries.${name}` as Path<Step3FormValues>)
    );

    if (!beneficiariesValid) {
      return { isValid: false };
    }

    return { isValid: true };
  }

  // Validate the beneficiaries for each installment if the payment is based on installments
  if (isInstallment) {
    const { isValid, syncedInstallments } = await validateInstallmentsData();

    if (!isValid || !syncedInstallments) {
      return { isValid: false };
    }

    if (
      JSON.stringify(getValues('installments')) !==
      JSON.stringify(syncedInstallments)
    ) {
      setValue('installments', syncedInstallments);
    }

    return { isValid: true, syncedInstallments };
  }

  return { isValid: true };
};

/**
 * Validates the installments and their beneficiaries
 * @param params - Parameters for the installments validation
 * @returns Promise<ValidationResult> - Object with the validation result and synced installments
 */
export const validateInstallmentsData = async (
  params: ValidateInstallmentsDataParams
): Promise<ValidationResult> => {
  const { getValues, setValue, trigger } = params;

  const installments = getValues('installments') || [];

  const cleanedInstallments = installments.map((installment) => {
    if (!installment.isMultibeneficiary) {
      return {
        ...installment,
        beneficiaries: []
      };
    }
    return installment;
  });

  const { installments: syncedInstallments, modified } =
    syncInstallmentBeneficiaries(cleanedInstallments as Array<Installment>);

  if (modified) {
    setValue('installments', syncedInstallments);
  }

  const validationResults = validateInstallments(syncedInstallments, trigger);

  const hasValidationFailure = Object.values(validationResults).some(
    (value) => value
  );

  if (hasValidationFailure) {
    handleInstallmentValidationFailure(
      syncedInstallments,
      validationResults,
      trigger
    );
    return { isValid: false };
  }

  return { isValid: true, syncedInstallments };
};

/**
 * Factory function to create the validateInsta
 * llmentsData function with the form parameters
 * Useful to maintain compatibility with the existing interface
 */
export const createValidateInstallmentsData = (
  params: ValidateInstallmentsDataParams
) => {
  return () => validateInstallmentsData(params);
};
