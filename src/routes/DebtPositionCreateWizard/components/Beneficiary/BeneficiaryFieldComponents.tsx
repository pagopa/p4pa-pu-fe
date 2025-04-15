import React from 'react';
import {
  TextField,
  InputAdornment,
  Typography,
  Box,
  Button
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormTrigger,
  FieldError
} from 'react-hook-form';
import {
  ValidationContext,
  hasFieldError,
  getFieldErrorMessage,
  shouldSkipValidation,
  buildFieldPath
} from '../../../../utils/beneficiaryValidation';

// Validation debounce timers
let ibanValidationTimer: ReturnType<typeof setTimeout> | null = null;
let postalAccountValidationTimer: ReturnType<typeof setTimeout> | null = null;
let amountValidationTimer: ReturnType<typeof setTimeout> | null = null;

// Type for beneficiary error structure
interface BeneficiaryError {
  iban?: { message?: string };
  postalAccount?: { message?: string };
}

// Type for installment error structure
interface InstallmentError {
  beneficiaries?: Array<BeneficiaryError>;
}

// Type for form errors with installments
type FormErrorsWithInstallments = FieldErrors<{
  installments?: Array<InstallmentError>;
}>;

// Function to execute validation with debounce
function debounceValidation(
  callback: () => void,
  timer: ReturnType<typeof setTimeout> | null,
  delay = 300
): ReturnType<typeof setTimeout> {
  if (timer) clearTimeout(timer);
  return setTimeout(callback, delay);
}

// ===== EVENT HANDLERS =====
export function handleAmountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  fields: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Accept only numbers, dot and comma
  const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
  // Convert comma to dot for internal numeric handling
  const normalizedValue = filteredValue.replace(',', '.');

  // Update field value immediately to improve UX
  onChange(normalizedValue);

  if (amountValidationTimer) {
    clearTimeout(amountValidationTimer);
  }

  amountValidationTimer = setTimeout(() => {
    // Validate after user stops typing for 300ms

    if (fields.length > 1) {
      fields.forEach((_, i) => {
        if (i !== index) {
          trigger(buildFieldPath<T, 'amount'>(fieldNamePrefix, i, 'amount'));
        }
      });
    }

    // Validate current field last
    trigger(buildFieldPath<T, 'amount'>(fieldNamePrefix, index, 'amount'));
  }, 300);
}

export function handleIBANChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Convert to uppercase
  const upperValue = e.target.value.toUpperCase();
  onChange(upperValue);

  // Revalidate postal account field when IBAN changes
  // For tests: call trigger immediately, for app: use debounce
  if (process.env.NODE_ENV === 'test') {
    trigger(
      buildFieldPath<T, 'postalAccount'>(
        fieldNamePrefix,
        index,
        'postalAccount'
      )
    );
  } else {
    ibanValidationTimer = debounceValidation(() => {
      trigger(
        buildFieldPath<T, 'postalAccount'>(
          fieldNamePrefix,
          index,
          'postalAccount'
        )
      );
    }, ibanValidationTimer);
  }
}

export function handlePostalAccountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  // Accept only numeric characters
  const filteredValue = e.target.value.replace(/\D/g, '');
  onChange(filteredValue);

  // Revalidate IBAN field when postal account changes
  // For tests: call trigger immediately, for app: use debounce
  if (process.env.NODE_ENV === 'test') {
    trigger(buildFieldPath<T, 'iban'>(fieldNamePrefix, index, 'iban'));
  } else {
    postalAccountValidationTimer = debounceValidation(() => {
      trigger(buildFieldPath<T, 'iban'>(fieldNamePrefix, index, 'iban'));
    }, postalAccountValidationTimer);
  }
}

export function handleAmountBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  onBlur: () => void
) {
  // Format value with two decimals when field loses focus
  const value = e.target.value.replace(',', '.');
  if (value && !isNaN(parseFloat(value))) {
    onChange(parseFloat(value).toFixed(2));
  }
  onBlur();
}

// ===== RENDER FUNCTIONS =====
export function BeneficiaryHeader(
  props: Readonly<{
    index: number;
    t: (key: string) => string;
    onRemove: (index: number) => void;
  }>
) {
  const { index, t, onRemove } = props;

  return (
    <Box
      mb={2}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
          {`${index + 1}. `}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {t('debtPositionCreateWizard.step3.beneficiary.title')}
        </Typography>
      </Box>
      <Button
        onClick={() => onRemove(index)}
        startIcon={<DeleteOutlineIcon />}
        color="error"
        variant="text"
        sx={{ position: 'absolute', top: 8, right: 8, minWidth: 'auto' }}
      >
        {t('commons.delete')}
      </Button>
    </Box>
  );
}

// Entity Name Field component
export function EntityNameField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.entityName.label')}
      required
      disabled={disabled}
      error={hasFieldError('entityName', context)}
      helperText={getFieldErrorMessage('entityName', context)}
      value={actualValue}
      onChange={(e) => {
        field.onChange(e.target.value);
      }}
    />
  );
}

// Amount Field component
export function AmountField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
    index: number;
    fields: Array<Record<string, unknown>>;
    trigger: UseFormTrigger<T>;
    fieldNamePrefix: string;
  }>
) {
  const {
    field,
    t,
    disabled = false,
    context,
    index,
    fields,
    trigger,
    fieldNamePrefix
  } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';
  // Cast to string and format
  const valueAsString = String(actualValue);
  const displayValue = valueAsString ? valueAsString.replace('.', ',') : '';

  // Check errors specifically for this field
  const hasError = hasFieldError('amount', context);
  const errorMessage = getFieldErrorMessage('amount', context);

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.amount.label')}
      required
      disabled={disabled}
      value={displayValue}
      error={hasError}
      helperText={errorMessage}
      onChange={(e) =>
        handleAmountChange(
          e,
          field.onChange,
          index,
          fields,
          trigger,
          fieldNamePrefix
        )
      }
      onBlur={(e) => handleAmountBlur(e, field.onChange, field.onBlur)}
      InputProps={{
        startAdornment: <InputAdornment position="start">€</InputAdornment>,
        inputProps: {
          inputMode: 'decimal',
          style: { textAlign: 'left' }
        }
      }}
    />
  );
}

// Tax Code Field component
export function TaxCodeField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.taxCode.label')}
      required
      disabled={disabled}
      error={hasFieldError('taxCode', context)}
      helperText={getFieldErrorMessage('taxCode', context)}
      value={actualValue}
      onChange={(e) => {
        field.onChange(e.target.value.toUpperCase());
      }}
    />
  );
}

// Check for IBAN field errors
export function hasIBANError<T extends FieldValues>(
  context: ValidationContext<T>,
  errors: FieldErrors<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  // If postal account has value and IBAN is empty, don't show IBAN errors
  const postalAccount = context.getValues(
    buildFieldPath<T, 'postalAccount'>(
      context.fieldNamePrefix,
      context.index,
      'postalAccount'
    )
  );
  const iban = context.getValues(
    buildFieldPath<T, 'iban'>(context.fieldNamePrefix, context.index, 'iban')
  );

  if (
    (!iban || iban.trim() === '') &&
    postalAccount &&
    postalAccount.trim() !== ''
  ) {
    return false;
  }

  // Check for errors in installments
  if (context.fieldNamePrefix.includes('installments')) {
    try {
      const parts = context.fieldNamePrefix.split('.');
      const installmentIndex = parseInt(parts[1], 10);

      type InstallmentErrorStructure = Record<string, unknown>;
      type BeneficiaryErrorStructure = Record<string, { message?: string }>;

      const installmentsErrors = errors.installments as
        | InstallmentErrorStructure[]
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as BeneficiaryErrorStructure[];
        if (beneficiaries[context.index]?.iban) {
          return true;
        }
      }
    } catch (error) {
      // Error checking installment errors
    }
  }

  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return !!fieldErrors?.iban;
}

// Get IBAN field error message
export function getIBANErrorMessage<T extends FieldValues>(
  context: ValidationContext<T>,
  errors: FieldErrors<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }

  const postalAccount = context.getValues(
    buildFieldPath<T, 'postalAccount'>(
      context.fieldNamePrefix,
      context.index,
      'postalAccount'
    )
  );
  const iban = context.getValues(
    buildFieldPath<T, 'iban'>(context.fieldNamePrefix, context.index, 'iban')
  );
  const bothEmpty =
    (!iban || iban.trim() === '') &&
    (!postalAccount || postalAccount.trim() === '');

  if (
    (!iban || iban.trim() === '') &&
    postalAccount &&
    postalAccount.trim() !== ''
  ) {
    return '';
  }

  // Check if both payment methods are missing
  if (bothEmpty) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
    );
  }

  // Check for errors in installments
  if (context.fieldNamePrefix.includes('installments')) {
    try {
      const parts = context.fieldNamePrefix.split('.');
      const installmentIndex = parseInt(parts[1], 10);

      type InstallmentErrorStructure = Record<string, unknown>;
      type BeneficiaryErrorStructure = Record<string, { message?: string }>;

      const installmentsErrors = errors.installments as
        | InstallmentErrorStructure[]
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as BeneficiaryErrorStructure[];
        if (beneficiaries[context.index]?.iban) {
          return beneficiaries[context.index]?.iban?.message || '';
        }
      }
    } catch (error) {
      // Error checking installment errors
    }
  }

  // Specific IBAN error
  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return (fieldErrors?.iban?.message as string) || '';
}

// IBAN Field component
export function IBANField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
    index: number;
    trigger: UseFormTrigger<T>;
    fieldNamePrefix: string;
    errors: FieldErrors<T>;
  }>
) {
  const {
    field,
    t,
    disabled = false,
    context,
    index,
    trigger,
    fieldNamePrefix,
    errors
  } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.iban.label')}
      disabled={disabled}
      error={hasIBANError(context, errors)}
      helperText={
        hasIBANError(context, errors)
          ? getIBANErrorMessage(context, errors)
          : undefined
      }
      value={actualValue}
      onChange={(e) => {
        handleIBANChange(e, field.onChange, index, trigger, fieldNamePrefix);
      }}
    />
  );
}

// Check for postal account field errors
export function hasPostalAccountError<T extends FieldValues>(
  context: ValidationContext<T>,
  errors: FieldErrors<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  // If IBAN has value and postal account is empty, don't show postal account errors
  const iban = context.getValues(
    buildFieldPath<T, 'iban'>(context.fieldNamePrefix, context.index, 'iban')
  );
  const postalAccount = context.getValues(
    buildFieldPath<T, 'postalAccount'>(
      context.fieldNamePrefix,
      context.index,
      'postalAccount'
    )
  );

  if (
    (!postalAccount || postalAccount.trim() === '') &&
    iban &&
    iban.trim() !== ''
  ) {
    return false;
  }

  // Check for errors in installments
  if (context.fieldNamePrefix.includes('installments')) {
    try {
      const parts = context.fieldNamePrefix.split('.');
      const installmentIndex = parseInt(parts[1], 10);

      type InstallmentErrorStructure = Record<string, unknown>;
      type BeneficiaryErrorStructure = Record<string, { message?: string }>;

      const installmentsErrors = errors.installments as
        | InstallmentErrorStructure[]
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as BeneficiaryErrorStructure[];
        if (beneficiaries[context.index]?.postalAccount) {
          return true;
        }
      }
    } catch (error) {
      // Error checking installment errors
    }
  }

  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return !!fieldErrors?.postalAccount;
}

// Get postal account field error message
export function getPostalAccountErrorMessage<T extends FieldValues>(
  context: ValidationContext<T>,
  errors: FieldErrors<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }

  const iban = context.getValues(
    buildFieldPath<T, 'iban'>(context.fieldNamePrefix, context.index, 'iban')
  );
  const postalAccount = context.getValues(
    buildFieldPath<T, 'postalAccount'>(
      context.fieldNamePrefix,
      context.index,
      'postalAccount'
    )
  );
  const bothEmpty =
    (!iban || iban.trim() === '') &&
    (!postalAccount || postalAccount.trim() === '');

  if (
    (!postalAccount || postalAccount.trim() === '') &&
    iban &&
    iban.trim() !== ''
  ) {
    return '';
  }

  // Check if both payment methods are missing
  if (bothEmpty) {
    return context.t(
      'debtPositionCreateWizard.step3.beneficiary.paymentMethod.required'
    );
  }

  // Check for errors in installments
  if (context.fieldNamePrefix.includes('installments')) {
    try {
      const parts = context.fieldNamePrefix.split('.');
      const installmentIndex = parseInt(parts[1], 10);

      type InstallmentErrorStructure = Record<string, unknown>;
      type BeneficiaryErrorStructure = Record<string, { message?: string }>;

      const installmentsErrors = errors.installments as
        | InstallmentErrorStructure[]
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as BeneficiaryErrorStructure[];
        if (beneficiaries[context.index]?.postalAccount) {
          return beneficiaries[context.index]?.postalAccount?.message || '';
        }
      }
    } catch (error) {
      // Error checking installment errors
    }
  }

  // Specific postal account error
  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return (fieldErrors?.postalAccount?.message as string) || '';
}

// Postal Account Field component
export function PostalAccountField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
    index: number;
    trigger: UseFormTrigger<T>;
    fieldNamePrefix: string;
    errors: FieldErrors<T>;
  }>
) {
  const {
    field,
    t,
    disabled = false,
    context,
    index,
    trigger,
    fieldNamePrefix,
    errors
  } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t(
        'debtPositionCreateWizard.step3.beneficiary.postalAccount.label'
      )}
      disabled={disabled}
      error={hasPostalAccountError(context, errors)}
      helperText={
        hasPostalAccountError(context, errors)
          ? getPostalAccountErrorMessage(context, errors)
          : undefined
      }
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      value={actualValue}
      onChange={(e) => {
        handlePostalAccountChange(
          e,
          field.onChange,
          index,
          trigger,
          fieldNamePrefix
        );
      }}
    />
  );
}

// Taxonomy Code Field component
export function TaxonomyCodeField<T extends FieldValues>(
  props: Readonly<{
    field: {
      onChange: (...event: Array<unknown>) => void;
      onBlur: () => void;
      value: string;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
    t: (key: string) => string;
    disabled?: boolean;
    context: ValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  // Get value directly from context to ensure we always have the updated value
  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.taxonomyCode.label')}
      required
      disabled={disabled}
      error={hasFieldError('taxonomyCode', context)}
      helperText={getFieldErrorMessage('taxonomyCode', context)}
      value={actualValue}
      onChange={(e) => {
        field.onChange(e.target.value);
      }}
    />
  );
}
