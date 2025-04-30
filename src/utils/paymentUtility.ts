/**
 * @fileoverview Utility file for payment management.
 * This module provides reusable functions for payment processing and validation.
 * @module paymentUtility
 */
import { FieldErrors, FieldValues, Path } from 'react-hook-form';
import {
  BeneficiaryValidationContext,
  Beneficiary,
  Installment
} from '../models/paymentTypes';
import { format } from 'date-fns';
import { Step2Data, Step3Data } from '../models/DebtPositionType';
import { UseFormTrigger } from 'react-hook-form';
import { isBeneficiariesTotalValid } from './fieldValidation';
import { EntityTypeEnum } from '../../generated/data-contracts';

/**
 * Checks if a string value is empty.
 *
 * @function isEmpty
 * @param {string|unknown} [value] - Value to check.
 * @returns {boolean} - Returns true if the value is empty or not a string.
 */
export function isEmpty(value?: string | unknown): boolean {
  if (typeof value !== 'string') {
    return true;
  }
  return !value || value.trim() === '';
}

/**
 * Helper function to build a typed path for form fields.
 *
 * @function buildFieldPath
 * @template T - Type of field values.
 * @template K - Type of field key.
 * @param {string} fieldNamePrefix - Field prefix (e.g. 'beneficiaries').
 * @param {number} index - Array element index.
 * @param {K} field - Field name.
 * @returns {Path<T>} - Typed path for react-hook-form.
 */
export function buildFieldPath<T extends FieldValues, K extends string>(
  fieldNamePrefix: string,
  index: number,
  field: K
): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

/**
 * Gets error data from the form.
 *
 * @function getErrorData
 * @template T - Type of field values.
 * @param {FieldErrors<T>} errors - Form errors object.
 * @param {string} fieldNamePrefix - Field prefix.
 * @param {number} index - Element index.
 * @param {string} fieldName - Field name.
 * @returns {{hasError: boolean, errorMessage: string}} - Object with error status and message.
 */
export function getErrorData<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldNamePrefix: string,
  index: number,
  fieldName: string
): { hasError: boolean; errorMessage: string } {
  // Handling the special case for beneficiaries within installments
  if (fieldNamePrefix.includes('installments')) {
    const parts = fieldNamePrefix.split('.');
    const installmentIndex = parts.length > 1 ? parseInt(parts[1], 10) : -1;

    if (!isNaN(installmentIndex) && installmentIndex >= 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const installmentErrors = (errors as any)?.installments?.[
        installmentIndex
      ];

      const beneficiaryErrors = installmentErrors?.beneficiaries?.[index];
      if (beneficiaryErrors) {
        const hasError = !!beneficiaryErrors?.[fieldName];
        const errorMessage = beneficiaryErrors?.[fieldName]?.message || '';

        return { hasError, errorMessage };
      }
    }
  }

  // Standard case
  const fieldErrors = (
    errors[fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[index];

  const hasError = !!fieldErrors?.[fieldName];
  const errorMessage = (fieldErrors?.[fieldName]?.message as string) || '';

  return {
    hasError,
    errorMessage
  };
}

/**
 * Checks if a beneficiary is new (added after form submission).
 *
 * @function isBeneficiaryNew
 * @param {string} id - Beneficiary unique identifier.
 * @param {React.RefObject<boolean>} wasSubmittedRef - Reference to submission state.
 * @param {Record<string, boolean>} existingBeneficiaries - Map of existing beneficiaries.
 * @returns {boolean} - True if the beneficiary is newly added.
 */
export function isBeneficiaryNew(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return !!wasSubmittedRef.current && !existingBeneficiaries[id];
}

/**
 * Determines whether to show validation errors for a form field.
 *
 * @function hasFieldError
 * @template T - Type of field values.
 * @param {string} fieldName - Name of the field to check.
 * @param {BeneficiaryValidationContext<T>} context - Validation context.
 * @returns {boolean} - True if the field has an error that should be displayed.
 */
export function hasFieldError<T extends FieldValues>(
  fieldName: string,
  context: BeneficiaryValidationContext<T>
): boolean {
  // Determines if validation should be skipped
  const shouldSkip =
    !context.isSubmitted ||
    (isBeneficiaryNew(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
      !context.wasSubmittedRef.current);

  if (shouldSkip) {
    return false;
  }

  // For these fields, always show errors, even if the form hasn't been submitted
  if (
    fieldName === 'amount' ||
    fieldName === 'iban' ||
    fieldName === 'postalAccount'
  ) {
    return getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).hasError;
  }

  // For other fields, follow the standard logic
  return (
    context.isSubmitted &&
    getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).hasError
  );
}

/**
 * Gets the error message for a form field.
 *
 * @function getFieldErrorMessage
 * @template T - Type of field values.
 * @param {string} fieldName - Name of the field.
 * @param {BeneficiaryValidationContext<T>} context - Validation context.
 * @returns {string} - Error message if available, empty string otherwise.
 */
export function getFieldErrorMessage<T extends FieldValues>(
  fieldName: string,
  context: BeneficiaryValidationContext<T>
): string {
  // Determines if validation should be skipped
  const shouldSkip =
    !context.isSubmitted ||
    (isBeneficiaryNew(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
      !context.wasSubmittedRef.current);

  if (shouldSkip) {
    return '';
  }

  // For these fields, always show error messages, even if the form hasn't been submitted
  if (
    fieldName === 'amount' ||
    fieldName === 'iban' ||
    fieldName === 'postalAccount'
  ) {
    return getErrorData(
      context.errors,
      context.fieldNamePrefix,
      context.index,
      fieldName
    ).errorMessage;
  }

  // For other fields, follow the standard logic
  return context.isSubmitted
    ? getErrorData(
        context.errors,
        context.fieldNamePrefix,
        context.index,
        fieldName
      ).errorMessage
    : '';
}

/**
 * Gets a field value from the form.
 *
 * @function getFieldValue
 * @template T - Type of field values.
 * @template K - Type of field key.
 * @param {BeneficiaryValidationContext<T>} context - Validation context.
 * @param {K} field - Field name.
 * @returns {string} - The field value.
 */
export function getFieldValue<T extends FieldValues, K extends string>(
  context: BeneficiaryValidationContext<T>,
  field: K
): string {
  return context.getValues(
    buildFieldPath<T, K>(context.fieldNamePrefix, context.index, field)
  );
}

/**
 * Formats an amount as a currency string with comma as decimal separator.
 *
 * @function formatAmount
 * @param {string|number} amount - Amount to format.
 * @returns {string} - Formatted amount string.
 */
export function formatAmount(amount: string | number): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(',', '.'));
  }

  if (isNaN(amount)) {
    return '0,00';
  }

  return amount.toFixed(2).replace('.', ',');
}

/**
 * Verifies if the sum of beneficiary amounts equals the total amount.
 *
 * @function validateBeneficiariesTotal
 * @param {Array<{amount: string}>} beneficiaries - List of beneficiaries with amounts.
 * @param {string} totalAmount - Total amount to compare against.
 * @returns {boolean} - True if the sum is equal to the total amount.
 */
export function validateBeneficiariesTotal(
  beneficiaries: Array<{ amount: string }>,
  totalAmount: string
): boolean {
  if (!beneficiaries || beneficiaries.length === 0) {
    return false;
  }

  // Normalize figures (convert commas to dots)
  const total = parseFloat(totalAmount.replace(',', '.'));

  // Calculate the sum of amounts
  const sum = beneficiaries.reduce((acc, ben) => {
    const amount = ben.amount ? parseFloat(ben.amount.replace(',', '.')) : 0;
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Round to 2 decimals to avoid precision issues
  const roundedSum = Math.round(sum * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  return roundedSum === roundedTotal;
}

/**
 * Formats an amount to always have two decimal places.
 *
 * @function formatAmountWithTwoDecimals
 * @param {string} value - The value to format.
 * @returns {string} - The value formatted with two decimal places.
 */
export function formatAmountWithTwoDecimals(value: string): string {
  const normalizedValue = value.replace(',', '.');
  if (normalizedValue && !isNaN(parseFloat(normalizedValue))) {
    return parseFloat(normalizedValue).toFixed(2);
  }
  return value;
}

/**
 * Filters an amount input field accepting only numbers, dot and comma.
 *
 * @function filterAmountInput
 * @param {string} value - The value to filter.
 * @returns {string} - The filtered value.
 */
export function filterAmountInput(value: string): string {
  // Accept only numbers, dot and comma
  const filteredValue = value.replace(/[^0-9.,]/g, '');
  // Convert comma to dot for internal numeric handling
  return filteredValue.replace(',', '.');
}

/**
 * Handles the value change of an amount field.
 *
 * @function handleAmountInputChange
 * @param {string} inputValue - The input value.
 * @returns {string} - The filtered and normalized value.
 */
export function handleAmountInputChange(inputValue: string): string {
  return filterAmountInput(inputValue);
}

/**
 * Handles the blur event of an amount field.
 *
 * @function handleAmountInputBlur
 * @param {string} value - The field value.
 * @returns {string} - The value formatted with two decimal places.
 */
export function handleAmountInputBlur(value: string): string {
  return formatAmountWithTwoDecimals(value);
}

/**
 * Converts a numeric value for display, replacing dot with comma.
 *
 * @function formatAmountForDisplay
 * @param {string} value - The numeric value.
 * @returns {string} - The value formatted for display.
 */
export function formatAmountForDisplay(value: string): string {
  return value ? value.replace('.', ',') : '';
}

// Default values
export const DEFAULT_VALUES = {
  FLAG_IUV_VOLATILE: false,
  MULTI_DEBTOR: false,
  FLAG_PAGO_PA_PAYMENT: true,
  PAYMENT_OPTION_INDEX: 1
} as const;

// Helper functions for creating debt position objects
export const createDebtorObject = (step2Data: Step2Data) => ({
  entityType: step2Data.subjectType.value as EntityTypeEnum,
  fiscalCode: step2Data.taxCode.value,
  fullName: step2Data.fullName.value,
  address: step2Data.address.value,
  civic: step2Data.civicNumber.value,
  postalCode: step2Data.zipCode.value,
  location: step2Data.city.value,
  province: step2Data.province.value,
  nation: step2Data.country.value
});

export const createTransferObject = (
  beneficiary: Beneficiary,
  index: number
) => ({
  orgFiscalCode: beneficiary.taxCode,
  orgName: beneficiary.entityName,
  amountCents: Math.round(parseFloat(beneficiary.amount || '0') * 100),
  remittanceInformation: beneficiary.remittance,
  ...(beneficiary.iban && { iban: beneficiary.iban }),
  ...(beneficiary.postalAccount && { postalIban: beneficiary.postalAccount }),
  category: beneficiary.taxonomyCode,
  transferIndex: index + 2
});

/**
 * Formats a date for API consumption.
 *
 * @function formatDateForApi
 * @param {string|Date|null|undefined} date - The date to format.
 * @returns {string|undefined} - The formatted date or undefined if invalid.
 */
export const formatDateForApi = (date: string | Date | null | undefined) => {
  if (!date) {
    return undefined;
  }

  // If it's a string in DD/MM/YYYY format, convert it to the correct format
  if (typeof date === 'string' && date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  // If it's a Date object or ISO string
  const parsedDate = new Date(date);
  if (parsedDate.toString() === 'Invalid Date') {
    return undefined;
  }
  return format(parsedDate, 'yyyy-MM-dd');
};

export const getPreviousInstallmentTransfers = (
  currentInstallment: Installment,
  formattedValues: Step3Data
) => {
  if (!formattedValues.installments) return [];
  const currentIndex = formattedValues.installments.indexOf(currentInstallment);
  if (currentIndex === -1) return [];

  const prevInstallment = formattedValues.installments
    .slice(0, currentIndex)
    .reverse()
    .find((prev) => prev.beneficiaries && prev.beneficiaries.length > 0);

  if (!prevInstallment?.beneficiaries) return [];
  return prevInstallment.beneficiaries.map(createTransferObject);
};

export const createInstallmentObject = (
  installment: Installment,
  step2Data: Step2Data,
  formattedValues: Step3Data
) => ({
  dueDate: formatDateForApi(installment.dueDate),
  amountCents: Math.round(parseFloat(installment.amount || '0') * 100),
  remittanceInformation: installment.remittance || '',
  debtor: createDebtorObject(step2Data),
  ...(installment.isMultibeneficiary &&
    installment.beneficiaries &&
    installment.beneficiaries.length > 0 && {
      transfers: installment.beneficiaries.map(createTransferObject)
    }),
  ...(installment.sameBeneficiariesAsBefore &&
    installment.beneficiaries &&
    installment.beneficiaries.length > 0 && {
      transfers: getPreviousInstallmentTransfers(installment, formattedValues)
    })
});

export const createSingleInstallmentObject = (
  formattedValues: Step3Data,
  step2Data: Step2Data
) => ({
  dueDate: formatDateForApi(formattedValues.dueDate?.value),
  amountCents: Math.round(
    parseFloat(formattedValues.amount.value || '0') * 100
  ),
  remittanceInformation: formattedValues.paymentObject.value || '',
  debtor: createDebtorObject(step2Data),
  ...(formattedValues.isMultibeneficiary.value &&
    formattedValues.beneficiaries &&
    formattedValues.beneficiaries.length > 0 && {
      transfers: formattedValues.beneficiaries.map(createTransferObject)
    })
});

/**
 * Triggers validation for all beneficiaries.
 *
 * @function triggerValidationForAllBeneficiaries
 * @template T - Type of field values.
 * @param {Array<Record<string, unknown>>} beneficiaries - Array of beneficiaries.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 */
export function triggerValidationForAllBeneficiaries<T extends FieldValues>(
  beneficiaries: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  beneficiaries.forEach((_, index) => {
    trigger(`beneficiaries.${index}.amount` as Path<T>);
  });
}

/**
 * Triggers validation for all beneficiaries in all installments.
 *
 * @function triggerValidationForAllInstallmentBeneficiaries
 * @template T - Type of field values.
 * @param {Array<Record<string, unknown>>} installments - Array of installments.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 */
export function triggerValidationForAllInstallmentBeneficiaries<
  T extends FieldValues
>(installments: Array<Record<string, unknown>>, trigger: UseFormTrigger<T>) {
  installments.forEach((installment, installmentIndex) => {
    if (installment.isMultibeneficiary) {
      const installmentBeneficiaries =
        (installment.beneficiaries as Array<Record<string, unknown>>) || [];

      installmentBeneficiaries.forEach(
        (_: Record<string, unknown>, beneficiaryIndex: number) => {
          const path =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.amount` as Path<T>;
          trigger(path);
        }
      );
    }
  });
}

/**
 * Triggers validation for payment fields (IBAN and postal account).
 *
 * @function triggerPaymentFieldsValidation
 * @template T - Type of field values.
 * @param {Array<Record<string, unknown>>} installments - Array of installments.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 */
export function triggerPaymentFieldsValidation<T extends FieldValues>(
  installments: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>
) {
  installments.forEach((installment, installmentIndex) => {
    if (installment.isMultibeneficiary) {
      const installmentBeneficiaries =
        (installment.beneficiaries as Array<Record<string, unknown>>) || [];

      installmentBeneficiaries.forEach(
        (_: Record<string, unknown>, beneficiaryIndex: number) => {
          // IBAN validation
          const ibanPath =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.iban` as Path<T>;
          trigger(ibanPath);

          // Postal account validation
          const postalAccountPath =
            `installments.${installmentIndex}.beneficiaries.${beneficiaryIndex}.postalAccount` as Path<T>;
          trigger(postalAccountPath);
        }
      );
    }
  });
}

/**
 * Synchronizes beneficiaries between installments when sameBeneficiariesAsBefore is set to true.
 *
 * @function syncInstallmentBeneficiaries
 * @param {Array<Installment>} installments - Array of installments.
 * @returns {Object} - Object with synchronized installments and modification flag.
 */
export function syncInstallmentBeneficiaries(
  installments: Array<Installment>
): {
  installments: Array<Installment>;
  modified: boolean;
} {
  let installmentsModified = false;

  for (let i = 1; i < installments.length; i++) {
    const currentInstallment = installments[i] as unknown as Record<
      string,
      unknown
    >;
    const previousInstallment = installments[i - 1];

    // If installment is set to copy beneficiaries from previous installment
    if (
      currentInstallment.sameBeneficiariesAsBefore === 'true' ||
      currentInstallment.sameBeneficiariesAsBefore === true
    ) {
      // Copy beneficiaries from previous installment
      if (
        previousInstallment.beneficiaries &&
        Array.isArray(previousInstallment.beneficiaries) &&
        previousInstallment.beneficiaries.length > 0
      ) {
        currentInstallment.beneficiaries = [
          ...previousInstallment.beneficiaries
        ];
        installmentsModified = true;
      }
    }
  }

  return { installments, modified: installmentsModified };
}

/**
 * Validates installment data.
 *
 * @function validateInstallments
 * @template T - Type of field values.
 * @param {Array<Installment>} installments - Array of installments.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 * @returns {Object} - Object with validation results.
 */
export function validateInstallments<T extends FieldValues>(
  installments: Array<Installment>,
  trigger: UseFormTrigger<T>
): {
  hasInvalidBeneficiaries: boolean;
  hasInvalidPaymentFields: boolean;
  hasInvalidAmounts: boolean;
  hasEmptyRemittance: boolean;
} {
  let hasInvalidBeneficiaries = false;
  let hasInvalidPaymentFields = false;
  let hasInvalidAmounts = false;
  let hasEmptyRemittance = false;

  // Check each installment
  for (const [idx, installment] of installments.entries()) {
    // Validate installment amount
    if (!installment.amount || parseFloat(String(installment.amount)) <= 0) {
      hasInvalidAmounts = true;
    }

    // Validate installment remittance (payment reason)
    if (
      !installment.remittance ||
      String(installment.remittance).trim() === ''
    ) {
      hasEmptyRemittance = true;
      trigger(`installments.${idx}.remittance` as Path<T>);
    }

    if (installment.isMultibeneficiary) {
      const beneficiaries = installment.beneficiaries || [];

      // Check beneficiaries structure
      if (Array.isArray(beneficiaries)) {
        beneficiaries.forEach(
          (b: Record<string, unknown>, beneficiaryIdx: number) => {
            // Fix format if needed
            if (
              typeof b.amount !== 'string' &&
              b.amount !== null &&
              b.amount !== undefined
            ) {
              beneficiaries[beneficiaryIdx].amount = String(b.amount);
            }
            // Validate payment fields (IBAN or postalAccount required)
            const iban = typeof b.iban === 'string' ? b.iban : '';
            const postalAccount =
              typeof b.postalAccount === 'string' ? b.postalAccount : '';
            if (
              (!iban || iban.trim() === '') &&
              (!postalAccount || postalAccount.trim() === '')
            ) {
              hasInvalidPaymentFields = true;
            }
          }
        );

        // Validate beneficiaries total matches installment amount
        try {
          const isValid = isBeneficiariesTotalValid(
            beneficiaries as Array<Beneficiary>,
            installment.amount
          );

          if (!isValid) {
            hasInvalidBeneficiaries = true;
          }
        } catch (validationError) {
          console.error(
            'Error validating beneficiaries total:',
            validationError
          );
          hasInvalidBeneficiaries = true;
        }
      }
    }
  }

  return {
    hasInvalidBeneficiaries,
    hasInvalidPaymentFields,
    hasInvalidAmounts,
    hasEmptyRemittance
  };
}

/**
 * Validates fields in case of multi-beneficiary.
 *
 * @function validateMultiBeneficiary
 * @template T - Type of field values.
 * @param {Function} getValues - Function to get form values.
 * @param {boolean} isMultibeneficiary - Multi-beneficiary flag.
 * @param {string} totalAmount - Total amount.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 * @returns {boolean} - True if validation passed.
 */
export function validateMultiBeneficiary<T extends FieldValues>(
  getValues: () => T,
  isMultibeneficiary: boolean,
  totalAmount: string,
  trigger: UseFormTrigger<T>
): boolean {
  const currentBeneficiaries = getValues().beneficiaries || [];

  // Validate beneficiaries total amount
  if (
    isMultibeneficiary &&
    !isBeneficiariesTotalValid(currentBeneficiaries, totalAmount)
  ) {
    trigger('beneficiaries' as Path<T>);
    return false;
  }

  // Ensure the remittance field is filled for all beneficiaries
  if (isMultibeneficiary) {
    let hasEmptyRemittance = false;

    currentBeneficiaries.forEach((b: Beneficiary, idx: number) => {
      if (!b.remittance || b.remittance.trim() === '') {
        hasEmptyRemittance = true;
        trigger(`beneficiaries.${idx}.remittance` as Path<T>);
      }
    });

    if (hasEmptyRemittance) {
      return false;
    }
  }

  return true;
}

/**
 * Handles installment validation failure.
 *
 * @function handleInstallmentValidationFailure
 * @template T - Type of field values.
 * @param {Array<Installment>} installments - Array of installments.
 * @param {Object} validationResults - Validation results.
 * @param {UseFormTrigger<T>} trigger - Form trigger function.
 */
export function handleInstallmentValidationFailure<T extends FieldValues>(
  installments: Array<Installment>,
  validationResults: ReturnType<typeof validateInstallments>,
  trigger: UseFormTrigger<T>
): void {
  // We only check if there are errors, but don't use individual variables
  // This is because all validations are triggered anyway
  const hasErrors = Object.values(validationResults).some(Boolean);

  if (!hasErrors) {
    return;
  }

  try {
    // Trigger installment amounts validation
    installments.forEach((_: Installment, index: number) => {
      trigger(`installments.${index}.amount` as Path<T>);
    });

    // Trigger validation for all beneficiaries in all installments
    triggerValidationForAllInstallmentBeneficiaries(
      installments as Array<Record<string, unknown>>,
      trigger
    );

    // Trigger payment fields validation
    triggerPaymentFieldsValidation(
      installments as Array<Record<string, unknown>>,
      trigger
    );
  } catch (validationError) {
    console.error('Error during installment validation:', validationError);
  }
}
