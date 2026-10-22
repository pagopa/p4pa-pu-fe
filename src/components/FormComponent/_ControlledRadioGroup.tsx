import type { Control, Path, FieldValues, PathValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { ErrorMessage } from './ErrorMessage';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import type FormControlLabelProps from '@mui/material/FormControlLabelProps';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import type RadioGroupProps from '@mui/material/RadioGroupProps';

export type RadioOption<T extends FieldValues> = {
  value: PathValue<T, Path<T>>;
  label: string | React.ReactNode;
};

export type _ControlledRadioGroupProps<T extends FieldValues> =
  RadioGroupProps & {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    options: Array<RadioOption<T>>;
    disabled?: boolean;
    required?: boolean;
    selectFirstOption?: boolean;
    showErrorMessage?: boolean;
    divider?: React.ReactNode;
    formControlLabelProps?: Partial<FormControlLabelProps>;
  };

export const _ControlledRadioGroup = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  disabled,
  required,
  selectFirstOption = true,
  showErrorMessage = true,
  formControlLabelProps,
  ...props
}: _ControlledRadioGroupProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={selectFirstOption ? options[0].value : undefined}
      render={({ field, fieldState }) => (
        <FormControl
          required={required}
          component="fieldset"
          error={!!fieldState.error}
          disabled={disabled}
          sx={{ width: '100%' }}
        >
          <FormLabel
            component="legend"
            id={`${name}-label`}
            sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}
          >
            {label}
          </FormLabel>
          <RadioGroup
            {...field}
            value={field.value ?? ''}
            {...props}
            aria-labelledby={`${name}-label`}
          >
            {options.map(({ value, label }, index) => (
              <>
                {props.divider && index > 0 ? props.divider : null}
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={label}
                  {...formControlLabelProps}
                />
              </>
            ))}
          </RadioGroup>

          {showErrorMessage && (
            <FormHelperText>
              <ErrorMessage messageKey={fieldState.error?.message} />
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
