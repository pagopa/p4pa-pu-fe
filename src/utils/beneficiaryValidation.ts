import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormGetValues
} from 'react-hook-form';

// ===== VALIDATION TYPES =====
export type BeneficiaryFieldValidators = {
  validateBeneficiaryTaxCode: (value: string) => string | undefined;
  validateIBAN: (value: string) => string | undefined;
  validatePostalIban: (value: string) => string | undefined;
  validatePaymentMethod: (
    iban: string,
    postalAccount: string
  ) => string | undefined;
};

export type ValidationContext<T extends FieldValues> = {
  id: string;
  index: number;
  isSubmitted: boolean;
  wasSubmittedRef: React.RefObject<boolean>;
  existingBeneficiaries: Record<string, boolean>;
  errors: FieldErrors<T>;
  fieldNamePrefix: string;
  getValues: UseFormGetValues<T>;
  t: (key: string) => string;
};

// ===== UTILITY FUNCTIONS =====
// Verifica se un valore di stringa è vuoto
export function isEmpty(value?: string | unknown): boolean {
  if (typeof value !== 'string') {
    return true;
  }
  return !value || value.trim() === '';
}

// Ottiene i dati di errore dal form
export function getErrorData<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldNamePrefix: string,
  index: number,
  fieldName: string
) {
  // Type for beneficiary errors
  type BeneficiaryError = {
    message?: string;
  };

  // Type for the complete error structure
  type InstallmentsErrors = Record<
    string,
    Record<
      number,
      {
        beneficiaries?: Record<number, Record<string, BeneficiaryError>>;
      }
    >
  >;

  // Special case handling for beneficiaries within installments
  // The path might be something like 'installments.0.beneficiaries'
  if (fieldNamePrefix.includes('installments')) {
    // Split the prefix into parts to navigate the structure
    const parts = fieldNamePrefix.split('.');

    if (parts.length >= 2) {
      // Navigate the errors object to the specific installment errors
      const installmentIndex = parseInt(parts[1], 10);

      // Use optional chaining to safely navigate the structure
      const installmentsErrors = errors as unknown as InstallmentsErrors;
      const beneficiaryErrors =
        installmentsErrors?.installments?.[installmentIndex]?.beneficiaries?.[
          index
        ];

      if (beneficiaryErrors) {
        // Check if there's an error for the specific field
        const hasError = !!beneficiaryErrors[fieldName];
        const errorMessage = beneficiaryErrors[fieldName]?.message || '';

        return { hasError, errorMessage };
      }
    }
  }

  // Standard case - using optional chaining to avoid errors
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

// ===== VALIDATION FUNCTIONS =====
// Checks if a beneficiary is new (added after submit)
export function isBeneficiaryNew(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return !!wasSubmittedRef.current && !existingBeneficiaries[id];
}

// Checks if a beneficiary has been recently created (new)
export function isRecentlyCreated(
  id: string,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  if (!wasSubmittedRef.current) {
    return true;
  }
  return !existingBeneficiaries[id];
}

// Determines whether to show validation errors for a beneficiary
export function shouldShowValidationErrors(
  id: string,
  isSubmitted: boolean,
  wasSubmittedRef: React.RefObject<boolean>,
  existingBeneficiaries: Record<string, boolean>
): boolean {
  return (
    isSubmitted &&
    !(
      isRecentlyCreated(id, wasSubmittedRef, existingBeneficiaries) &&
      !wasSubmittedRef.current
    )
  );
}

// Checks if validation should be skipped
export function shouldSkipValidation<T extends FieldValues>(
  context: ValidationContext<T>
): boolean {
  return !shouldShowValidationErrors(
    context.id,
    context.isSubmitted,
    context.wasSubmittedRef,
    context.existingBeneficiaries
  );
}

// Helper to build a typed path for form fields
export function buildFieldPath<T extends FieldValues, K extends string>(
  fieldNamePrefix: string,
  index: number,
  field: K
): Path<T> {
  return `${fieldNamePrefix}.${index}.${field}` as Path<T>;
}

// Checks if a field has errors
export function hasFieldError<T extends FieldValues>(
  fieldName: string,
  context: ValidationContext<T>
): boolean {
  if (shouldSkipValidation(context)) {
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

// Gets the error message for a field
export function getFieldErrorMessage<T extends FieldValues>(
  fieldName: string,
  context: ValidationContext<T>
): string {
  if (shouldSkipValidation(context)) {
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

// Gets a field value from the form
export function getFieldValue<T extends FieldValues, K extends string>(
  context: ValidationContext<T>,
  field: K
): string {
  return context.getValues(
    buildFieldPath<T, K>(context.fieldNamePrefix, context.index, field)
  );
}

// Checks payment fields (IBAN and postal account)
export function checkPaymentFields<T extends FieldValues>(
  context: ValidationContext<T>
): { iban: string; postalAccount: string; bothEmpty: boolean } {
  const iban = getFieldValue(context, 'iban');
  const postalAccount = getFieldValue(context, 'postalAccount');
  const bothEmpty = isEmpty(iban) && isEmpty(postalAccount);

  return { iban, postalAccount, bothEmpty };
}

// Validates a single amount
export function validateSingleAmount<T extends FieldValues>(
  value: string,
  context: ValidationContext<T>
): string | undefined {
  const amount = parseFloat(value);
  if (
    isRecentlyCreated(
      context.id,
      context.wasSubmittedRef,
      context.existingBeneficiaries
    ) &&
    !context.wasSubmittedRef.current
  ) {
    return undefined;
  }
  if (isNaN(amount) || amount <= 0) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.amount.invalid'
    );
  }
  return undefined;
}

// Creates base validation rules for fields
export function createBaseValidationRule(
  wasSubmittedRef: React.RefObject<boolean>,
  validator: (value: string) => string | undefined
) {
  return (value: string): string | undefined => {
    // Don't validate if no submit has been made
    if (wasSubmittedRef.current === false) {
      return undefined;
    }
    return validator(value);
  };
}

// Rules for payment method validation
export function createPaymentMethodValidator(
  getOtherFieldValue: () => string,
  validator: (value1: string, value2: string) => string | undefined
) {
  return (value: string): string | undefined => {
    const otherValue = getOtherFieldValue();
    // If one of the two is filled, don't show errors
    if (!isEmpty(value) || !isEmpty(otherValue)) {
      return undefined;
    }
    return validator(value, otherValue);
  };
}
