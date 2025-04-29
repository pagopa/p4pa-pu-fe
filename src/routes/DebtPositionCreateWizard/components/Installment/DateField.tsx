import {
  Controller,
  Control,
  Path,
  FieldValues,
  UseFormTrigger
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type DateFieldProps<T extends FieldValues> = {
  control: Control<T>;
  dueDatePath: Path<T>;
  index: number;
  disabled?: boolean;
  error?: {
    message?: string;
  };
  validateDueDate: (index: number, trigger: UseFormTrigger<T>) => void;
  trigger: UseFormTrigger<T>;
  flagMandatoryDueDate?: boolean;
};

const DateField = <T extends FieldValues>({
  control,
  dueDatePath,
  index,
  disabled = false,
  validateDueDate,
  trigger,
  flagMandatoryDueDate = true
}: DateFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <Controller
      name={dueDatePath}
      control={control}
      rules={{
        required: flagMandatoryDueDate
          ? t('debtPositionCreateWizard.step3.installments.dueDate.required')
          : false,
        validate: (value: unknown) => {
          if (!flagMandatoryDueDate && !value) {
            return true;
          }
          const timestamp = value ? new Date(value as Date).getTime() : NaN;
          if (!isNaN(timestamp)) {
            return true;
          }
          return t('debtPositionCreateWizard.step3.dueDate.invalid');
        }
      }}
      render={({
        field: { onChange, value, ...field },
        fieldState: { error }
      }) => (
        <DatePicker
          {...field}
          value={value || null}
          label={t('debtPositionCreateWizard.step3.installments.dueDate.label')}
          disabled={disabled}
          minDate={new Date()}
          format="dd/MM/yyyy"
          slotProps={{
            textField: {
              fullWidth: true,
              required: flagMandatoryDueDate,
              error: !!error,
              helperText: error?.message || '',
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
            // Trigger validation after change
            setTimeout(() => {
              validateDueDate(index, trigger);
            }, 0);
          }}
        />
      )}
    />
  );
};

export default DateField;
