import { Controller, Control, FieldErrors } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import { Step2Data } from '../../../../models/DebtPositionType';

type Step2DataField = keyof Step2Data;
type NestedFieldName = `${Step2DataField}.value`;

type Step2ControlledTextFieldProps = {
  name: Step2DataField;
  control: Control<Step2Data>;
  label: string;
  isSubmitted: boolean;
  errors: FieldErrors<Step2Data>;
  onFieldChange: (fieldName: NestedFieldName, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  inputProps?: TextFieldProps['inputProps'];
  transformValue?: (value: string) => string;
  id?: string;
  'data-testid'?: string;
  margin?: 'normal' | 'dense' | 'none';
};

/**
 * Wrapper component for Step2 TextField that handles the nested {value, readonly} structure.
 * Maintains all existing logic: error handling, disabled state, value transformation, field change callback.
 */
export const Step2ControlledTextField = ({
  name,
  control,
  label,
  isSubmitted,
  errors,
  onFieldChange,
  placeholder,
  required = false,
  disabled = false,
  inputProps,
  transformValue,
  id,
  'data-testid': dataTestId,
  margin = 'normal'
}: Step2ControlledTextFieldProps) => {
  const fieldName = `${name}.value` as NestedFieldName;

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id={id}
          data-testid={dataTestId}
          label={label}
          placeholder={placeholder}
          required={required}
          fullWidth
          margin={margin}
          disabled={disabled}
          error={isSubmitted && !!errors[name]?.value}
          helperText={isSubmitted && errors[name]?.value?.message}
          onChange={(e) => {
            const value = transformValue
              ? transformValue(e.target.value)
              : e.target.value;
            field.onChange(value);
            onFieldChange(fieldName, value);
          }}
          inputProps={inputProps}
        />
      )}
    />
  );
};
