import { Fragment } from 'react';
import type { Control, Path, FieldValues, PathValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { ErrorMessage } from './ErrorMessage';

import FormControl from '@mui/material/FormControl';
import FormControlLabel, {
  type FormControlLabelProps
} from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup, { type RadioGroupProps } from '@mui/material/RadioGroup';

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
  divider,
  formControlLabelProps,
  ...props
}: _ControlledRadioGroupProps<T>) => {
  const labelId = `${name}-label`;

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
          {label && (
            <FormLabel
              component="legend"
              id={labelId}
              sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}
            >
              {label}
            </FormLabel>
          )}
          {/* aria-label / aria-labelledby passed by the caller take precedence */}
          <RadioGroup
            {...field}
            value={field.value ?? ''}
            aria-labelledby={label ? labelId : undefined}
            {...props}
          >
            {options.map(({ value, label }, index) => (
              <Fragment key={String(value)}>
                {divider && index > 0 ? divider : null}
                <FormControlLabel
                  value={value}
                  control={<Radio />}
                  label={label}
                  {...formControlLabelProps}
                />
              </Fragment>
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
