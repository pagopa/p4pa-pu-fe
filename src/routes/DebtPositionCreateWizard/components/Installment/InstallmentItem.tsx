import { Box, Grid, IconButton, Typography } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  Path,
  FieldArrayPath
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useInstallmentBeneficiaryManagement } from '../../../../hooks/useInstallmentBeneficiaryManagement';
import AmountField from './AmountField';
import DateField from './DateField';
import RemittanceField from './RemittanceField';
import BeneficiaryControl from './BeneficiaryControl';

/**
 * Interface that defines the validation functions used in installments
 * @typedef {Object} ValidationFunctions
 * @property {Function} validateInstallmentAmount - Function to validate installment amount
 * @property {Function} validateDueDate - Function to validate due date
 * @property {Function} validateRemittance - Function to validate remittance
 */
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

/**
 * Props for the InstallmentItem component
 * @typedef {Object} InstallmentItemProps
 * @template T - Generic type extending FieldValues
 */
type InstallmentItemProps<T extends FieldValues> = {
  readonly index: number;
  readonly field: FieldArrayWithId<T, FieldArrayPath<T>, 'id'>;
  readonly control: Control<T>;
  readonly errors: FieldErrors<T>;
  readonly isSubmitted: boolean;
  readonly validators: ValidationFunctions;
  readonly fieldNamePrefix: string;
  readonly disabled?: boolean;
  readonly trigger: UseFormTrigger<T>;
  readonly getValues: UseFormGetValues<T>;
  readonly setValue: UseFormSetValue<T>;
  readonly onRemove?: (index: number) => void;
  readonly flagMandatoryDueDate?: boolean;
  readonly isEditing?: boolean;
  readonly readonlyProps?: {
    amount?: boolean;
    dueDate?: boolean;
    remittance?: boolean;
    isMultibeneficiary?: boolean;
  };
  readonly shouldShowErrors?: (componentCreationCount?: number) => boolean;
  readonly submissionCount?: number; // Still needed for creation tracking
  readonly existingInstallments?: Record<string, boolean>;
};

/**
 * Component to display and edit a single installment.
 * Manages amount, due date and associated beneficiaries,
 * with support for multi-beneficiary mode and reuse of beneficiaries from previous installments.
 */
const InstallmentItem = <T extends FieldValues>({
  index,
  field,
  control,
  errors,
  isSubmitted,
  validators,
  fieldNamePrefix,
  disabled = false,
  trigger,
  setValue,
  getValues,
  onRemove,
  flagMandatoryDueDate = true,
  isEditing,
  readonlyProps,
  shouldShowErrors,
  submissionCount = 0,
  existingInstallments = {}
}: InstallmentItemProps<T>) => {
  const { t } = useTranslation();

  // Use specialized hook for installments
  const {
    isMultibeneficiary,
    toggleMultibeneficiary,
    handleInstallmentAmountChange
  } = useInstallmentBeneficiaryManagement<T>({
    control,
    index,
    installmentsFieldNamePrefix: fieldNamePrefix,
    isSubmitted,
    getValues,
    setValue,
    trigger
  });

  // Define paths for field names
  const amountPath = `${fieldNamePrefix}.${index}.amount` as Path<T>;
  const dueDatePath = `${fieldNamePrefix}.${index}.dueDate` as Path<T>;
  const remittancePath = `${fieldNamePrefix}.${index}.remittance` as Path<T>;

  // Track if this installment was created after the final CTA was clicked
  // An installment is considered "created after submit" if:
  // 1. A submit has already happened (submissionCount > 0)
  // 2. This installment was NOT in the existingInstallments registry (wasn't present at submit time)
  const wasCreatedAfterSubmit =
    submissionCount > 0 && !existingInstallments[field.id];

  // Show errors only if installment existed at submit time
  // Pass 0 for existing installments, current submissionCount for new ones
  const componentCreationCount = wasCreatedAfterSubmit ? submissionCount : 0;
  const shouldShowFieldErrors = shouldShowErrors
    ? shouldShowErrors(componentCreationCount)
    : false;
  const fieldErrors = errors[fieldNamePrefix as keyof typeof errors];
  const amountErrors =
    shouldShowFieldErrors && fieldErrors && index in fieldErrors
      ? (
          fieldErrors as Record<
            number,
            Record<
              string,
              {
                message?: string;
                type?: string;
              }
            >
          >
        )[index]?.amount
      : undefined;
  const dueDateErrors =
    shouldShowFieldErrors && fieldErrors && index in fieldErrors
      ? (
          fieldErrors as Record<
            number,
            Record<
              string,
              {
                message?: string;
                type?: string;
              }
            >
          >
        )[index]?.dueDate
      : undefined;
  const remittanceErrors =
    shouldShowFieldErrors && fieldErrors && index in fieldErrors
      ? (
          fieldErrors as Record<
            number,
            Record<
              string,
              {
                message?: string;
                type?: string;
              }
            >
          >
        )[index]?.remittance
      : undefined;

  const handleRemove = () => {
    if (onRemove) {
      onRemove(index);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      <IconButton
        id={`installment-remove-${index}`}
        data-testid={`installment-remove-${index}`}
        size="small"
        onClick={handleRemove}
        disabled={!onRemove || isEditing}
        sx={{
          color: 'error.main',
          mr: 1,
          mt: 2
        }}
      >
        <RemoveCircleOutlineIcon />
      </IconButton>

      <Box
        data-testid={`installment-item-${index}`}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          position: 'relative',
          flexGrow: 1
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" fontWeight="bold">
                {t('debtPositionCreateWizard.step3.installments.installment')}{' '}
                {index + 1}
              </Typography>
            </Box>
          </Grid>

          {/* Amount Field - Using extracted component */}
          <Grid item xs={12}>
            <AmountField<T>
              control={control}
              amountPath={amountPath}
              index={index}
              disabled={disabled || readonlyProps?.amount}
              error={amountErrors}
              validateInstallmentAmount={validators.validateInstallmentAmount}
              trigger={trigger}
              onAmountChange={handleInstallmentAmountChange}
              showErrors={shouldShowFieldErrors}
            />
          </Grid>

          {/* Due Date Field - Using extracted component */}
          <Grid item xs={12}>
            <DateField<T>
              control={control}
              dueDatePath={dueDatePath}
              index={index}
              disabled={disabled || readonlyProps?.dueDate}
              error={dueDateErrors}
              validateDueDate={validators.validateDueDate}
              trigger={trigger}
              flagMandatoryDueDate={flagMandatoryDueDate}
              showErrors={shouldShowFieldErrors}
            />
          </Grid>

          {/* Remittance Field - Remittance field */}
          <Grid item xs={12}>
            <RemittanceField<T>
              control={control}
              remittancePath={remittancePath}
              index={index}
              disabled={disabled || readonlyProps?.remittance}
              error={remittanceErrors}
              validateRemittance={validators.validateRemittance}
              trigger={trigger}
              showErrors={shouldShowFieldErrors}
            />
          </Grid>

          {/* Beneficiary Controls - Using extracted component */}
          <BeneficiaryControl<T>
            index={index}
            control={control}
            errors={errors}
            fieldNamePrefix={fieldNamePrefix}
            disabled={disabled || readonlyProps?.isMultibeneficiary}
            getValues={getValues}
            setValue={setValue}
            trigger={trigger}
            isMultibeneficiary={isMultibeneficiary}
            toggleMultibeneficiary={toggleMultibeneficiary}
            isEditing={isEditing}
            submissionCount={submissionCount}
            existingInstallments={existingInstallments}
            installmentFieldId={field.id}
            shouldShowErrors={shouldShowErrors}
          />
        </Grid>
      </Box>
    </Box>
  );
};

export default InstallmentItem;
