import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { ErrorMessage } from './ErrorMessage';
import { _AmountField, AmountFieldProps } from './_AmountField';

export type _ControlledAmountFieldProps<T extends FieldValues> =
  AmountFieldProps & {
    name: Path<T>;
    control: Control<T>;
  };

export const _ControlledAmountField = <T extends FieldValues>({
  name,
  control,
  ...props
}: _ControlledAmountFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { ref, ...field }, fieldState }) => (
      <_AmountField
        forwardRef={ref}
        id={name}
        // Always show the default euro adornment unless explicitly overridden
        noAdornment={props.noAdornment}
        error={!!fieldState.error}
        helperText={<ErrorMessage messageKey={fieldState.error?.message} />}
        InputLabelProps={{
          ...props.InputLabelProps
        }}
        {...field}
        {...props}
      />
    )}
  />
);
