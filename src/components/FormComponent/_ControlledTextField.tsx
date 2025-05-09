import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent, TextFieldProps } from '../FormComponent';

export type _ControlledTextFieldProps<T extends FieldValues> =
  TextFieldProps & {
    name: Path<T>;
    control: Control<T>;
  };

export const _ControlledTextField = <T extends FieldValues>({
  name,
  control,
  ...props
}: _ControlledTextFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { ref, ...field }, fieldState }) => (
      <FormComponent.TextField
        forwardRef={ref}
        id={name}
        required
        noAdornment={!props?.adornment}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        {...field}
        {...props}
      />
    )}
  />
);
