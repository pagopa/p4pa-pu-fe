import { useTranslation } from 'react-i18next';
import React, { useImperativeHandle } from 'react';
import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors,
  FieldValues,
  FieldArrayPath,
  Path
} from 'react-hook-form';
import { Grid, Paper, Box, Button, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import { BeneficiaryHeader } from './BeneficiaryFieldComponents';
import { BeneficiaryValidationContext } from '../../../../utils/BeneficiaryFieldHelpers';
import {
  BeneficiaryIdentityFields,
  BeneficiaryAmountFields,
  BeneficiaryPaymentFields,
  BeneficiaryClassificationFields
} from './BeneficiaryFieldControls';
import { useBeneficiaryManagement } from '../../../../hooks/useBeneficiaryManagement';
import { useInstallmentBeneficiaryManagement } from '../../../../hooks/useInstallmentBeneficiaryManagement';

// ===== TYPES =====
type BeneficiaryField = Record<string, unknown> & { id: string };

// Type for functions exposed by ref
export type BeneficiaryFieldRef = {
  resetAllBeneficiaries?: () => void;
};

type BeneficiaryFieldProps<T extends FieldValues = FieldValues> = {
  readonly control: Control<T>;
  readonly isSubmitted: boolean;
  readonly errors: FieldErrors<T>;
  readonly totalAmount: string;
  readonly fieldNamePrefix: string;
  readonly disabled?: boolean;
  readonly setValue: UseFormSetValue<T>;
  readonly getValues: UseFormGetValues<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly onToggleMultibeneficiary?: (value: boolean) => void;
  readonly onBeneficiariesChange?: (
    summary: Array<{
      id: string;
      index: number;
      isNew: boolean;
      dati: Record<string, unknown>;
    }>
  ) => void;
  readonly isInsideInstallment?: boolean;
  readonly installmentIndex?: number;
  readonly installmentsFieldNamePrefix?: string;
  readonly isEditing?: boolean;
};

/**
 * Main component for beneficiary management - Improved version with useReducer
 * Allows adding, removing and validating up to 4 beneficiaries
 * Maintains the same UI but uses reducer hooks for better state management
 */
type BeneficiaryFieldComponent = {
  <T extends FieldValues>(
    props: BeneficiaryFieldProps<T> & {
      ref?: React.ForwardedRef<BeneficiaryFieldRef>;
    }
  ): React.ReactElement;
  displayName?: string;
};

const InternalBeneficiaryField = <T extends FieldValues>(
  props: BeneficiaryFieldProps<T>,
  ref: React.ForwardedRef<BeneficiaryFieldRef>
) => {
  const {
    control,
    isSubmitted,
    errors,
    totalAmount,
    fieldNamePrefix,
    disabled = false,
    setValue,
    getValues,
    trigger,
    onToggleMultibeneficiary,
    onBeneficiariesChange,
    isInsideInstallment = false,
    installmentIndex,
    installmentsFieldNamePrefix,
    isEditing
  } = props;

  const { t } = useTranslation();

  const beneficiaryManager =
    isInsideInstallment &&
    installmentIndex !== undefined &&
    installmentsFieldNamePrefix
      ? useInstallmentBeneficiaryManagement<T>({
          control,
          index: installmentIndex,
          installmentsFieldNamePrefix,
          isSubmitted,
          getValues,
          setValue,
          trigger,
          onToggleMultibeneficiary
        })
      : useBeneficiaryManagement<T>({
          control,
          fieldNamePrefix: fieldNamePrefix as FieldArrayPath<T>,
          isSubmitted,
          getValues,
          trigger,
          totalAmount,
          onToggleMultibeneficiary,
          onBeneficiariesChange
        });

  const {
    fields,
    validators,
    fieldValidators,
    MAX_BENEFICIARIES,
    existingBeneficiaries,
    wasSubmittedRef,
    addBeneficiary,
    removeBeneficiary,
    resetAllBeneficiaries
  } = beneficiaryManager;

  useImperativeHandle(ref, () => ({
    resetAllBeneficiaries
  }));

  /**
   * Renders the button to add a new beneficiary
   * Only visible on the last beneficiary and if the maximum limit hasn't been reached
   */
  const renderAddBeneficiaryButton = (index: number): JSX.Element | null => {
    if (
      index === fields.length - 1 &&
      fields.length < MAX_BENEFICIARIES &&
      !isEditing
    ) {
      return (
        <>
          <Divider sx={{ mt: 2, mb: 1 }} />
          <Box>
            <Button
              startIcon={<Add />}
              onClick={addBeneficiary}
              sx={{ mt: 1 }}
              variant="text"
              color="primary"
              disabled={fields.length >= MAX_BENEFICIARIES}
            >
              {t('debtPositionCreateWizard.step3.beneficiary.addBeneficiary')}
            </Button>
          </Box>
        </>
      );
    }
    return null;
  };

  /**
   * Creates validation context for a beneficiary
   */
  const createValidationContext = (
    field: BeneficiaryField,
    index: number
  ): BeneficiaryValidationContext<T> => {
    return {
      id: field.id,
      index,
      isSubmitted,
      wasSubmittedRef,
      existingBeneficiaries,
      errors,
      fieldNamePrefix,
      getValues,
      t
    };
  };

  /**
   * Renders a single beneficiary with its field groups
   */
  const renderBeneficiary = (field: BeneficiaryField, index: number) => {
    const validationContext = createValidationContext(field, index);

    // Get readonly properties for this beneficiary from form data
    const beneficiaryData = getValues(`${fieldNamePrefix}.${index}` as Path<T>);
    const beneficiaryReadonly = beneficiaryData?.readonly;

    return (
      <Paper
        key={field.id}
        sx={{
          p: 2,
          mb: 2,
          position: 'relative'
        }}
      >
        <BeneficiaryHeader
          index={index}
          t={t}
          onRemove={removeBeneficiary}
          isEditing={isEditing}
        />

        <Grid container spacing={2}>
          <BeneficiaryIdentityFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            t={t}
            beneficiaryReadonly={beneficiaryReadonly}
          />

          <BeneficiaryAmountFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            fields={fields as Array<Record<'id', string>>}
            validators={
              validators as unknown as {
                isValidTotalAmount: () => boolean;
                isSingleBeneficiaryAmountValid: (
                  hasSingleBeneficiary: boolean
                ) => boolean;
                validateTotalAmount: () => string | true;
                validateSingleBeneficiary: (
                  amount: string,
                  fieldsLength: number
                ) => string | true;
                isBeneficiaryAmountValid: (
                  index: number,
                  hasSingleBeneficiary: boolean
                ) => boolean;
              }
            }
            trigger={trigger}
            t={t}
            beneficiaryReadonly={beneficiaryReadonly}
          />

          <BeneficiaryPaymentFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            getValues={getValues}
            trigger={trigger}
            errors={errors}
            fieldValidators={
              fieldValidators as unknown as {
                validateBeneficiaryTaxCode: (
                  value: string
                ) => string | undefined;
                validateIBAN: (value: string) => string | undefined;
                validatePostalIban: (value: string) => string | undefined;
                validatePaymentMethod: (
                  iban: string,
                  postalAccount?: string
                ) => string | undefined;
                validateRemittance: (value: string) => string | undefined;
              }
            }
            t={t}
            beneficiaryReadonly={beneficiaryReadonly}
          />

          <BeneficiaryClassificationFields
            control={control}
            index={index}
            fieldNamePrefix={fieldNamePrefix}
            validationContext={validationContext}
            disabled={disabled}
            t={t}
            beneficiaryReadonly={beneficiaryReadonly}
          />
        </Grid>

        {renderAddBeneficiaryButton(index)}
      </Paper>
    );
  };

  return (
    <Box>
      {fields.map((field, index) =>
        renderBeneficiary(field as BeneficiaryField, index)
      )}
    </Box>
  );
};

const BeneficiaryField = React.forwardRef(
  InternalBeneficiaryField
) as unknown as BeneficiaryFieldComponent;

BeneficiaryField.displayName = 'BeneficiaryField';

export default BeneficiaryField;
