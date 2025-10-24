import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { _TextField, _TextFieldProps } from './_TextField';
import { ErrorMessage } from './ErrorMessage';

export type _ControlledTextFieldProps<T extends FieldValues> =
  _TextFieldProps & {
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
      <_TextField
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
