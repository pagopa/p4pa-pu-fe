/**
 * @fileoverview Utility file for payment management.
 * This module provides reusable functions for payment processing and validation.
 * @module paymentUtility
 */
import { FieldErrors, FieldValues, Path } from 'react-hook-form';
import { BeneficiaryValidationContext } from '../models/paymentTypes';

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
