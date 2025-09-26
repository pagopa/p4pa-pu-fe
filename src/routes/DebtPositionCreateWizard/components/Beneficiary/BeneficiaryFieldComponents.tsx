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
  hasFieldError,
  getFieldErrorMessage,
  shouldSkipValidation,
  buildFieldPath
} from '../../../../utils/beneficiaryValidation';
import type { BeneficiaryValidationContext } from '../../../../models/paymentTypes';
import {
  handleAmountInputBlur,
  handleAmountInputChange,
  formatAmountForDisplay
} from '../../../../utils/paymentUtility';

let ibanValidationTimer: ReturnType<typeof setTimeout> | null = null;
let postalIbanValidationTimer: ReturnType<typeof setTimeout> | null = null;
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

  // Validate IBAN
  ibanValidationTimer = debounceValidation(() => {
    trigger(buildFieldPath<T, 'iban'>(fieldNamePrefix, index, 'iban'));
  }, ibanValidationTimer);
}

export function handlePostalIbanChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  index: number,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string
) {
  const upperValue = e.target.value.toUpperCase();
  onChange(upperValue);

  // Validate postalIban
  postalIbanValidationTimer = debounceValidation(() => {
    trigger(
      buildFieldPath<T, 'postalIban'>(fieldNamePrefix, index, 'postalIban')
    );
  }, postalIbanValidationTimer);
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
    isEditing?: boolean;
  }>
) {
  const { index, t, onRemove, isEditing = false } = props;

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
        data-testid={`beneficiary-remove-${index}`}
        onClick={() => onRemove(index)}
        startIcon={<DeleteOutlineIcon />}
        color="error"
        variant="text"
        disabled={isEditing}
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
    context: BeneficiaryValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      data-testid={`beneficiary-entity-name-${context.index}`}
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
    context: BeneficiaryValidationContext<T>;
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
      data-testid={`beneficiary-amount-${index}`}
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
    context: BeneficiaryValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      data-testid={`beneficiary-tax-code-${context.index}`}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.vat.label')}
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
    context: BeneficiaryValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      data-testid={`beneficiary-remittance-${context.index}`}
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
  context: BeneficiaryValidationContext<T>,
  errors: FieldErrors<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
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

export function hasPostalIbanError<T extends FieldValues>(
  context: BeneficiaryValidationContext<T>,
  errors: FieldErrors<T>
): boolean {
  if (shouldSkipValidation(context)) {
    return false;
  }

  const postalIban = context.getValues(
    buildFieldPath<T, 'postalIban'>(
      context.fieldNamePrefix,
      context.index,
      'postalIban'
    )
  );

  // if the field is empty, don't show errors (optional field)
  if (!postalIban || postalIban.trim() === '') {
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
        if (beneficiaries[context.index]?.postalIban) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking postalIban errors in installments:', error);
    }
  }

  const fieldErrors = (
    errors[context.fieldNamePrefix] as unknown as Record<
      number,
      FieldErrors<Record<string, unknown>>
    >
  )?.[context.index];

  return !!fieldErrors?.postalIban;
}

export function getIBANErrorMessage<T extends FieldValues>(
  context: BeneficiaryValidationContext<T>,
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

export function getPostalIbanErrorMessage<T extends FieldValues>(
  context: BeneficiaryValidationContext<T>,
  errors: FieldErrors<T>
): string {
  if (shouldSkipValidation(context)) {
    return '';
  }

  const postalIban = context.getValues(
    buildFieldPath<T, 'postalIban'>(
      context.fieldNamePrefix,
      context.index,
      'postalIban'
    )
  );

  // if the field is empty, don't show errors (optional field)
  if (!postalIban || postalIban.trim() === '') {
    return '';
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
        if (beneficiaries[context.index]?.postalIban) {
          return beneficiaries[context.index]?.postalIban?.message || '';
        }
      }
    } catch (error) {
      console.error(
        'Error retrieving postalIban error message from installments:',
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

  return (fieldErrors?.postalIban?.message as string) || '';
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
    context: BeneficiaryValidationContext<T>;
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
      data-testid={`beneficiary-iban-${index}`}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.iban.label')}
      disabled={disabled}
      required
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

export function PostalIbanField<T extends FieldValues>(
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
    context: BeneficiaryValidationContext<T>;
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
      data-testid={`beneficiary-postal-iban-${index}`}
      fullWidth
      label={t('debtPositionCreateWizard.step3.beneficiary.postalIban.label')}
      disabled={disabled}
      error={hasPostalIbanError(context, errors)}
      helperText={
        hasPostalIbanError(context, errors)
          ? getPostalIbanErrorMessage(context, errors)
          : undefined
      }
      value={actualValue}
      onChange={(e) => {
        handlePostalIbanChange(
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

export function hasPostalAccountError<T extends FieldValues>(
  context: BeneficiaryValidationContext<T>,
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
  context: BeneficiaryValidationContext<T>,
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
    context: BeneficiaryValidationContext<T>;
    index: number;
    trigger: UseFormTrigger<T>;
    fieldNamePrefix: string;
    errors: FieldErrors<T>;
  }>
) {
  const { field, t, disabled = false, context, errors, index } = props;

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      data-testid={`beneficiary-postal-account-${index}`}
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
        field.onChange(e.target.value);
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
    context: BeneficiaryValidationContext<T>;
  }>
) {
  const { field, t, disabled = false, context } = props;

  const actualValue =
    context.getValues(field.name as Path<T>) ?? field.value ?? '';

  return (
    <TextField
      {...field}
      data-testid={`beneficiary-taxonomy-code-${context.index}`}
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
