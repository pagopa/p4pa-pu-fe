import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent, TextFieldProps } from '../FormComponent';
import { ErrorMessage } from './ErrorMessage';
import { AmountFieldProps } from './_AmountField';

export type _ControlledAmountFieldProps<T extends AmountFieldProps> =
  TextFieldProps & {
    name: Path<T>;
    control: Control<T>;
  };

export const _ControlledAmountField = <T extends AmountFieldProps>({
  name,
  control,
  ...props
}: _ControlledAmountFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { ref, ...field }, fieldState }) => (
      <FormComponent.AmountField
        forwardRef={ref}
        id={name}
        noAdornment={!props?.adornment}
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
