import React from 'react';
import {
  UseFormSetValue,
  UseFormTrigger,
  UseFormReset,
  UseFormGetValues
} from 'react-hook-form';
import { Step3FormValues } from '../models/Step3Schema';
import { DebtPositionTypeEnum } from '../models/DebtPositionType';
import { PaymentOptionTypeEnum } from '../../generated/data-contracts';
import type { PaymentOption, Beneficiary } from '../models/paymentTypes';
import { BeneficiaryFieldRef } from '../routes/DebtPositionCreateWizard/components/Beneficiary/BeneficiaryField';
import { triggerValidationForAllBeneficiaries } from '../utils/paymentUtility';
import utils from '../utils';

/**
 * Parameters for the custom hook
 */
export type UseStep3FormHandlersProps = {
  setValue: UseFormSetValue<Step3FormValues>;
  trigger: UseFormTrigger<Step3FormValues>;
  reset: UseFormReset<Step3FormValues>;
  getValues: UseFormGetValues<Step3FormValues>;
  initialData: Step3FormValues;
  isMultibeneficiary: boolean;
  beneficiaries: Array<Beneficiary>;
  paymentOption: PaymentOption;
  beneficiaryFieldRef: React.MutableRefObject<BeneficiaryFieldRef>;
  /** Function to reset validation state when changing payment options */
  resetValidationState: () => void;
};

/**
 * Result of the custom hook
 */
export type UseStep3FormHandlersResult = {
  handleAmountChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    onChange: (...event: Array<unknown>) => void
  ) => void;
  handleAmountBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void; onBlur: () => void }
  ) => void;
  handlePaymentOptionChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void }
  ) => void;
  handleMultibeneficiaryToggle: (value: boolean) => void;
};

/**
 * Custom hook to manage all the event handlers of the Step3 form
 * Extracts the event handling logic to improve testability and maintainability
 */
export const useStep3FormHandlers = (
  props: UseStep3FormHandlersProps
): UseStep3FormHandlersResult => {
  const {
    setValue,
    trigger,
    reset,
    initialData,
    isMultibeneficiary,
    beneficiaries,
    paymentOption,
    beneficiaryFieldRef,
    resetValidationState
  } = props;

  /**
   * Handles the change of the amount field
   * Normalize the value and activate the validation for the beneficiaries if necessary
   */
  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    onChange: (...event: Array<unknown>) => void
  ): void => {
    const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
    const normalizedValue = filteredValue.replace(',', '.');
    onChange(normalizedValue);

    if (isMultibeneficiary && beneficiaries.length > 0) {
      setTimeout(() => {
        triggerValidationForAllBeneficiaries(beneficiaries, trigger);
      }, 0);
    }
  };

  /**
   * Handles the blur event of the amount field
   * Format the value with two decimal places when the field loses focus
   */
  const handleAmountBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void; onBlur: () => void }
  ): void => {
    const value = e.target.value;
    const numericValue = utils.formatters.parseAmountToNumber(value);
    if (numericValue !== null) {
      const formatted = numericValue.toFixed(2);
      field.onChange(formatted);
    }
    field.onBlur();
  };

  /**
   * Handles the change of the payment option
   * Reset the fields when changing from one payment mode to another
   */
  const handlePaymentOptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: { onChange: (...event: Array<unknown>) => void }
  ): void => {
    const value = e.target.value;
    field.onChange(value);

    // Reset validation state when changing the payment mode
    // Each mode should start "clean" without premature errors
    resetValidationState();

    // Reset the fields based on the selected mode
    resetFieldsForPaymentOption(value);

    // Reset the beneficiaries after a short delay
    setTimeout(() => {
      resetBeneficiariesIfNeeded();
    }, 0);
  };

  /**
   * Handles the toggle of the multi-beneficiary
   */
  const handleMultibeneficiaryToggle = (value: boolean): void => {
    // Before resetting the validation state, reset the beneficiaries
    if (value && beneficiaryFieldRef.current?.resetAllBeneficiaries) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }

    // Then set the new value
    setValue('isMultibeneficiary.value', value, { shouldValidate: false });

    // If the multi-beneficiary is disabled, reset the beneficiaries
    if (!value && beneficiaryFieldRef.current?.resetAllBeneficiaries) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }
  };

  /**
   * Reset the fields based on the selected payment option
   * @private
   */
  const resetFieldsForPaymentOption = (paymentOptionValue: string): void => {
    switch (paymentOptionValue) {
      case DebtPositionTypeEnum.INSTALLMENTS:
        reset({
          ...initialData,
          paymentOption: {
            ...initialData.paymentOption,
            value: DebtPositionTypeEnum.INSTALLMENTS as PaymentOption
          },
          isMultibeneficiary: {
            ...initialData.isMultibeneficiary,
            value: false
          },
          beneficiaries: [],
          installments: []
        });
        break;
      case PaymentOptionTypeEnum.SINGLE_INSTALLMENT:
        if (paymentOption === DebtPositionTypeEnum.INSTALLMENTS) {
          reset({
            ...initialData,
            paymentOption: {
              ...initialData.paymentOption,
              value: DebtPositionTypeEnum.SINGLE as PaymentOption
            },
            isMultibeneficiary: {
              ...initialData.isMultibeneficiary,
              value: false
            },
            beneficiaries: [],
            installments: []
          });
        }
        break;
    }
  };

  /**
   * Reset the beneficiaries if necessary
   * @private
   */
  const resetBeneficiariesIfNeeded = (): void => {
    if (beneficiaryFieldRef.current?.resetAllBeneficiaries) {
      beneficiaryFieldRef.current.resetAllBeneficiaries();
    }
  };

  return {
    handleAmountChange,
    handleAmountBlur,
    handlePaymentOptionChange,
    handleMultibeneficiaryToggle
  };
};
