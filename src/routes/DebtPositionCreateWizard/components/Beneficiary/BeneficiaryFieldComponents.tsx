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
  UseFormTrigger
} from 'react-hook-form';
import {
  ValidationContext,
  hasFieldError,
  getFieldErrorMessage,
  shouldSkipValidation,
  buildFieldPath
} from '../../../../utils/beneficiaryValidation';
import {
  handleAmountInputBlur,
  handleAmountInputChange,
  formatAmountForDisplay
} from '../../../../utils/paymentUtility';

let ibanValidationTimer: ReturnType<typeof setTimeout> | null = null;
let postalAccountValidationTimer: ReturnType<typeof setTimeout> | null = null;
let amountValidationTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Implements debounce mechanism for validation triggers
 */
function debounceValidation(
  callback: () => void,
  timer: ReturnType<typeof setTimeout> | null,
  delay = 300
): ReturnType<typeof setTimeout> {
  if (timer) clearTimeout(timer);
  return setTimeout(callback, delay);
}

/** EVENT HANDLERS */

export function handleAmountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  fields: Array<Record<string, unknown>>,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  const normalizedValue = handleAmountInputChange(e.target.value);

  onChange(normalizedValue);

  if (amountValidationTimer) {
    clearTimeout(amountValidationTimer);
  }

  amountValidationTimer = setTimeout(() => {
    if (fields.length > 1) {
      fields.forEach((_, i) => {
        if (i !== index) {
          trigger(buildFieldPath<T, 'amount'>(fieldNamePrefix, i, 'amount'));
        }
      });
    }
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
  const upperValue = e.target.value.toUpperCase();
  onChange(upperValue);

  // Revalidate postal account when IBAN changes
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

  // Revalidate IBAN when postal account changes
  postalAccountValidationTimer = debounceValidation(() => {
    trigger(buildFieldPath<T, 'iban'>(fieldNamePrefix, index, 'iban'));
  }, postalAccountValidationTimer);
}

export function handleAmountBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  onBlur: () => void
) {
  const formattedValue = handleAmountInputBlur(e.target.value);
  if (formattedValue !== e.target.value) {
    onChange(formattedValue);
  }
  onBlur();
}

/** RENDER FUNCTIONS */

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

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';
  const displayValue = formatAmountForDisplay(String(actualValue));
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

export function RemittanceField<T extends FieldValues>(
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

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.remittance.label')}
      required
      disabled={disabled}
      error={hasFieldError('remittance', context)}
      helperText={getFieldErrorMessage('remittance', context)}
      value={actualValue}
      onChange={(e) => {
        field.onChange(e.target.value);
      }}
    />
  );
}

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
        | Array<InstallmentErrorStructure>
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as Array<BeneficiaryErrorStructure>;
        if (beneficiaries[context.index]?.iban) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking IBAN errors in installments:', error);
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
        | Array<InstallmentErrorStructure>
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as Array<BeneficiaryErrorStructure>;
        if (beneficiaries[context.index]?.iban) {
          return beneficiaries[context.index]?.iban?.message || '';
        }
      }
    } catch (error) {
      console.error(
        'Error retrieving IBAN error message from installments:',
        error
      );
    }
  }

  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return (fieldErrors?.iban?.message as string) || '';
}

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
        | Array<InstallmentErrorStructure>
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as Array<BeneficiaryErrorStructure>;
        if (beneficiaries[context.index]?.postalAccount) {
          return true;
        }
      }
    } catch (error) {
      console.error(
        'Error checking postal account errors in installments:',
        error
      );
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
        | Array<InstallmentErrorStructure>
        | undefined;
      if (installmentsErrors && installmentsErrors[installmentIndex]) {
        const beneficiaries = (installmentsErrors[installmentIndex]
          ?.beneficiaries || []) as Array<BeneficiaryErrorStructure>;
        if (beneficiaries[context.index]?.postalAccount) {
          return beneficiaries[context.index]?.postalAccount?.message || '';
        }
      }
    } catch (error) {
      console.error(
        'Error retrieving postal account error message from installments:',
        error
      );
    }
  }

  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return (fieldErrors?.postalAccount?.message as string) || '';
}

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
