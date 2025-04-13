import { Box, Button, Typography, Grid, Paper } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  FieldArrayPath
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useInstallmentManagement } from '../../../hooks/useInstallmentManagement';
import InstallmentItem from './InstallmentItem';

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
};

/**
 * Componente per la gestione delle rate di pagamento
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
  onInstallmentsChange
}: InstallmentFieldProps<T>) {
  const { t } = useTranslation();

  // Usa il hook personalizzato per la gestione delle rate
  const {
    fields,
    validators,
    MIN_INSTALLMENTS,
    MAX_INSTALLMENTS,
    addInstallment,
    removeInstallment
  } = useInstallmentManagement<T>({
    control,
    fieldNamePrefix: fieldNamePrefix as FieldArrayPath<T>,
    isSubmitted,
    getValues,
    setValue,
    trigger,
    flagMandatoryDueDate,
    onInstallmentsChange: (_installments, totalAmount) => {
      // Aggiorna il campo amount solo se c'è un handler esterno
      if (onInstallmentsChange) {
        onInstallmentsChange(totalAmount);
      }
    }
  });

  // Verifica se è stato raggiunto il numero massimo di rate
  const isMaxInstallments = fields.length >= MAX_INSTALLMENTS;

  return (
    <Box
      component={Paper}
      variant="outlined"
      sx={{ p: 3, mt: 4, borderRadius: 1 }}
    >
      <Typography variant="h4" component="h3" fontWeight="bold" mb={3}>
        {t('debtPositionCreateWizard.step3.installments.title')}
      </Typography>

      <Grid container spacing={3}>
        {fields.map((field, index) => (
          <Grid item xs={12} key={field.id}>
            <InstallmentItem
              index={index}
              field={field}
              control={control}
              errors={errors}
              isSubmitted={isSubmitted}
              validators={validators}
              fieldNamePrefix={fieldNamePrefix}
              disabled={disabled}
              trigger={trigger}
              getValues={getValues}
              setValue={setValue}
              onRemove={
                index >= MIN_INSTALLMENTS ? removeInstallment : undefined
              }
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          startIcon={<Add />}
          onClick={addInstallment}
          disabled={isMaxInstallments || disabled}
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
