import { Box, Button, Typography, Grid, Paper, Divider } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldArrayPath,
  FieldArrayWithId,
  Path
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useInstallmentManagement } from '../../../../hooks/useInstallmentManagement';
import InstallmentItem from './InstallmentItem';
import { Installment } from '../../../../models/paymentTypes';

// Update the type to match what is actually provided
export type ValidationFunctions = {
  validateInstallmentAmount: <T extends FieldValues>(
    index: number,
    trigger: UseFormTrigger<T>
  ) => void;
  validateDueDate: <T extends FieldValues>(
    index: number,
    trigger: UseFormTrigger<T>
  ) => void;
  validateRemittance: <T extends FieldValues>(
    index: number,
    trigger: UseFormTrigger<T>
  ) => void;
};

type InstallmentFieldProps<T extends FieldValues> = {
  readonly control: Control<T>;
  readonly errors: FieldErrors<T>;
  readonly isSubmitted: boolean;
  readonly setValue: UseFormSetValue<T>;
  readonly getValues: UseFormGetValues<T>;
  readonly trigger: UseFormTrigger<T>;
  readonly fieldNamePrefix: string;
  readonly disabled?: boolean;
  readonly flagMandatoryDueDate?: boolean;
  readonly onInstallmentsChange?: (totalAmount: string) => void;
  readonly isEditing?: boolean;
  readonly shouldShowErrors?: (componentCreationCount?: number) => boolean;
  readonly submissionCount?: number; // Still needed for creation tracking
};

/**
 * Component for payment installment management
 * Maintains the same UI but uses hooks with reducer for better state management
 */
function InstallmentField<T extends FieldValues>({
  control,
  errors,
  isSubmitted,
  setValue,
  getValues,
  trigger,
  fieldNamePrefix,
  disabled = false,
  flagMandatoryDueDate = true,
  onInstallmentsChange,
  isEditing = false,
  shouldShowErrors,
  submissionCount = 0
}: InstallmentFieldProps<T>) {
  const { t } = useTranslation();

  const {
    fields,
    MIN_INSTALLMENTS,
    MAX_INSTALLMENTS,
    addInstallment,
    removeInstallment,
    existingInstallments
  } = useInstallmentManagement<T>({
    control,
    fieldNamePrefix: fieldNamePrefix as FieldArrayPath<T>,
    isSubmitted,
    getValues,
    setValue,
    trigger,
    flagMandatoryDueDate,
    submissionCount,
    onInstallmentsChange: (_installments, totalAmount) => {
      if (onInstallmentsChange) {
        onInstallmentsChange(totalAmount);
      }
    }
  });

  const isMaxInstallments = fields.length >= MAX_INSTALLMENTS;

  const createValidationFunctions = () => {
    return {
      validateInstallmentAmount: <U extends FieldValues>(
        index: number,
        triggerFn: UseFormTrigger<U>
      ) => {
        triggerFn(`${fieldNamePrefix}.${index}.amount` as Path<U>);
      },
      validateDueDate: <U extends FieldValues>(
        index: number,
        triggerFn: UseFormTrigger<U>
      ) => {
        triggerFn(`${fieldNamePrefix}.${index}.dueDate` as Path<U>);
      },
      validateRemittance: <U extends FieldValues>(
        index: number,
        triggerFn: UseFormTrigger<U>
      ) => {
        triggerFn(`${fieldNamePrefix}.${index}.remittance` as Path<U>);
      }
    };
  };

  const validationFunctions = createValidationFunctions();

  // Get readonly properties for each installment from form data
  const getInstallmentReadonlyProps = (index: number) => {
    const installments = getValues(fieldNamePrefix as Path<T>) as
      | Array<Installment>
      | undefined;
    return installments?.[index]?.readonly;
  };

  return (
    <Box
      component={Paper}
      data-testid="installments-container"
      sx={{ p: 3, mt: 4, borderRadius: 1 }}
    >
      <Typography variant="h4" component="h3" fontWeight="bold" mb={3}>
        {t('debtPositionCreateWizard.step3.installments.title')}
      </Typography>

      <Grid container spacing={3}>
        {fields.map((field, index) => {
          const readonlyProps = getInstallmentReadonlyProps(index);

          return (
            <Grid item xs={12} key={String(field.id)}>
              <InstallmentItem
                index={index}
                field={
                  field as unknown as FieldArrayWithId<
                    T,
                    FieldArrayPath<T>,
                    'id'
                  >
                }
                control={control}
                errors={errors}
                isSubmitted={isSubmitted}
                validators={validationFunctions}
                fieldNamePrefix={fieldNamePrefix}
                disabled={disabled}
                trigger={trigger}
                getValues={getValues}
                setValue={setValue}
                onRemove={
                  index >= MIN_INSTALLMENTS && !isEditing
                    ? removeInstallment
                    : undefined
                }
                flagMandatoryDueDate={flagMandatoryDueDate}
                isEditing={isEditing}
                readonlyProps={readonlyProps}
                shouldShowErrors={shouldShowErrors}
                submissionCount={submissionCount}
                existingInstallments={existingInstallments}
              />
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          id="installment-add-button"
          data-testid="installment-add-button"
          startIcon={<Add />}
          onClick={addInstallment}
          disabled={isMaxInstallments || disabled || isEditing}
          color="primary"
          sx={{ textTransform: 'none' }}
        >
          {t('debtPositionCreateWizard.step3.installments.addInstallment')}
        </Button>
        {isMaxInstallments && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ml: 2, alignSelf: 'center' }}
          >
            {t(
              'debtPositionCreateWizard.step3.installments.maxInstallmentsReached'
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default InstallmentField;
