import { TextField, InputAdornment } from '@mui/material';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  UseFormTrigger
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createAmountValidator } from '../../../../utils/fieldValidation';

type AmountFieldProps<T extends FieldValues> = {
  control: Control<T>;
  amountPath: Path<T>;
  index: number;
  disabled?: boolean;
  error?: {
    message?: string;
  };
  validateInstallmentAmount: (
    index: number,
    trigger: UseFormTrigger<T>
  ) => void;
  trigger: UseFormTrigger<T>;
  onAmountChange: (value: string) => void;
};

const AmountField = <T extends FieldValues>({
  control,
  amountPath,
  index,
  disabled = false,
  error,
  validateInstallmentAmount,
  trigger,
  onAmountChange
}: AmountFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={amountPath}
      control={control}
      rules={createAmountValidator(t)}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          size="small"
          label={t('debtPositionCreateWizard.step3.installments.amount.label')}
          required
          disabled={disabled}
          value={field.value || ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
            inputProps: {
              style: { textAlign: 'left' }
            }
          }}
          error={!!error}
          helperText={error?.message || ''}
          onChange={(e) => {
            // Accept only numbers, dot and comma
            const filteredValue = e.target.value.replace(/[^0-9.,]/g, '');
            // Convert comma to dot for internal numeric handling
            const normalizedValue = filteredValue.replace(',', '.');
            // Use the special handler for change events
            onAmountChange(normalizedValue);
          }}
          onBlur={() => {
            // Trigger validation after losing focus
            setTimeout(() => {
              validateInstallmentAmount(index, trigger);
            }, 100);
          }}
        />
      )}
    />
  );
};

export default AmountField;
