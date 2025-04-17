import { Controller, Control, Path, FieldValues } from 'react-hook-form';
import { FormComponent } from '../FormComponent';
import { SelectOptions } from './_Select';
import { UseQueryResult } from '@tanstack/react-query';

export type _ControlledSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  onChange?: (value: string) => void;
  fetchFn: () => UseQueryResult<SelectOptions>;
};

export const _ControlledSelect = <T extends FieldValues>({
  name,
  control,
  label,
  fetchFn
}: _ControlledSelectProps<T>) => {
  const options = fetchFn();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormComponent.Select
          {...field}
          required
          label={label}
          disabled={options.isLoading || !options.data?.length}
          options={options.data}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
};
