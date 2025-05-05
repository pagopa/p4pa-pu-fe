import {
  Controller,
  Control,
  Path,
  FieldValues,
  PathValue
} from 'react-hook-form';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup
} from '@mui/material';

export type RadioOption<T extends FieldValues> = {
  value: PathValue<T, Path<T>>;
  label: string;
};

export type _ControlledRadioGroupProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Array<RadioOption<T>>;
  disabled?: boolean;
  required?: boolean;
};

export const _ControlledRadioGroup = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  disabled,
  required
}: _ControlledRadioGroupProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={options[0].value}
      render={({ field, fieldState }) => (
        <FormControl
          required={required}
          component="fieldset"
          error={!!fieldState.error}
          disabled={disabled}
        >
          <FormLabel
            component="legend"
            id={`${name}-label`}
            sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}
          >
            {label}
          </FormLabel>
          <RadioGroup {...field} aria-labelledby={`${name}-label`}>
            {options.map(({ value, label }) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={label}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{fieldState.error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};
