import { TextField } from '@mui/material';
import {
  Controller,
  Control,
  Path,
  FieldValues,
  UseFormTrigger
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type RemittanceFieldProps<T extends FieldValues> = {
  control: Control<T>;
  remittancePath: Path<T>;
  index: number;
  disabled?: boolean;
  error?: {
    message?: string;
  };
  validateRemittance?: (index: number, trigger: UseFormTrigger<T>) => void;
  trigger: UseFormTrigger<T>;
};

/**
 * Remittance field for the installment
 */
const RemittanceField = <T extends FieldValues>({
  control,
  remittancePath,
  index,
  disabled = false,
  error,
  validateRemittance,
  trigger
}: RemittanceFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={remittancePath}
      control={control}
      rules={{
        required: t(
          'debtPositionCreateWizard.step3.beneficiary.remittance.required'
        )
      }}
      render={({ field }) => (
        <TextField
          {...field}
          id={`installment-remittance-${index}`}
          data-testid={`installment-remittance-${index}`}
          fullWidth
          size="small"
          label={t(
            'debtPositionCreateWizard.step3.beneficiary.remittance.label'
          )}
          required
          disabled={disabled}
          value={field.value || ''}
          error={!!error}
          helperText={error?.message || ''}
          onChange={(e) => {
            field.onChange(e.target.value);
          }}
          onBlur={() => {
            if (validateRemittance) {
              setTimeout(() => {
                validateRemittance(index, trigger);
              }, 100);
            }
          }}
        />
      )}
    />
  );
};

export default RemittanceField;
