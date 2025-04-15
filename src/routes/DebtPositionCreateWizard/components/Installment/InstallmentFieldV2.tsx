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
import { useInstallmentManagementV2 } from '../../../../hooks/useInstallmentManagementV2';
import InstallmentItemV2 from './InstallmentItemV2';

// Aggiorna il tipo per corrispondere a quanto effettivamente fornito
export type ValidationFunctions = {
  validateInstallmentAmount: <T extends FieldValues>(
    index: number,
    trigger: UseFormTrigger<T>
  ) => void;
  validateDueDate: <T extends FieldValues>(
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
};

/**
 * Componente per la gestione delle rate di pagamento - Versione migliorata
 * Mantiene la stessa UI ma utilizza gli hook con reducer per una gestione dello stato migliore
 */
function InstallmentFieldV2<T extends FieldValues>({
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

  console.log(
    '[FIELD-DEBUG] InstallmentFieldV2 rendering, fieldNamePrefix:',
    fieldNamePrefix
  );

  // Usa il hook migliorato per la gestione delle rate
  const {
    fields,
    MIN_INSTALLMENTS,
    MAX_INSTALLMENTS,
    addInstallment,
    removeInstallment
  } = useInstallmentManagementV2<T>({
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
        console.log(
          '[FIELD-DEBUG] onInstallmentsChange chiamato, totalAmount:',
          totalAmount
        );
        onInstallmentsChange(totalAmount);
      }
    }
  });

  console.log(
    '[FIELD-DEBUG] fields ricevuti da useInstallmentManagementV2:',
    fields.length
  );

  // Verifica se è stato raggiunto il numero massimo di rate
  const isMaxInstallments = fields.length >= MAX_INSTALLMENTS;

  // Crea un adattatore per i validatori
  const createValidationFunctions = () => {
    return {
      validateInstallmentAmount: <U extends FieldValues>(
        index: number,
        triggerFn: UseFormTrigger<U>
      ) => {
        // Triggera la validazione dell'importo usando il percorso completo
        triggerFn(`${fieldNamePrefix}.${index}.amount` as Path<U>);
      },
      validateDueDate: <U extends FieldValues>(
        index: number,
        triggerFn: UseFormTrigger<U>
      ) => {
        // Triggera la validazione della data usando il percorso completo
        triggerFn(`${fieldNamePrefix}.${index}.dueDate` as Path<U>);
      }
    };
  };

  // Crea le funzioni di validazione una sola volta
  const validationFunctions = createValidationFunctions();

  return (
    <Box component={Paper} sx={{ p: 3, mt: 4, borderRadius: 1 }}>
      <Typography variant="h4" component="h3" fontWeight="bold" mb={3}>
        {t('debtPositionCreateWizard.step3.installments.title')}
      </Typography>

      {/* Debug: Mostra il numero di rate */}
      <Typography variant="caption" color="textSecondary">
        DEBUG: {fields.length} rate
      </Typography>

      <Grid container spacing={3}>
        {fields.map((field, index) => (
          <Grid item xs={12} key={String(field.id)}>
            <InstallmentItemV2
              index={index}
              field={
                field as unknown as FieldArrayWithId<T, FieldArrayPath<T>, 'id'>
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
                index >= MIN_INSTALLMENTS ? removeInstallment : undefined
              }
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
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

export default InstallmentFieldV2;
