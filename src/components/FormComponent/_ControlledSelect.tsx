import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent, SelectProps } from '../FormComponent';
import { SelectOptions } from './_Select';
import { UseQueryResult } from '@tanstack/react-query';

export type _ControlledSelectProps<T extends FieldValues> = SelectProps & {
  name: Path<T>;
  control: Control<T>;
  label: string;
  onChange?: (value: string) => void;
  fetchFn?: () => UseQueryResult<SelectOptions>;
  disabled?: boolean;
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  control,
  fetchFn,
  ...props
}: _ControlledSelectProps<T>) => {
  const options = fetchFn
    ? fetchFn()
    : { data: props.options, isLoading: false };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState }) => (
        <FormComponent.Select
          forwardRef={ref}
          id={name}
          required
          disabled={
            props.disabled || options.isLoading || !options.data?.length
          }
          options={options?.data}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          {...field}
          {...props}
        />
      )}
    />
  );
};
