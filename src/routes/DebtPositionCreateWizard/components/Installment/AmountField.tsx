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
import {
  handleAmountInputChange,
  handleAmountInputBlur,
  formatAmountForDisplay
} from '../../../../utils/paymentUtility';

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
  showErrors?: boolean;
};

const AmountField = <T extends FieldValues>({
  control,
  amountPath,
  index,
  disabled = false,
  error,
  validateInstallmentAmount,
  trigger,
  onAmountChange,
  showErrors = true
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
          id={`installment-amount-${index}`}
          data-testid={`installment-amount-${index}`}
          fullWidth
          size="small"
          label={t('debtPositionCreateWizard.step3.installments.amount.label')}
          required
          disabled={disabled}
          value={formatAmountForDisplay(String(field.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">€</InputAdornment>,
            inputProps: {
              style: { textAlign: 'left' }
            }
          }}
          error={showErrors && !!error}
          helperText={showErrors && error?.message ? error.message : ''}
          onChange={(e) => {
            const normalizedValue = handleAmountInputChange(e.target.value);
            onAmountChange(normalizedValue);
          }}
          onBlur={(e) => {
            const value = handleAmountInputBlur(e.target.value);
            if (value !== e.target.value) {
              onAmountChange(value);
            }

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
