import { useTranslation } from 'react-i18next';
import React, { forwardRef, useImperativeHandle } from 'react';
import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldErrors,
  FieldValues,
  FieldArrayPath
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
} from './BeneficiaryFieldGroup';
import { useBeneficiaryManagement } from '../../../../hooks/useBeneficiaryManagement';
import { useInstallmentBeneficiaryManagement } from '../../../../hooks/useInstallmentBeneficiaryManagement';

type BeneficiaryFieldPath = FieldArrayPath<FieldValues>;

export type BeneficiaryFieldRef = {
  resetAllBeneficiaries?: () => void;
};

type BeneficiaryFieldProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly isSubmitted: boolean;
  readonly errors: FieldErrors<T>;
  readonly totalAmount: string;
  readonly fieldNamePrefix: BeneficiaryFieldPath;
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
};

/**
 * Main component for beneficiary management
 * Allows adding, removing and validating up to 4 beneficiaries
 */
const BeneficiaryField = forwardRef(
  (
    props: BeneficiaryFieldProps<FieldValues>,
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
      installmentsFieldNamePrefix
    } = props;

    const { t } = useTranslation();

    const beneficiaryManager =
      isInsideInstallment &&
      installmentIndex !== undefined &&
      installmentsFieldNamePrefix
        ? useInstallmentBeneficiaryManagement<FieldValues>({
            control,
            index: installmentIndex,
            installmentsFieldNamePrefix,
            isSubmitted,
            getValues,
            setValue,
            trigger,
            onToggleMultibeneficiary
          })
        : useBeneficiaryManagement<FieldValues>({
            control,
            fieldNamePrefix,
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

    const renderAddBeneficiaryButton = (index: number): JSX.Element | null => {
      if (index === fields.length - 1 && fields.length < MAX_BENEFICIARIES) {
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

    const createValidationContext = (
      field: Record<'id', string>,
      index: number
    ): BeneficiaryValidationContext<FieldValues> => {
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

    const renderBeneficiary = (field: Record<'id', string>, index: number) => {
      const validationContext = createValidationContext(field, index);

      return (
        <Paper
          key={field.id}
          sx={{
            p: 2,
            mb: 2,
            position: 'relative'
          }}
        >
          <BeneficiaryHeader index={index} t={t} onRemove={removeBeneficiary} />

          <Grid container spacing={2}>
            <BeneficiaryIdentityFields
              control={control}
              index={index}
              fieldNamePrefix={fieldNamePrefix}
              validationContext={validationContext}
              disabled={disabled}
              t={t}
            />

            <BeneficiaryAmountFields
              control={control}
              index={index}
              fieldNamePrefix={fieldNamePrefix}
              validationContext={validationContext}
              disabled={disabled}
              fields={fields}
              validators={validators}
              trigger={trigger}
              t={t}
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
              fieldValidators={fieldValidators}
              t={t}
            />

            <BeneficiaryClassificationFields
              control={control}
              index={index}
              fieldNamePrefix={fieldNamePrefix}
              validationContext={validationContext}
              disabled={disabled}
              t={t}
            />
          </Grid>

          {renderAddBeneficiaryButton(index)}
        </Paper>
      );
    };

    return (
      <Box>
        {fields.map((field: Record<'id', string>, index: number) =>
          renderBeneficiary(field, index)
        )}
      </Box>
    );
  }
);

export default BeneficiaryField;
