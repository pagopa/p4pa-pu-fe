import { useCallback, useState } from 'react';
import {
  UseFormTrigger,
  UseFormSetValue,
  UseFormGetValues
} from 'react-hook-form';
import { Step3FormValues } from '../models/Step3Schema';
import {
  validateFormFields,
  validateBusinessLogic,
  createValidateInstallmentsData,
  type ValidateFormFieldsParams,
  type ValidateBusinessLogicParams
} from '../utils/step3ValidationUtils';
import type { Installment } from '../models/paymentTypes';

/**
 * Centralized state for validation management in Step3
 * Unifies hasClickedFinalCTA and submissionCount logic
 */
export type ValidationState = {
  /** Whether a final CTA (Create/Save) has been clicked */
  hasClickedFinalCTA: boolean;
  /** Counter to track submission attempts - used to determine when to show errors */
  submissionCount: number;
  /** Whether the form is currently in submission mode */
  isSubmitting: boolean;
};

/**
 * Parameters for the Step3 validation hook
 */
export type UseStep3ValidationParams = {
  setValue: UseFormSetValue<Step3FormValues>;
  trigger: UseFormTrigger<Step3FormValues>;
  getValues: UseFormGetValues<Step3FormValues>;
  flagMandatoryDueDate?: boolean;
};

/**
 * Result of the Step3 validation hook
 */
export type UseStep3ValidationResult = {
  /** Current validation state */
  validationState: ValidationState;

  /** Mark that a final CTA has been clicked and increment submission count */
  markFinalCTAClicked: () => void;

  /** Reset validation state (useful when changing payment options) */
  resetValidationState: () => void;

  /** Perform complete form validation including business logic */
  validateStep3Form: (params: {
    isInstallment: boolean;
    isMultibeneficiary: boolean;
    totalAmount: string;
  }) => Promise<{
    isValid: boolean;
    syncedInstallments?: Array<Installment>;
  }>;

  /**
   * Check if errors should be shown for a component based on current state
   * This preserves the existing logic where components created after a submission
   * should not show errors until the next submission.
   */
  shouldShowErrors: (componentCreationCount?: number) => boolean;

  /** Convenience getters for backward compatibility */
  hasClickedFinalCTA: boolean;
  submissionCount: number;
};

/**
 * Custom hook to centralize Step3 validation logic
 *
 * This hook manages:
 * - hasClickedFinalCTA state
 * - submissionCount tracking
 * - Form validation orchestration
 * - Error display logic based on component creation timing
 *
 * It maintains the existing behavior while centralizing the logic
 * that was previously scattered across Step3, useStep3FormHandlers,
 * BeneficiaryField, and InstallmentField components.
 */
export const useStep3Validation = (
  params: UseStep3ValidationParams
): UseStep3ValidationResult => {
  const { setValue, trigger, getValues, flagMandatoryDueDate } = params;

  // Centralized validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    hasClickedFinalCTA: false,
    submissionCount: 0,
    isSubmitting: false
  });

  // Create the validateInstallmentsData function with form parameters
  const validateInstallmentsDataFn = createValidateInstallmentsData({
    getValues,
    setValue,
    trigger
  });

  /**
   * Mark that a final CTA has been clicked and increment submission count
   * This replaces the separate setHasClickedFinalCTA(true) and setSubmissionCount(prev => prev + 1) calls
   */
  const markFinalCTAClicked = useCallback(() => {
    setValidationState((prev) => ({
      ...prev,
      hasClickedFinalCTA: true,
      submissionCount: prev.submissionCount + 1,
      isSubmitting: true
    }));
  }, []);

  /**
   * Reset validation state - useful when changing payment options
   * This replaces the separate setHasClickedFinalCTA(false) and setSubmissionCount(0) calls
   */
  const resetValidationState = useCallback(() => {
    setValidationState({
      hasClickedFinalCTA: false,
      submissionCount: 0,
      isSubmitting: false
    });
  }, []);

  /**
   * Perform complete form validation including business logic
   * This centralizes the validation logic that was in Step3's onSubmit method
   */
  const validateStep3Form = useCallback(
    async (validationParams: {
      isInstallment: boolean;
      isMultibeneficiary: boolean;
      totalAmount: string;
    }) => {
      const { isInstallment, isMultibeneficiary, totalAmount } =
        validationParams;

      // Set submitting state
      setValidationState((prev) => ({
        ...prev,
        isSubmitting: true
      }));

      try {
        const values = getValues();

        // Validate form fields including mandatory due date
        const formFieldsParams: ValidateFormFieldsParams = {
          values: { ...values, flagMandatoryDueDate },
          isInstallment,
          setValue,
          trigger
        };

        const isFormValid = await validateFormFields(formFieldsParams);
        if (!isFormValid) {
          return { isValid: false };
        }

        // Validate business logic (beneficiaries or installments)
        const businessLogicParams: ValidateBusinessLogicParams = {
          isInstallment,
          isMultibeneficiary,
          totalAmount,
          getValues,
          trigger,
          setValue,
          validateInstallmentsData: validateInstallmentsDataFn
        };

        const { isValid: isBusinessValid, syncedInstallments } =
          await validateBusinessLogic(businessLogicParams);

        return {
          isValid: isBusinessValid,
          syncedInstallments
        };
      } finally {
        // Reset submitting state
        setValidationState((prev) => ({
          ...prev,
          isSubmitting: false
        }));
      }
    },
    [
      getValues,
      setValue,
      trigger,
      validateInstallmentsDataFn,
      flagMandatoryDueDate
    ]
  );

  /**
   * Check if errors should be shown for a component based on current state
   *
   * This preserves the existing logic:
   * hasClickedFinalCTA && submissionCount > componentCreationCount
   *
   * Components created after a submission should not show errors until the next submission.
   */
  const shouldShowErrors = useCallback(
    (componentCreationCount = 0) => {
      return (
        validationState.hasClickedFinalCTA &&
        validationState.submissionCount > componentCreationCount
      );
    },
    [validationState.hasClickedFinalCTA, validationState.submissionCount]
  );

  return {
    validationState,
    markFinalCTAClicked,
    resetValidationState,
    validateStep3Form,
    shouldShowErrors,
    // Convenience getters for backward compatibility
    hasClickedFinalCTA: validationState.hasClickedFinalCTA,
    submissionCount: validationState.submissionCount
  };
};
