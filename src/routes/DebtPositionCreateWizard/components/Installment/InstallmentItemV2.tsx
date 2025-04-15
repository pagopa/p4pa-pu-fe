import {
  Box,
  Grid,
  IconButton,
  Typography,
  TextField,
  Tooltip,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Control,
  Controller,
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
import { useInstallmentBeneficiaryManagementV2 } from '../../../../hooks/useInstallmentBeneficiaryManagementV2';
import BeneficiaryFieldV2 from '../Beneficiary/BeneficiaryFieldV2';
import { createAmountValidator } from '../../../../utils/fieldValidation';

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
};

/**
 * Componente per visualizzare e modificare una singola rata - Versione migliorata
 */
const InstallmentItemV2 = <T extends FieldValues>({
  index,
  control,
  errors,
  isSubmitted,
  validators,
  fieldNamePrefix,
  disabled = false,
  trigger,
  setValue,
  getValues,
  onRemove
}: InstallmentItemProps<T>) => {
  const { t } = useTranslation();

  // Utilizziamo l'hook specializzato per le rate
  const {
    isMultibeneficiary,
    toggleMultibeneficiary,
    handleInstallmentAmountChange
  } = useInstallmentBeneficiaryManagementV2<T>({
    control,
    index,
    installmentsFieldNamePrefix: fieldNamePrefix,
    isSubmitted,
    getValues,
    setValue,
    trigger
  });

  // Costruisce i percorsi dei campi con cast a Path<T>
  const amountPath = `${fieldNamePrefix}.${index}.amount` as Path<T>;
  const dueDatePath = `${fieldNamePrefix}.${index}.dueDate` as Path<T>;
  const isMultibeneficiaryPath =
    `${fieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>;

  // Accesso tipizzato agli errori
  const fieldErrors = errors[fieldNamePrefix as keyof typeof errors];
  const amountErrors =
    fieldErrors && index in fieldErrors
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
    fieldErrors && index in fieldErrors
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

  const handleRemove = () => {
    if (onRemove) {
      onRemove(index);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Pulsante di rimozione posizionato a sinistra del box */}
      {onRemove && (
        <IconButton
          size="small"
          onClick={handleRemove}
          sx={{
            color: 'error.main',
            mr: 1,
            mt: 2
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      )}

      <Box
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

          {/* Campo Importo */}
          <Grid item xs={12}>
            <Controller
              name={amountPath}
              control={control}
              rules={createAmountValidator(t)}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label={t(
                    'debtPositionCreateWizard.step3.installments.amount.label'
                  )}
                  required
                  disabled={disabled}
                  value={field.value || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                    inputProps: {
                      style: { textAlign: 'left' }
                    }
                  }}
                  error={!!amountErrors}
                  helperText={amountErrors?.message || ''}
                  onChange={(e) => {
                    // Accetta solo numeri, punto e virgola
                    const filteredValue = e.target.value.replace(
                      /[^0-9.,]/g,
                      ''
                    );
                    // Converti virgola in punto per la gestione numerica interna
                    const normalizedValue = filteredValue.replace(',', '.');
                    // Usa il nuovo handler che gestisce la validazione
                    handleInstallmentAmountChange(normalizedValue);
                  }}
                  onBlur={() => {
                    // Trigger validazione dopo la perdita del focus
                    setTimeout(() => {
                      validators.validateInstallmentAmount(index, trigger);
                    }, 0);
                  }}
                />
              )}
            />
          </Grid>

          {/* Campo Data Scadenza */}
          <Grid item xs={12}>
            <Controller
              name={dueDatePath}
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <DatePicker
                  {...field}
                  value={value || null}
                  label={t(
                    'debtPositionCreateWizard.step3.installments.dueDate.label'
                  )}
                  disabled={disabled}
                  minDate={new Date()}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!dueDateErrors,
                      helperText: dueDateErrors?.message || '',
                      size: 'small'
                    },
                    actionBar: {
                      actions: ['clear']
                    },
                    field: {
                      clearable: true,
                      onClear: () => onChange(null)
                    }
                  }}
                  onChange={(date) => {
                    onChange(date);
                    // Trigger validazione dopo il cambio
                    setTimeout(() => {
                      validators.validateDueDate(index, trigger);
                    }, 0);
                  }}
                />
              )}
            />
          </Grid>

          {/* Switch per altri beneficiari */}
          <Grid item xs={12}>
            <Controller
              name={isMultibeneficiaryPath}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      {...field}
                      checked={!!field.value}
                      disabled={disabled}
                      onChange={(e) => {
                        const value = e.target.checked;
                        // Usiamo il nostro handler specializzato
                        toggleMultibeneficiary(value);
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2">
                        {t(
                          'debtPositionCreateWizard.step3.installments.otherBeneficiaries'
                        )}
                      </Typography>
                    </Box>
                  }
                />
              )}
            />
          </Grid>

          {/* Componente BeneficiaryField - visibile solo quando isMultibeneficiary è true */}
          {isMultibeneficiary && (
            <Grid item xs={12} mt={1}>
              <BeneficiaryFieldV2
                control={control}
                errors={errors}
                isSubmitted={isSubmitted}
                totalAmount={getValues(amountPath) || ''}
                fieldNamePrefix={
                  `${fieldNamePrefix}.${index}.beneficiaries` as any
                }
                disabled={disabled}
                setValue={setValue}
                getValues={getValues}
                trigger={trigger}
                onToggleMultibeneficiary={toggleMultibeneficiary}
                isInsideInstallment={true}
                installmentIndex={index}
                installmentsFieldNamePrefix={fieldNamePrefix}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default InstallmentItemV2;
