import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormSetValue,
  UseFormTrigger,
  Path
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InstallmentValidators } from '../../../hooks/useInstallmentManagement';
import { moneyFormat } from '../../../utils/formatters';

// Tipo per rappresentare gli errori di un campo specifico
type FieldErrorValue = {
  message?: string;
  type?: string;
};

// Tipo per gli errori di un array di campi per l'indice specificato
type IndexedFieldErrors = Record<string, FieldErrorValue>;

type InstallmentItemProps<T extends FieldValues> = {
  readonly index: number;
  readonly field: Record<string, unknown>;
  readonly control: Control<T>;
  readonly errors: FieldErrors<T>;
  readonly isSubmitted: boolean;
  readonly validators: InstallmentValidators;
  readonly fieldNamePrefix: string;
  readonly disabled?: boolean;
  readonly trigger: UseFormTrigger<T>;
  readonly getValues: UseFormGetValues<T>;
  readonly setValue: UseFormSetValue<T>;
  readonly onRemove?: (index: number) => void;
};

// Funzione per gestire la modifica del campo importo
function handleAmountChange<T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  trigger: UseFormTrigger<T>,
  fieldNamePrefix: string,
  index: number
) {
  // Accetta solo numeri, punto e virgola
  const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
  // Converti virgola in punto per la gestione numerica interna
  const normalizedValue = filteredValue.replace(',', '.');
  onChange(normalizedValue);

  // Triggerare la validazione per aggiornare il totale
  setTimeout(() => {
    console.log('handleAmountChange setTimeout');
    trigger(`${fieldNamePrefix}.${index}.amount` as Path<T>);
  }, 0);
}

// Funzione per gestire l'evento blur dell'importo
function handleAmountBlur(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (...event: Array<unknown>) => void,
  onBlur: () => void
) {
  // Formatta il valore con due decimali quando il campo perde il focus
  const value = e.target.value.replace(',', '.');
  if (value && !isNaN(parseFloat(value))) {
    const amountValue = parseFloat(value);
    // Formatta l'importo usando moneyFormat e rimuovi il simbolo € per avere solo il numero
    const formattedValue = moneyFormat(amountValue * 100, 2, 2)
      .replace('€', '')
      .trim();
    onChange(formattedValue);
  }
  onBlur();
}

/**
 * Componente che rappresenta una singola rata
 */
function InstallmentItem<T extends FieldValues>({
  index,
  control,
  errors,
  isSubmitted,
  validators,
  fieldNamePrefix,
  disabled = false,
  trigger,
  onRemove
}: InstallmentItemProps<T>) {
  const { t } = useTranslation();

  // Verifica se ci sono errori per questo campo
  const hasError = (fieldName: string): boolean => {
    if (!isSubmitted) return false;

    // Ottieni gli errori per il fieldNamePrefix
    const prefixErrors = errors[fieldNamePrefix as keyof typeof errors];
    if (!prefixErrors) return false;

    // Ottieni gli errori per l'indice specifico, se esistono
    const indexErrors = prefixErrors as unknown as Record<
      number,
      IndexedFieldErrors
    >;
    if (!indexErrors || !indexErrors[index]) return false;

    // Verifica se esiste un errore per il campo specifico
    return !!indexErrors[index][fieldName];
  };

  // Ottiene il messaggio di errore per questo campo
  const getErrorMessage = (fieldName: string): string => {
    if (!isSubmitted) return '';

    // Ottieni gli errori per il fieldNamePrefix
    const prefixErrors = errors[fieldNamePrefix as keyof typeof errors];
    if (!prefixErrors) return '';

    // Ottieni gli errori per l'indice specifico, se esistono
    const indexErrors = prefixErrors as unknown as Record<
      number,
      IndexedFieldErrors
    >;
    if (!indexErrors || !indexErrors[index]) return '';

    // Ottieni l'errore per il campo specifico
    const error = indexErrors[index][fieldName];
    return error?.message || '';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Pulsante di rimozione posizionato a sinistra del box */}
      {onRemove && (
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          sx={{
            color: 'error.main',
            mr: 1,
            mt: 2
          }}
        >
          <RemoveCircleOutlineIcon />
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
              name={`${fieldNamePrefix}.${index}.amount` as Path<T>}
              control={control}
              rules={validators.amount}
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
                  error={hasError('amount')}
                  helperText={getErrorMessage('amount')}
                  onChange={(e) =>
                    handleAmountChange(
                      e,
                      field.onChange,
                      trigger,
                      fieldNamePrefix,
                      index
                    )
                  }
                  onBlur={(e) =>
                    handleAmountBlur(e, field.onChange, field.onBlur)
                  }
                />
              )}
            />
          </Grid>

          {/* Campo Data Scadenza */}
          <Grid item xs={12}>
            <Controller
              name={`${fieldNamePrefix}.${index}.dueDate` as Path<T>}
              control={control}
              rules={validators.dueDate}
              render={({ field: { onChange, value, ...field } }) => {
                // Determina se il campo è obbligatorio dai validators
                const isRequired = !!validators.dueDate.required;

                return (
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
                        required: isRequired,
                        error: hasError('dueDate'),
                        helperText: getErrorMessage('dueDate'),
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
                    }}
                  />
                );
              }}
            />
          </Grid>

          {/* Switch per altri beneficiari */}
          <Grid item xs={12}>
            <Controller
              name={`${fieldNamePrefix}.${index}.isMultibeneficiary` as Path<T>}
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
                        field.onChange(value);
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

          {/* Qui in futuro verrà inserito il componente dei beneficiari per questa rata */}
        </Grid>
      </Box>
    </Box>
  );
}

export default InstallmentItem;
